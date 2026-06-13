use std::time::Duration;

use serde_json::{json, Value};

use crate::error::AppError;

const OPENROUTER_URL: &str = "https://openrouter.ai/api/v1/chat/completions";
/// Minimax M3 — free vision-capable model on OpenRouter (see CLAUDE.md model table).
const VISION_MODEL: &str = "minimax/minimax-m3";

/// Thin OpenRouter chat-completions client. One shared `reqwest::Client` is reused
/// across calls. Every request forces `response_format: json_object`; callers must
/// include the word "JSON" in their prompt (an OpenRouter requirement).
#[derive(Clone)]
pub struct LlmService {
    client: reqwest::Client,
    api_key: String,
}

impl LlmService {
    pub fn new(api_key: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(30))
            .build()
            .expect("reqwest client builds with valid defaults");
        Self { client, api_key }
    }

    /// Text prompt → parsed JSON object. Used for intelligence and strategy.
    pub async fn call_text(&self, prompt: &str, model: &str) -> Result<Value, AppError> {
        let messages = json!([{ "role": "user", "content": prompt }]);
        self.complete(model, messages).await
    }

    /// Image + prompt → parsed JSON object via the vision model. The image may be a
    /// bare base64 string or a full `data:` URL; both are accepted.
    pub async fn call_vision(&self, image_b64: &str, prompt: &str) -> Result<Value, AppError> {
        let data_url = if image_b64.starts_with("data:") {
            image_b64.to_string()
        } else {
            format!("data:image/jpeg;base64,{image_b64}")
        };
        let messages = json!([{
            "role": "user",
            "content": [
                { "type": "text", "text": prompt },
                { "type": "image_url", "image_url": { "url": data_url } }
            ]
        }]);
        self.complete(VISION_MODEL, messages).await
    }

    /// Sends the request and parses the JSON content. Retries exactly once with a
    /// stricter instruction if the model returns unparseable JSON. Does not retry
    /// on timeouts or HTTP errors.
    async fn complete(&self, model: &str, mut messages: Value) -> Result<Value, AppError> {
        let content = self.request_content(model, &messages).await?;
        if let Ok(value) = serde_json::from_str::<Value>(&content) {
            return Ok(value);
        }

        if let Some(arr) = messages.as_array_mut() {
            arr.push(json!({
                "role": "user",
                "content": "Your previous reply was not valid JSON. Respond with ONLY valid minified JSON matching the requested schema — no markdown, no commentary."
            }));
        }
        let retry = self.request_content(model, &messages).await?;
        serde_json::from_str::<Value>(&retry)
            .map_err(|e| AppError::LlmError(format!("LLM returned invalid JSON after retry: {e}")))
    }

    async fn request_content(&self, model: &str, messages: &Value) -> Result<String, AppError> {
        let resp = self
            .client
            .post(OPENROUTER_URL)
            .bearer_auth(&self.api_key)
            .json(&json!({
                "model": model,
                "messages": messages,
                "response_format": { "type": "json_object" },
                "temperature": 0.3,
            }))
            .send()
            .await
            .map_err(|e| AppError::LlmError(format!("OpenRouter request failed: {e}")))?;

        if !resp.status().is_success() {
            let status = resp.status();
            let text = resp.text().await.unwrap_or_default();
            return Err(AppError::LlmError(format!("OpenRouter {status}: {text}")));
        }

        let body: Value = resp
            .json()
            .await
            .map_err(|e| AppError::LlmError(format!("OpenRouter response not JSON: {e}")))?;

        body.get("choices")
            .and_then(|c| c.get(0))
            .and_then(|c| c.get("message"))
            .and_then(|m| m.get("content"))
            .and_then(|c| c.as_str())
            .map(Self::clean_response)
            .ok_or_else(|| AppError::LlmError("OpenRouter response missing content".to_string()))
    }

    /// Strips ```json / ``` markdown fences some models wrap around JSON output.
    fn clean_response(text: &str) -> String {
        let trimmed = text.trim();
        let without_open = trimmed
            .strip_prefix("```json")
            .or_else(|| trimmed.strip_prefix("```"))
            .unwrap_or(trimmed);
        without_open
            .strip_suffix("```")
            .unwrap_or(without_open)
            .trim()
            .to_string()
    }
}
