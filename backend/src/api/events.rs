use std::sync::Arc;

use axum::{extract::State, routing::post, Json, Router};
use tracing::info;
use uuid::Uuid;

use crate::error::AppError;
use crate::schemas::events::{SimulateEventRequest, SimulateEventResponse};
use crate::schemas::ApiResponse;
use crate::services::event_simulator::{self, BackgroundTask};
use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().route("/api/events/simulate", post(simulate))
}

/// Writes the event row and returns immediately (<200ms); strategy generation and push
/// notifications run in a detached Tokio task so the HTTP caller isn't blocked.
async fn simulate(
    State(state): State<Arc<AppState>>,
    Json(req): Json<SimulateEventRequest>,
) -> Result<Json<ApiResponse<SimulateEventResponse>>, AppError> {
    // Verify product exists.
    let product: Option<(String,)> = sqlx::query_as("SELECT name FROM products WHERE id = ?")
        .bind(&req.product_id)
        .fetch_optional(&state.db)
        .await?;

    let (product_name,) =
        product.ok_or_else(|| AppError::NotFound("PRODUCT_NOT_FOUND".to_string()))?;

    let valid_types = [
        "price_drop",
        "demand_spike",
        "sentiment_crash",
        "stock_outage",
    ];
    if !valid_types.contains(&req.event_type.as_str()) {
        return Err(AppError::BadRequest(format!(
            "event_type must be one of: {}",
            valid_types.join(", ")
        )));
    }

    let event_id = Uuid::new_v4().to_string();
    let triggered_at = chrono::Utc::now().to_rfc3339();
    let event_data = req
        .event_data
        .unwrap_or_else(|| event_simulator::default_event_data(&req.event_type));
    let event_data_str = event_data.to_string();

    sqlx::query(
        "INSERT INTO market_events (id, product_id, event_type, event_data, triggered_at) \
         VALUES (?, ?, ?, ?, ?)",
    )
    .bind(&event_id)
    .bind(&req.product_id)
    .bind(&req.event_type)
    .bind(&event_data_str)
    .bind(&triggered_at)
    .execute(&state.db)
    .await?;

    info!(event_id = %event_id, event_type = %req.event_type, "event simulated, background task starting");

    tokio::spawn(event_simulator::run_background(BackgroundTask {
        pool: state.db.clone(),
        llm: state.llm.clone(),
        push: state.push.clone(),
        event_id: event_id.clone(),
        product_id: req.product_id.clone(),
        product_name,
        event_type: req.event_type.clone(),
        event_data: event_data_str,
    }));

    Ok(Json(ApiResponse::ok(SimulateEventResponse {
        event_id,
        triggered_at,
    })))
}
