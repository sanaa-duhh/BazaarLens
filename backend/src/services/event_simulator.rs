use sqlx::SqlitePool;
use tracing::{error, info};

use crate::prompts::strategy::{self, STRATEGY_MODEL};
use crate::schemas::strategy::StrategyLlmResponse;
use crate::services::llm::LlmService;
use crate::services::push_service::{PushPayload, PushService, PushSubscription};

/// Default event metadata injected when the caller doesn't supply `event_data`.
pub fn default_event_data(event_type: &str) -> serde_json::Value {
    match event_type {
        "price_drop" => {
            serde_json::json!({ "competitor": "Unknown Competitor", "drop_pct": 15 })
        }
        "demand_spike" => serde_json::json!({ "spike_multiplier": 3, "source": "search_trends" }),
        "sentiment_crash" => serde_json::json!({ "from_rating": 4.2, "to_rating": 2.8 }),
        "stock_outage" => {
            serde_json::json!({ "competitor": "Top Competitor", "duration_days": 3 })
        }
        _ => serde_json::json!({}),
    }
}

/// Notification copy per event type.
fn push_body(event_type: &str) -> &'static str {
    match event_type {
        "price_drop" => "Competitor dropped their price — see your strategy",
        "demand_spike" => "Demand spike detected — act now",
        "sentiment_crash" => "Sentiment alert — reputation risk rising",
        "stock_outage" => "Competitor out of stock — opportunity window open",
        _ => "A market event requires your attention",
    }
}

pub struct BackgroundTask {
    pub pool: SqlitePool,
    pub llm: LlmService,
    pub push: Option<PushService>,
    pub event_id: String,
    pub product_id: String,
    pub product_name: String,
    pub event_type: String,
    pub event_data: String,
}

/// Runs after the HTTP response returns: generate strategy, push notifications.
/// All errors are logged rather than surfaced — callers should `tokio::spawn` this.
pub async fn run_background(task: BackgroundTask) {
    let BackgroundTask {
        pool,
        llm,
        push,
        event_id,
        product_id,
        product_name,
        event_type,
        event_data,
    } = task;
    // 1. Generate strategy via LLM.
    let prompt = strategy::build(&product_name, &event_type, &event_data);
    let raw = match llm.call_text(&prompt, STRATEGY_MODEL).await {
        Ok(v) => v,
        Err(e) => {
            error!(event_id = %event_id, error = ?e, "strategy LLM failed");
            return;
        }
    };

    let parsed: StrategyLlmResponse = match serde_json::from_value(raw) {
        Ok(v) => v,
        Err(e) => {
            error!(event_id = %event_id, "strategy parse failed: {e}");
            return;
        }
    };

    // 2. Persist the strategy.
    let strategy_id = uuid::Uuid::new_v4().to_string();
    let generated_at = chrono::Utc::now().to_rfc3339();
    let marketing_json = serde_json::to_string(&parsed.marketing_ai).unwrap_or_default();
    let product_json = serde_json::to_string(&parsed.product_ai).unwrap_or_default();
    let sales_json = serde_json::to_string(&parsed.sales_ai).unwrap_or_default();
    let final_json = serde_json::to_string(&parsed.final_decision).unwrap_or_default();

    if let Err(e) = sqlx::query(
        "INSERT OR IGNORE INTO strategies \
         (id, event_id, marketing_ai, product_ai, sales_ai, final_decision, model_used, generated_at) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&strategy_id)
    .bind(&event_id)
    .bind(&marketing_json)
    .bind(&product_json)
    .bind(&sales_json)
    .bind(&final_json)
    .bind(STRATEGY_MODEL)
    .bind(&generated_at)
    .execute(&pool)
    .await
    {
        error!(event_id = %event_id, "strategy persist failed: {e}");
        return;
    }

    info!(event_id = %event_id, strategy_id = %strategy_id, "strategy generated");

    // 3. Push notifications to all devices watching this product.
    let Some(push_svc) = push else {
        info!("push service not configured, skipping notifications");
        return;
    };

    let subs = match sqlx::query_as::<_, (String, String, String, String)>(
        "SELECT ps.device_id, ps.endpoint, ps.p256dh, ps.auth_key \
         FROM push_subscriptions ps \
         JOIN watchlist w ON w.device_id = ps.device_id \
         WHERE w.product_id = ?",
    )
    .bind(&product_id)
    .fetch_all(&pool)
    .await
    {
        Ok(v) => v,
        Err(e) => {
            error!("failed to query push subscriptions: {e}");
            return;
        }
    };

    let payload = PushPayload {
        title: "BazaarLens Alert".to_string(),
        body: push_body(&event_type).to_string(),
        url: format!("/strategy/{event_id}"),
        icon: "/icons/icon-192.png".to_string(),
    };

    let mut sent = 0u32;
    for (device_id, endpoint, p256dh, auth_key) in subs {
        let sub = PushSubscription {
            device_id,
            endpoint,
            p256dh,
            auth_key,
        };
        match push_svc.send_notification(&sub, &payload, &pool).await {
            Ok(true) => sent += 1,
            Ok(false) => {}
            Err(e) => error!("push send failed: {e}"),
        }
    }

    // 4. Mark event as notified.
    let _ = sqlx::query(
        "UPDATE market_events SET notification_sent = 1, notifications_count = ? WHERE id = ?",
    )
    .bind(sent)
    .bind(&event_id)
    .execute(&pool)
    .await;

    info!(event_id = %event_id, sent, "push notifications dispatched");
}
