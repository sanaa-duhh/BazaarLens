use std::sync::Arc;

use axum::{
    extract::State,
    http::HeaderMap,
    routing::{delete, post},
    Json, Router,
};
use tracing::info;
use uuid::Uuid;

use crate::api::watchlist::device_id;
use crate::error::AppError;
use crate::schemas::push::{PushSubscribeRequest, PushSubscribeResponse};
use crate::schemas::ApiResponse;
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/api/push/subscribe", post(subscribe))
        .route("/api/push/subscribe", delete(unsubscribe))
}

/// Upserts a push subscription for the device. Uses `INSERT OR REPLACE` so a
/// refreshed subscription (new endpoint from the browser) overwrites the old one.
async fn subscribe(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Json(req): Json<PushSubscribeRequest>,
) -> Result<Json<ApiResponse<PushSubscribeResponse>>, AppError> {
    let did = device_id(&headers)?;

    sqlx::query(
        "INSERT OR REPLACE INTO push_subscriptions \
         (id, device_id, endpoint, p256dh, auth_key, is_active) \
         VALUES (?, ?, ?, ?, ?, 1)",
    )
    .bind(Uuid::new_v4().to_string())
    .bind(&did)
    .bind(&req.endpoint)
    .bind(&req.p256dh)
    .bind(&req.auth)
    .execute(&state.db)
    .await?;

    info!(device_id = %did, "push subscription saved");
    Ok(Json(ApiResponse::ok(PushSubscribeResponse {
        subscribed: true,
    })))
}

/// Removes the device's push subscription (user disabled alerts).
async fn unsubscribe(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<()>>, AppError> {
    let did = device_id(&headers)?;

    sqlx::query("DELETE FROM push_subscriptions WHERE device_id = ?")
        .bind(&did)
        .execute(&state.db)
        .await?;

    info!(device_id = %did, "push subscription removed");
    Ok(Json(ApiResponse::ok(())))
}
