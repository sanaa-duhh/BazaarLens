use std::sync::Arc;

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    routing::{delete, get, post},
    Json, Router,
};
use sqlx::SqlitePool;
use tracing::info;
use uuid::Uuid;

use crate::error::AppError;
use crate::schemas::scan::ProductResponse;
use crate::schemas::watchlist::{
    WatchlistAddRequest, WatchlistAddResponse, WatchlistItemResponse, WatchlistListResponse,
};
use crate::schemas::ApiResponse;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/api/watchlist", post(add))
        .route("/api/watchlist", get(list))
        .route("/api/watchlist/:product_id", delete(remove))
}

/// Extracts the required `X-Device-Id` header, returning `MissingDeviceId` if absent.
/// `pub(crate)` so push and event routes can reuse the same helper.
pub(crate) fn device_id(headers: &HeaderMap) -> Result<String, AppError> {
    headers
        .get("x-device-id")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .filter(|s| !s.is_empty())
        .ok_or(AppError::MissingDeviceId)
}

/// Adds a product to the watchlist. Idempotent via `INSERT OR IGNORE`; the
/// `already_watching` flag tells the client whether the row already existed.
async fn add(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<WatchlistAddRequest>,
) -> Result<Json<ApiResponse<WatchlistAddResponse>>, AppError> {
    let did = device_id(&headers)?;

    if req.product_id.is_empty() {
        return Err(AppError::BadRequest("product_id is required".to_string()));
    }

    // Verify the product exists before adding to watchlist.
    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM products WHERE id = ?)")
        .bind(&req.product_id)
        .fetch_one(&state.db)
        .await?;

    if !exists {
        return Err(AppError::NotFound("PRODUCT_NOT_FOUND".to_string()));
    }

    let rows_affected =
        sqlx::query("INSERT OR IGNORE INTO watchlist (id, device_id, product_id) VALUES (?, ?, ?)")
            .bind(Uuid::new_v4().to_string())
            .bind(&did)
            .bind(&req.product_id)
            .execute(&state.db)
            .await?
            .rows_affected();

    let already_watching = rows_affected == 0;
    info!(device_id = %did, product_id = %req.product_id, already_watching, "watchlist add");

    Ok(Json(ApiResponse::ok(WatchlistAddResponse {
        already_watching,
    })))
}

/// Returns all watched products for the device, joined with product details and the
/// latest recommendation level from the intelligence card.
async fn list(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<WatchlistListResponse>>, AppError> {
    let did = device_id(&headers)?;
    let items = fetch_watchlist(&state.db, &did).await?;
    Ok(Json(ApiResponse::ok(WatchlistListResponse { items })))
}

/// Removes a product from the watchlist. Returns 404 if the device was not watching it.
async fn remove(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(product_id): Path<String>,
) -> Result<Json<ApiResponse<()>>, AppError> {
    let did = device_id(&headers)?;

    let rows_affected = sqlx::query("DELETE FROM watchlist WHERE device_id = ? AND product_id = ?")
        .bind(&did)
        .bind(&product_id)
        .execute(&state.db)
        .await?
        .rows_affected();

    if rows_affected == 0 {
        return Err(AppError::NotFound("NOT_WATCHING".to_string()));
    }

    info!(device_id = %did, %product_id, "watchlist remove");
    Ok(Json(ApiResponse::ok(())))
}

#[derive(sqlx::FromRow)]
struct WatchlistRow {
    watch_id: String,
    product_id: String,
    added_at: String,
    // product fields
    p_name: String,
    p_barcode: Option<String>,
    p_brand: Option<String>,
    p_category: Option<String>,
    p_image_url: Option<String>,
    p_source: String,
    p_created_at: String,
    // intelligence card (LEFT JOIN — may be null)
    recommendation_level: Option<String>,
}

async fn fetch_watchlist(
    pool: &SqlitePool,
    device_id: &str,
) -> Result<Vec<WatchlistItemResponse>, AppError> {
    let rows = sqlx::query_as::<_, WatchlistRow>(
        "SELECT
            w.id          AS watch_id,
            w.product_id,
            w.added_at,
            p.name        AS p_name,
            p.barcode     AS p_barcode,
            p.brand       AS p_brand,
            p.category    AS p_category,
            p.image_url   AS p_image_url,
            p.source      AS p_source,
            p.created_at  AS p_created_at,
            ic.recommendation_level
         FROM watchlist w
         JOIN products p ON p.id = w.product_id
         LEFT JOIN intelligence_cards ic ON ic.product_id = w.product_id
         WHERE w.device_id = ?
         ORDER BY w.added_at DESC",
    )
    .bind(device_id)
    .fetch_all(pool)
    .await?;

    Ok(rows.into_iter().map(row_to_item).collect())
}

fn row_to_item(r: WatchlistRow) -> WatchlistItemResponse {
    WatchlistItemResponse {
        id: r.watch_id,
        product_id: r.product_id.clone(),
        added_at: r.added_at,
        product: ProductResponse {
            id: r.product_id,
            barcode: r.p_barcode,
            name: r.p_name,
            brand: r.p_brand,
            category: r.p_category,
            image_url: r.p_image_url,
            source: r.p_source,
            cached: true,
            confidence: None,
            created_at: r.p_created_at,
        },
        recommendation_level: r.recommendation_level,
    }
}
