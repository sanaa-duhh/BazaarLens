use anyhow::anyhow;
use serde::Serialize;
use sqlx::SqlitePool;
use tracing::{info, warn};
use web_push::{
    ContentEncoding, IsahcWebPushClient, SubscriptionInfo, VapidSignatureBuilder, WebPushClient,
    WebPushMessageBuilder, URL_SAFE_NO_PAD,
};

#[derive(Debug, Clone, Serialize)]
pub struct PushPayload {
    pub title: String,
    pub body: String,
    pub url: String,
    pub icon: String,
}

pub struct PushSubscription {
    pub device_id: String,
    pub endpoint: String,
    pub p256dh: String,
    pub auth_key: String,
}

pub struct PushService {
    client: IsahcWebPushClient,
    /// URL-safe base64-encoded VAPID private key (EC P-256 raw bytes).
    vapid_private_key_b64: String,
}

impl PushService {
    pub fn new(vapid_private_key_b64: &str) -> anyhow::Result<Self> {
        // Validate the key is parseable on startup so we fail fast.
        VapidSignatureBuilder::from_base64_no_sub(vapid_private_key_b64, URL_SAFE_NO_PAD)
            .map_err(|e| anyhow!("invalid VAPID private key: {e}"))?;

        Ok(Self {
            client: IsahcWebPushClient::new()
                .map_err(|e| anyhow!("push client init failed: {e}"))?,
            vapid_private_key_b64: vapid_private_key_b64.to_string(),
        })
    }

    /// Delivers a push notification. Returns `Ok(true)` on success, `Ok(false)` if the
    /// subscription expired (410 Gone) — the expired row is removed from the DB.
    pub async fn send_notification(
        &self,
        subscription: &PushSubscription,
        payload: &PushPayload,
        pool: &SqlitePool,
    ) -> anyhow::Result<bool> {
        let content = serde_json::to_string(payload)?;

        let sub_info = SubscriptionInfo::new(
            &subscription.endpoint,
            &subscription.p256dh,
            &subscription.auth_key,
        );

        let sig =
            VapidSignatureBuilder::from_base64_no_sub(&self.vapid_private_key_b64, URL_SAFE_NO_PAD)
                .map_err(|e| anyhow!("VAPID builder error: {e}"))?
                .add_sub_info(&sub_info)
                .build()
                .map_err(|e| anyhow!("VAPID sign error: {e}"))?;

        let mut builder = WebPushMessageBuilder::new(&sub_info);
        builder.set_payload(ContentEncoding::Aes128Gcm, content.as_bytes());
        builder.set_vapid_signature(sig);
        let message = builder
            .build()
            .map_err(|e| anyhow!("message build error: {e}"))?;

        match self.client.send(message).await {
            Ok(()) => {
                info!(device_id = %subscription.device_id, "push notification delivered");
                Ok(true)
            }
            Err(web_push::WebPushError::EndpointNotValid)
            | Err(web_push::WebPushError::EndpointNotFound) => {
                warn!(device_id = %subscription.device_id, "subscription expired, removing");
                sqlx::query("DELETE FROM push_subscriptions WHERE device_id = ?")
                    .bind(&subscription.device_id)
                    .execute(pool)
                    .await?;
                Ok(false)
            }
            Err(e) => Err(anyhow!("push delivery failed: {e}")),
        }
    }
}
