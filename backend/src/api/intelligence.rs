use std::sync::Arc;

use axum::{extract::State, routing::post, Json, Router};
use sqlx::SqlitePool;
use tracing::info;
use uuid::Uuid;

use crate::error::AppError;
use crate::prompts::intelligence::{self, INTELLIGENCE_MODEL};
use crate::schemas::intelligence::{
    IntelligenceCardLlmResponse, IntelligenceCardResponse, IntelligenceRequest,
};
use crate::schemas::ApiResponse;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/intelligence", post(generate))
}

/// Generates (or returns a cached) intelligence card for a product. The card is 1:1
/// with a product; the second request for the same product is served from SQLite.
async fn generate(
    State(state): State<Arc<AppState>>,
    Json(req): Json<IntelligenceRequest>,
) -> Result<Json<ApiResponse<IntelligenceCardResponse>>, AppError> {
    let product = fetch_product(&state.db, &req.product_id)
        .await?
        .ok_or_else(|| AppError::NotFound("PRODUCT_NOT_FOUND".to_string()))?;

    if let Some(cached) = cache_get(&state.db, &req.product_id).await? {
        info!(product_id = %req.product_id, "intelligence cache hit");
        return Ok(Json(ApiResponse::ok(cached)));
    }

    let prompt = intelligence::build(
        &product.name,
        product.brand.as_deref(),
        product.category.as_deref(),
    );
    let raw = state.llm.call_text(&prompt, INTELLIGENCE_MODEL).await?;
    let parsed: IntelligenceCardLlmResponse = serde_json::from_value(raw).map_err(|e| {
        AppError::LlmError(format!("INTELLIGENCE_GENERATION_FAILED: bad schema ({e})"))
    })?;

    let card = persist(&state.db, &req.product_id, parsed).await?;
    info!(product_id = %req.product_id, level = %card.recommendation_level, "intelligence generated");
    Ok(Json(ApiResponse::ok(card)))
}

struct ProductRow {
    name: String,
    brand: Option<String>,
    category: Option<String>,
}

async fn fetch_product(pool: &SqlitePool, id: &str) -> Result<Option<ProductRow>, AppError> {
    let row = sqlx::query_as::<_, (String, Option<String>, Option<String>)>(
        "SELECT name, brand, category FROM products WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|(name, brand, category)| ProductRow {
        name,
        brand,
        category,
    }))
}

async fn cache_get(
    pool: &SqlitePool,
    product_id: &str,
) -> Result<Option<IntelligenceCardResponse>, AppError> {
    let row = sqlx::query_as::<_, CardRow>(
        "SELECT id, product_id, pricing_insight, review_insight, market_insight, \
         recommendation, recommendation_level, confidence, model_used, generated_at \
         FROM intelligence_cards WHERE product_id = ?",
    )
    .bind(product_id)
    .fetch_optional(pool)
    .await?;
    Ok(row.map(|r| r.into_response(true)))
}

/// Inserts the generated card. `INSERT OR IGNORE` lets the `UNIQUE(product_id)`
/// constraint absorb a race where two requests generate at once — the first wins,
/// and we still return the freshly generated content to this caller.
async fn persist(
    pool: &SqlitePool,
    product_id: &str,
    card: IntelligenceCardLlmResponse,
) -> Result<IntelligenceCardResponse, AppError> {
    let id = Uuid::new_v4().to_string();
    let generated_at = chrono::Utc::now().to_rfc3339();
    let level = normalize_level(&card.recommendation_level);
    let confidence = card.confidence.map(|c| c.clamp(0.0, 1.0));

    sqlx::query(
        "INSERT OR IGNORE INTO intelligence_cards \
         (id, product_id, pricing_insight, review_insight, market_insight, recommendation, \
          recommendation_level, confidence, model_used, generated_at) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(product_id)
    .bind(&card.pricing_insight)
    .bind(&card.review_insight)
    .bind(&card.market_insight)
    .bind(&card.recommendation)
    .bind(&level)
    .bind(confidence)
    .bind(INTELLIGENCE_MODEL)
    .bind(&generated_at)
    .execute(pool)
    .await?;

    Ok(IntelligenceCardResponse {
        id,
        product_id: product_id.to_string(),
        pricing_insight: card.pricing_insight,
        review_insight: card.review_insight,
        market_insight: card.market_insight,
        recommendation: card.recommendation,
        recommendation_level: level,
        confidence,
        model_used: Some(INTELLIGENCE_MODEL.to_string()),
        cached: false,
        generated_at,
    })
}

/// Coerces the model's level to a value the DB CHECK constraint accepts.
fn normalize_level(level: &str) -> String {
    match level.trim().to_lowercase().as_str() {
        "buy" => "buy",
        "avoid" => "avoid",
        "hold" => "hold",
        _ => "watch",
    }
    .to_string()
}

#[derive(sqlx::FromRow)]
struct CardRow {
    id: String,
    product_id: String,
    pricing_insight: String,
    review_insight: String,
    market_insight: String,
    recommendation: String,
    recommendation_level: String,
    confidence: Option<f64>,
    model_used: Option<String>,
    generated_at: String,
}

impl CardRow {
    fn into_response(self, cached: bool) -> IntelligenceCardResponse {
        IntelligenceCardResponse {
            id: self.id,
            product_id: self.product_id,
            pricing_insight: self.pricing_insight,
            review_insight: self.review_insight,
            market_insight: self.market_insight,
            recommendation: self.recommendation,
            recommendation_level: self.recommendation_level,
            confidence: self.confidence,
            model_used: self.model_used,
            cached,
            generated_at: self.generated_at,
        }
    }
}
