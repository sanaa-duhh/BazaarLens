use std::env;

#[derive(Debug, Clone)]
pub struct Settings {
    pub database_url: String,
    pub openrouter_api_key: String,
    pub vapid_private_key: String,
    pub vapid_public_key: String,
    pub vapid_email: String,
    pub allowed_origins: Vec<String>,
    pub port: u16,
}

impl Settings {
    pub fn from_env() -> anyhow::Result<Self> {
        Ok(Self {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "sqlite:./bazaarlens.db".to_string()),
            openrouter_api_key: env::var("OPENROUTER_API_KEY")?,
            vapid_private_key: env::var("VAPID_PRIVATE_KEY").unwrap_or_default(),
            vapid_public_key: env::var("VAPID_PUBLIC_KEY").unwrap_or_default(),
            vapid_email: env::var("VAPID_EMAIL")
                .unwrap_or_else(|_| "mailto:team@bazaarlens.app".to_string()),
            allowed_origins: env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| {
                    "http://localhost:3000,https://bazaarlens.vercel.app".to_string()
                })
                .split(',')
                .map(|s| s.trim().to_string())
                .collect(),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8000".to_string())
                .parse()
                .unwrap_or(8000),
        })
    }
}
