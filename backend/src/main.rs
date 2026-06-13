mod api;
mod config;
mod db;
mod error;
mod prompts;
mod schemas;
mod services;

use axum::Router;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::info;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

use services::llm::LlmService;
use services::product_lookup::ProductLookupService;

pub struct AppState {
    pub db: sqlx::SqlitePool,
    pub config: config::Settings,
    pub product_lookup: ProductLookupService,
    pub llm: LlmService,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "bazaarlens_backend=debug,tower_http=debug,axum=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let settings = config::Settings::from_env()?;
    let pool = db::create_pool(&settings.database_url).await?;

    let cors = build_cors(&settings.allowed_origins);
    let state = Arc::new(AppState {
        db: pool,
        product_lookup: ProductLookupService::new(),
        llm: LlmService::new(settings.openrouter_api_key.clone()),
        config: settings.clone(),
    });

    let app = Router::new()
        .merge(api::router())
        .layer(cors)
        .with_state(state);

    let addr = format!("0.0.0.0:{}", settings.port);
    info!("Listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn build_cors(allowed_origins: &[String]) -> CorsLayer {
    use axum::http::{HeaderName, HeaderValue, Method};
    use tower_http::cors::AllowOrigin;

    let origins: Vec<HeaderValue> = allowed_origins
        .iter()
        .filter_map(|o| o.parse().ok())
        .collect();

    let allow_origin = if origins.is_empty() {
        AllowOrigin::any()
    } else {
        AllowOrigin::list(origins)
    };

    CorsLayer::new()
        .allow_origin(allow_origin)
        .allow_methods([Method::GET, Method::POST, Method::DELETE, Method::OPTIONS])
        .allow_headers([
            HeaderName::from_static("content-type"),
            HeaderName::from_static("x-device-id"),
        ])
}
