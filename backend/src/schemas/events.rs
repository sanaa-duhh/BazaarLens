use serde::{Deserialize, Serialize};

/// `POST /api/events/simulate` request body.
#[derive(Debug, Deserialize)]
pub struct SimulateEventRequest {
    pub product_id: String,
    pub event_type: String,
    /// Optional additional context (e.g. `{ "drop_pct": 15 }`).
    #[serde(default)]
    pub event_data: Option<serde_json::Value>,
}

/// Returned immediately — strategy + push run in the background.
#[derive(Debug, Serialize)]
pub struct SimulateEventResponse {
    pub event_id: String,
    pub triggered_at: String,
}
