use serde::{Deserialize, Serialize};

/// `POST /api/push/subscribe` request body — the browser's `PushSubscription` object.
#[derive(Debug, Deserialize)]
pub struct PushSubscribeRequest {
    pub endpoint: String,
    pub p256dh: String,
    pub auth: String,
}

/// `POST /api/push/subscribe` response.
#[derive(Debug, Serialize)]
pub struct PushSubscribeResponse {
    pub subscribed: bool,
}
