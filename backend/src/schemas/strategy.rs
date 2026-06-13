use serde::{Deserialize, Serialize};

/// `POST /api/strategy` request body.
#[derive(Debug, Deserialize)]
pub struct StrategyRequest {
    pub event_id: String,
}

/// Shape the LLM must return for the strategy call.
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct AiOpinion {
    pub opinion: String,
    pub action: String,
    pub urgency: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct FinalDecision {
    pub recommended_action: String,
    pub reasoning: String,
    pub risk_assessment: String,
    pub time_sensitivity: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct StrategyLlmResponse {
    pub marketing_ai: AiOpinion,
    pub product_ai: AiOpinion,
    pub sales_ai: AiOpinion,
    pub final_decision: FinalDecision,
}

/// Full strategy response returned to the client.
#[derive(Debug, Serialize)]
pub struct StrategyResponse {
    pub id: String,
    pub event_id: String,
    pub marketing_ai: AiOpinion,
    pub product_ai: AiOpinion,
    pub sales_ai: AiOpinion,
    pub final_decision: FinalDecision,
    pub model_used: Option<String>,
    pub cached: bool,
    pub generated_at: String,
    pub event: EventSummary,
}

#[derive(Debug, Serialize)]
pub struct EventSummary {
    pub id: String,
    pub product_id: String,
    pub event_type: String,
    pub event_data: serde_json::Value,
    pub triggered_at: String,
}
