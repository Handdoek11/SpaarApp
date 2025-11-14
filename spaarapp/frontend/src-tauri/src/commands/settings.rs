use crate::error::AppResult;
use crate::models::Settings;
use crate::AppState;
use tauri::State;
use chrono::Utc;
use sqlx::{self, Row};

#[tauri::command]
pub async fn get_settings(state: State<'_, AppState>) -> AppResult<Settings> {
    let pool = state.db.lock().await.get_pool().await?;

    let row = sqlx::query(
        r#"
        SELECT
            id, currency, date_format, theme, language, notifications_enabled,
            auto_categorization_enabled, ai_insights_enabled, budget_alerts_enabled,
            data_retention_days, export_format, encryption_enabled, last_backup,
            created_at, updated_at
        FROM settings
        ORDER BY created_at DESC
        LIMIT 1
        "#
    )
    .fetch_optional(&pool)
    .await?;

    let settings = row.map(|r| {
        crate::models::Settings {
            id: r.get("id"),
            currency: r.get("currency"),
            date_format: r.get("date_format"),
            theme: r.get("theme"),
            language: r.get("language"),
            notifications_enabled: r.get("notifications_enabled"),
            auto_categorization_enabled: r.get("auto_categorization_enabled"),
            ai_insights_enabled: r.get("ai_insights_enabled"),
            budget_alerts_enabled: r.get("budget_alerts_enabled"),
            data_retention_days: r.get("data_retention_days"),
            export_format: r.get("export_format"),
            encryption_enabled: r.get("encryption_enabled"),
            last_backup: r.get("last_backup"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }
    });

    match settings {
        Some(s) => Ok(s),
        None => {
            // Create default settings if none exist
            let default_settings = Settings::default();
            create_settings(default_settings.clone(), &pool).await?;
            Ok(default_settings)
        }
    }
}

#[tauri::command]
pub async fn update_settings(
    mut settings: Settings,
    state: State<'_, AppState>
) -> AppResult<Settings> {
    let pool = state.db.lock().await.get_pool().await?;

    // Update timestamp
    settings.updated_at = Utc::now();

    let result = sqlx::query(
        r#"
        UPDATE settings SET
            currency = ?, date_format = ?, theme = ?, language = ?,
            notifications_enabled = ?, auto_categorization_enabled = ?,
            ai_insights_enabled = ?, budget_alerts_enabled = ?,
            data_retention_days = ?, export_format = ?, encryption_enabled = ?,
            last_backup = ?, updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&settings.currency)
    .bind(&settings.date_format)
    .bind(&settings.theme)
    .bind(&settings.language)
    .bind(settings.notifications_enabled)
    .bind(settings.auto_categorization_enabled)
    .bind(settings.ai_insights_enabled)
    .bind(settings.budget_alerts_enabled)
    .bind(settings.data_retention_days)
    .bind(&settings.export_format)
    .bind(settings.encryption_enabled)
    .bind(&settings.last_backup)
    .bind(settings.updated_at)
    .bind(&settings.id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        // If no settings exist, create them
        return create_settings(settings.clone(), &pool).await.map(|_| settings);
    }

    Ok(settings)
}

async fn create_settings(settings: Settings, pool: &sqlx::SqlitePool) -> AppResult<()> {
    sqlx::query(
        r#"
        INSERT INTO settings (
            id, currency, date_format, theme, language, notifications_enabled,
            auto_categorization_enabled, ai_insights_enabled, budget_alerts_enabled,
            data_retention_days, export_format, encryption_enabled, last_backup,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&settings.id)
    .bind(&settings.currency)
    .bind(&settings.date_format)
    .bind(&settings.theme)
    .bind(&settings.language)
    .bind(settings.notifications_enabled)
    .bind(settings.auto_categorization_enabled)
    .bind(settings.ai_insights_enabled)
    .bind(settings.budget_alerts_enabled)
    .bind(settings.data_retention_days)
    .bind(&settings.export_format)
    .bind(settings.encryption_enabled)
    .bind(&settings.last_backup)
    .bind(settings.created_at)
    .bind(settings.updated_at)
    .execute(pool)
    .await?;

    Ok(())
}

#[tauri::command]
pub async fn reset_settings_to_default(state: State<'_, AppState>) -> AppResult<Settings> {
    let pool = state.db.lock().await.get_pool().await?;

    // Delete existing settings
    sqlx::query("DELETE FROM settings")
        .execute(&pool)
        .await?;

    // Create default settings
    let default_settings = Settings::default();
    create_settings(default_settings.clone(), &pool).await?;

    Ok(default_settings)
}