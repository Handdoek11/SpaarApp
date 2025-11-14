use crate::error::AppResult;
use crate::AppState;
use serde::Serialize;
use tauri::State;

#[derive(Debug, Serialize)]
pub struct AppInfo {
    name: String,
    version: String,
    description: String,
}

#[tauri::command]
pub async fn get_app_info() -> AppResult<AppInfo> {
    Ok(AppInfo {
        name: "SpaarApp".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        description: "ADHD-friendly financial management application".to_string(),
    })
}

#[tauri::command]
pub async fn get_version() -> AppResult<String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

#[tauri::command]
pub async fn get_platform() -> AppResult<String> {
    Ok(std::env::consts::OS.to_string())
}

#[tauri::command]
pub async fn test_database(state: State<'_, AppState>) -> AppResult<serde_json::Value> {
    let db = state.db.lock().await;

    // Test basic connectivity
    let connection_ok = db.test_connection().await?;

    // Test encryption
    let encryption_ok = db.verify_encryption().await?;

    // Get database statistics
    let stats = db.get_database_stats().await?;

    Ok(serde_json::json!({
        "connection_test": connection_ok,
        "encryption_test": encryption_ok,
        "database_stats": stats,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}