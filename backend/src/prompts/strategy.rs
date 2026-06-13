/// Model used for strategy generation — DeepSeek Prover V2 for structured reasoning.
pub const STRATEGY_MODEL: &str = "deepseek/deepseek-v4-pro";

/// Builds the multi-perspective strategy prompt. Three AI advisors respond in one call,
/// then give a unified final decision. The word "JSON" and an explicit schema are
/// required for OpenRouter's `json_object` response format.
pub fn build(product_name: &str, event_type: &str, event_data: &str) -> String {
    let event_description = describe_event(event_type, event_data);
    format!(
        "You are a business strategy AI advising a small-business seller in India. \
         A market event has just occurred. Respond as three specialist advisors, \
         then give one unified final recommendation. \
         Be specific, urgent, and action-oriented. Use ₹ where citing prices.\n\n\
         Product: {product_name}\n\
         Event: {event_type} — {event_description}\n\n\
         Respond with ONLY valid JSON matching this exact schema:\n\
         {{\n\
         \x20 \"marketing_ai\": {{\n\
         \x20   \"opinion\": \"marketing perspective on this event\",\n\
         \x20   \"action\": \"specific marketing action to take\",\n\
         \x20   \"urgency\": \"high|medium|low\"\n\
         \x20 }},\n\
         \x20 \"product_ai\": {{\n\
         \x20   \"opinion\": \"product/inventory perspective\",\n\
         \x20   \"action\": \"specific product or inventory action\",\n\
         \x20   \"urgency\": \"high|medium|low\"\n\
         \x20 }},\n\
         \x20 \"sales_ai\": {{\n\
         \x20   \"opinion\": \"sales and pricing perspective\",\n\
         \x20   \"action\": \"specific pricing or sales action\",\n\
         \x20   \"urgency\": \"high|medium|low\"\n\
         \x20 }},\n\
         \x20 \"final_decision\": {{\n\
         \x20   \"recommended_action\": \"the single most important action to take right now\",\n\
         \x20   \"reasoning\": \"why this is the right move given the event\",\n\
         \x20   \"risk_assessment\": \"main risk if no action is taken\",\n\
         \x20   \"time_sensitivity\": \"act within X hours/days\"\n\
         \x20 }}\n\
         }}\n\
         urgency must be exactly one of: high, medium, low."
    )
}

fn describe_event(event_type: &str, event_data: &str) -> String {
    match event_type {
        "price_drop" => format!("A competitor dropped their price. Details: {event_data}"),
        "demand_spike" => {
            format!("Search and purchase demand spiked sharply. Details: {event_data}")
        }
        "sentiment_crash" => {
            format!("Customer reviews dropped significantly. Details: {event_data}")
        }
        "stock_outage" => {
            format!("A top competitor ran out of stock. Details: {event_data}")
        }
        _ => format!("Market event occurred. Details: {event_data}"),
    }
}
