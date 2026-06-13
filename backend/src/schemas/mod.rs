pub mod intelligence;
pub mod scan;

use serde::Serialize;

/// Uniform success envelope returned by every API route on the happy path.
/// Errors are produced by `AppError` (see `error.rs`) so all responses share the
/// same `{ success, data, error }` shape the frontend `lib/api.ts` expects.
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}

impl<T> ApiResponse<T> {
    pub fn ok(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
        }
    }
}
