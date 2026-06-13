//! Intelligence-card prompt. One DeepSeek call, structured JSON out (see CLAUDE.md §9).

/// Model used for intelligence generation — DeepSeek V4 (free tier on OpenRouter).
pub const INTELLIGENCE_MODEL: &str = "deepseek/deepseek-chat-v4";

/// Builds the intelligence prompt for a product. `brand`/`category` fall back to
/// "Unknown" so the model always has a complete context block. The word "JSON" and
/// an explicit schema are required for OpenRouter's `json_object` response format.
pub fn build(name: &str, brand: Option<&str>, category: Option<&str>) -> String {
    let brand = brand.unwrap_or("Unknown");
    let category = category.unwrap_or("Unknown");
    format!(
        "You are a market intelligence analyst advising small-business sellers in India \
         (Amazon, Flipkart, Meesho, local retail). Give sharp, specific, actionable insight — \
         never generic filler. Use Indian rupee (₹) figures where you cite prices.\n\n\
         Product: {name}\n\
         Brand: {brand}\n\
         Category: {category}\n\n\
         Analyse this product's market and respond with ONLY valid JSON matching this exact schema:\n\
         {{\n\
         \x20 \"pricing_insight\": \"1-2 sentences on the pricing opportunity or risk\",\n\
         \x20 \"review_insight\": \"1-2 sentences on customer sentiment and what it implies\",\n\
         \x20 \"market_insight\": \"1-2 sentences on category trend and competitive position\",\n\
         \x20 \"recommendation\": \"one specific action the seller should take now\",\n\
         \x20 \"recommendation_level\": \"buy|hold|avoid|watch\",\n\
         \x20 \"confidence\": 0.0\n\
         }}\n\
         recommendation_level must be exactly one of: buy, hold, avoid, watch. \
         confidence is your certainty from 0.0 to 1.0."
    )
}
