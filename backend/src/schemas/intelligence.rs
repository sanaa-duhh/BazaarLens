use serde::{Deserialize, Serialize};

/// `POST /api/intelligence` request body.
#[derive(Debug, Deserialize)]
pub struct IntelligenceRequest {
    pub product_id: String,
}

/// Shape the LLM must return. Validated by deserializing the model's JSON into this
/// struct — a parse failure means the model broke contract and we surface an error.
#[derive(Debug, Deserialize)]
pub struct IntelligenceCardLlmResponse {
    pub pricing_insight: String,
    pub review_insight: String,
    pub market_insight: String,
    pub recommendation: String,
    pub recommendation_level: String,
    #[serde(default)]
    pub confidence: Option<f64>,
}

/// Intelligence card returned to the client, serialized as the `data` field of the
/// API envelope. `cached` reports whether this card came from SQLite vs. fresh LLM.
#[derive(Debug, Clone, Serialize)]
pub struct IntelligenceCardResponse {
    pub id: String,
    pub product_id: String,
    pub pricing_insight: String,
    pub review_insight: String,
    pub market_insight: String,
    pub recommendation: String,
    pub recommendation_level: String,
    pub confidence: Option<f64>,
    pub model_used: Option<String>,
    pub cached: bool,
    pub generated_at: String,
}
