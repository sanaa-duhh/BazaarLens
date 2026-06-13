pub mod health;
pub mod scan;

use axum::Router;
use std::sync::Arc;

use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new().merge(health::router()).merge(scan::router())
}
