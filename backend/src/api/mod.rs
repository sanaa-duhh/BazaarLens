pub mod health;
pub mod intelligence;
pub mod push;
pub mod scan;
pub mod watchlist;

use axum::Router;
use std::sync::Arc;

use crate::AppState;

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .merge(health::router())
        .merge(scan::router())
        .merge(intelligence::router())
        .merge(watchlist::router())
        .merge(push::router())
}
