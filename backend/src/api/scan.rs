use std::sync::Arc;

use axum::{extract::State, routing::post, Json, Router};
use serde_json::Value;
use tracing::info;

use crate::error::AppError;
use crate::schemas::scan::{BarcodeScanRequest, ImageScanRequest, ProductResponse};
use crate::schemas::ApiResponse;
use crate::services::product_lookup::{self, ProductData};
use crate::AppState;

/// Reject obviously decoded payloads larger than ~10 MB (estimated from base64 length).
const MAX_IMAGE_BYTES: usize = 10 * 1024 * 1024;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/api/scan/barcode", post(scan_barcode))
        .route("/api/scan/image", post(scan_image))
}

/// Barcode lookup — cache, then Open Food Facts, then UPC Item DB. No vision LLM.
async fn scan_barcode(
    State(state): State<Arc<AppState>>,
    Json(req): Json<BarcodeScanRequest>,
) -> Result<Json<ApiResponse<ProductResponse>>, AppError> {
    let barcode = req.barcode.trim();
    if !is_valid_barcode(barcode) {
        return Err(AppError::BadRequest("INVALID_BARCODE".to_string()));
    }

    match state.product_lookup.lookup(&state.db, barcode).await? {
        Some(product) => {
            info!(barcode, source = %product.source, cached = product.cached, "barcode identified");
            Ok(Json(ApiResponse::ok(product)))
        }
        None => Err(AppError::NotFound("PRODUCT_NOT_FOUND".to_string())),
    }
}

/// Image identification via the Minimax M3 vision model. Saved with source `vision_llm`.
async fn scan_image(
    State(state): State<Arc<AppState>>,
    Json(req): Json<ImageScanRequest>,
) -> Result<Json<ApiResponse<ProductResponse>>, AppError> {
    let payload = strip_data_url(&req.image_base64);
    if payload.is_empty() || estimated_bytes(payload) > MAX_IMAGE_BYTES {
        return Err(AppError::BadRequest("IMAGE_UNPROCESSABLE".to_string()));
    }

    let prompt = vision_prompt(req.hint.as_deref());
    let result = state.llm.call_vision(&req.image_base64, &prompt).await?;

    let name = str_field(&result, "name").ok_or_else(|| {
        AppError::LlmError("vision model did not return a product name".to_string())
    })?;
    let confidence = result
        .get("confidence")
        .and_then(Value::as_f64)
        .unwrap_or(0.5)
        .clamp(0.0, 1.0);

    let data = ProductData {
        barcode: None,
        name,
        brand: str_field(&result, "brand"),
        category: str_field(&result, "category"),
        image_url: None,
        source: "vision_llm",
        raw: result.clone(),
    };

    let mut product = product_lookup::persist(&state.db, data).await?;
    product.confidence = Some(confidence);
    info!(name = %product.name, confidence, "image identified via vision");
    Ok(Json(ApiResponse::ok(product)))
}

/// Barcodes are 8–14 numeric digits (EAN-8 through GTIN-14).
fn is_valid_barcode(barcode: &str) -> bool {
    let len = barcode.len();
    (8..=14).contains(&len) && barcode.chars().all(|c| c.is_ascii_digit())
}

/// Strips a `data:...;base64,` prefix, returning the raw base64 segment.
fn strip_data_url(input: &str) -> &str {
    input
        .split_once("base64,")
        .map(|(_, b64)| b64)
        .unwrap_or(input)
        .trim()
}

/// Approximate decoded byte length of a base64 string (4 chars → 3 bytes).
fn estimated_bytes(b64: &str) -> usize {
    b64.len() / 4 * 3
}

fn str_field(value: &Value, key: &str) -> Option<String> {
    value
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|s| !s.is_empty())
        .map(str::to_string)
}

fn vision_prompt(hint: Option<&str>) -> String {
    let hint_line = match hint {
        Some(h) if !h.trim().is_empty() => {
            format!("\nSeller hint about the product: {}.", h.trim())
        }
        _ => String::new(),
    };
    format!(
        "You are a product identification assistant for an Indian small-business seller. \
         Identify the single most prominent retail product in the image.{hint_line}\n\n\
         Return ONLY valid JSON matching this exact schema:\n\
         {{\"name\": \"string\", \"brand\": \"string or null\", \"category\": \"string or null\", \"confidence\": 0.0}}\n\
         confidence is your certainty from 0.0 to 1.0."
    )
}
