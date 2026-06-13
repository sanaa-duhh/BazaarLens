use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

// Variants are used starting Phase 2 when route handlers are added
#[allow(dead_code)]
#[derive(Debug)]
pub enum AppError {
    NotFound(String),
    BadRequest(String),
    InternalError(String),
    LlmError(String),
    MissingDeviceId,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg),
            AppError::InternalError(msg) => {
                (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", msg)
            }
            AppError::LlmError(msg) => (StatusCode::BAD_GATEWAY, "LLM_ERROR", msg),
            AppError::MissingDeviceId => (
                StatusCode::BAD_REQUEST,
                "MISSING_DEVICE_ID",
                "X-Device-Id header is required".to_string(),
            ),
        };

        (
            status,
            Json(json!({
                "success": false,
                "data": null,
                "error": { "code": code, "message": message }
            })),
        )
            .into_response()
    }
}

impl From<anyhow::Error> for AppError {
    fn from(err: anyhow::Error) -> Self {
        AppError::InternalError(err.to_string())
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => AppError::NotFound("Record not found".to_string()),
            _ => AppError::InternalError(err.to_string()),
        }
    }
}
