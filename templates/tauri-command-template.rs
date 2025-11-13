// SpaarApp Tauri Command Template
// Secure backend command with proper error handling and accessibility

use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};
use crate::{error::SpaarAppError, security::EncryptionManager, database::DatabaseManager};
use crate::models::*;
use tracing::{info, error, warn};

/// Command result wrapper for consistent frontend communication
#[derive(Debug, Serialize)]
pub struct CommandResult<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub message: Option<String>,
}

impl<T> CommandResult<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            message: Some("Operatie succesvol".to_string()),
        }
    }

    pub fn error(error: SpaarAppError) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(error.to_string()),
            message: Some(error.user_message()),
        }
    }
}

/// Command input with validation
#[derive(Debug, Deserialize)]
pub struct {{CommandName}}Input {
    // Define your input parameters here
    pub user_id: String,
    pub amount: rust_decimal::Decimal,
    pub description: String,
    pub category: Option<String>,
}

impl {{CommandName}}Input {
    /// Validate input data before processing
    pub fn validate(&self) -> Result<(), SpaarAppError> {
        if self.amount.is_zero() || self.amount.is_sign_negative() {
            return Err(SpaarAppError::Validation(
                "Bedrag moet positief zijn".to_string()
            ));
        }

        if self.description.trim().is_empty() {
            return Err(SpaarAppError::Validation(
                "Beschrijving is verplicht".to_string()
            ));
        }

        if self.description.len() > 255 {
            return Err(SpaarAppError::Validation(
                "Beschrijving mag niet langer dan 255 karakters zijn".to_string()
            ));
        }

        Ok(())
    }
}

/// Command output
#[derive(Debug, Serialize)]
pub struct {{CommandName}}Output {
    pub id: String,
    pub status: String,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// {{CommandDescription}}
///
/// This command provides:
/// - Secure data processing
/// - Comprehensive error handling
/// - Audit logging
/// - Accessibility support
/// - Performance monitoring
#[command]
pub async fn {{command_name}}_command(
    app: AppHandle,
    input: {{CommandName}}Input,
) -> Result<CommandResult<{{CommandName}}Output>, String> {
    info!("{{command_name}}_command started for user: {}", input.user_id);

    // Validate input
    if let Err(validation_error) = input.validate() {
        warn!("Input validation failed: {}", validation_error);
        return Ok(CommandResult::error(validation_error));
    }

    // Get dependencies from app state
    let db_manager = app.state::<DatabaseManager>();
    let encryption = app.state::<EncryptionManager>();

    // Process command
    match process_{{command_name}}(&input, db_manager.inner(), encryption.inner()).await {
        Ok(result) => {
            info!("{{command_name}}_command completed successfully");

            // Emit event for frontend accessibility
            let _ = app.emit("{{command_name}}_completed", &result);

            Ok(CommandResult::success(result))
        }
        Err(error) => {
            error!("{{command_name}}_command failed: {}", error);

            // Emit error event for accessibility
            let _ = app.emit("{{command_name}}_error", &error.to_string());

            Ok(CommandResult::error(error))
        }
    }
}

/// Core processing logic
async fn process_{{command_name}}(
    input: &{{CommandName}}Input,
    db: &DatabaseManager,
    encryption: &EncryptionManager,
) -> Result<{{CommandName}}Output, SpaarAppError> {
    // 1. Secure sensitive data
    let encrypted_description = encryption.encrypt_sensitive_data(&input.description)?;

    // 2. Database operation
    let result = db.{{command_name}}(
        &input.user_id,
        input.amount,
        &encrypted_description,
        input.category.as_deref(),
    ).await?;

    // 3. Log audit trail
    audit_log_{{command_name}}(input, &result).await?;

    // 4. Return result
    Ok({{CommandName}}Output {
        id: result.id,
        status: "completed".to_string(),
        timestamp: chrono::Utc::now(),
    })
}

/// Audit logging for compliance
async fn audit_log_{{command_name}}(
    input: &{{CommandName}}Input,
    result: &{{CommandName}}Output,
) -> Result<(), SpaarAppError> {
    let audit_entry = AuditLog {
        id: uuid::Uuid::new_v4().to_string(),
        action: "{{command_name}}".to_string(),
        user_id: input.user_id.clone(),
        timestamp: chrono::Utc::now(),
        details: format!(
            "Amount: {}, Description: [REDACTED], Result ID: {}",
            input.amount,
            result.id
        ),
        success: true,
    };

    // Store audit entry
    crate::database::store_audit_log(audit_entry).await?;

    Ok(())
}

/// Batch processing command for efficiency
#[command]
pub async fn {{command_name}}_batch(
    app: AppHandle,
    inputs: Vec<{{CommandName}}Input>,
) -> Result<CommandResult<Vec<{{CommandName}}Output>>, String> {
    info!("{{command_name}}_batch started with {} items", inputs.len());

    if inputs.is_empty() {
        return Ok(CommandResult::error(SpaarAppError::Validation(
            "Batch mag niet leeg zijn".to_string()
        )));
    }

    if inputs.len() > 1000 {
        return Ok(CommandResult::error(SpaarAppError::Validation(
            "Batch mag niet meer dan 1000 items bevatten".to_string()
        )));
    }

    let db_manager = app.state::<DatabaseManager>();
    let encryption = app.state::<EncryptionManager>();

    let mut results = Vec::with_capacity(inputs.len());
    let mut success_count = 0;
    let mut error_count = 0;

    for input in inputs {
        match process_{{command_name}}(&input, db_manager.inner(), encryption.inner()).await {
            Ok(result) => {
                results.push(result);
                success_count += 1;
            }
            Err(error) => {
                error!("Batch item failed: {}", error);
                error_count += 1;
                // Continue processing other items
            }
        }
    }

    info!(
        "{{command_name}}_batch completed: {} successful, {} failed",
        success_count, error_count
    );

    // Emit batch completion event
    let _ = app.emit("{{command_name}}_batch_completed", (success_count, error_count));

    Ok(CommandResult::success(results))
}

/// Status check command for monitoring
#[command]
pub async fn {{command_name}}_status(
    app: AppHandle,
    user_id: String,
) -> Result<CommandResult<{{CommandName}}Status>, String> {
    let db_manager = app.state::<DatabaseManager>();

    match db_manager.get_{{command_name}}_status(&user_id).await {
        Ok(status) => Ok(CommandResult::success(status)),
        Err(error) => Ok(CommandResult::error(error)),
    }
}

/// Status response
#[derive(Debug, Serialize)]
pub struct {{CommandName}}Status {
    pub active_operations: u32,
    pub last_operation: Option<chrono::DateTime<chrono::Utc>>,
    pub total_processed: u64,
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::*;

    #[tokio::test]
    async fn test_{{command_name}}_validation() {
        let valid_input = {{CommandName}}Input {
            user_id: "test_user".to_string(),
            amount: rust_decimal::Decimal::new(10000, 2), // €100.00
            description: "Test transaction".to_string(),
            category: Some("groceries".to_string()),
        };

        assert!(valid_input.validate().is_ok());

        // Test invalid amount
        let mut invalid_input = valid_input.clone();
        invalid_input.amount = rust_decimal::Decimal::ZERO;
        assert!(invalid_input.validate().is_err());

        // Test empty description
        let mut invalid_input = valid_input.clone();
        invalid_input.description = "".to_string();
        assert!(invalid_input.validate().is_err());
    }

    #[tokio::test]
    async fn test_{{command_name}}_processing() {
        let (db, encryption) = setup_test_db().await;
        let input = {{CommandName}}Input {
            user_id: "test_user".to_string(),
            amount: rust_decimal::Decimal::new(10000, 2),
            description: "Test transaction".to_string(),
            category: Some("groceries".to_string()),
        };

        let result = process_{{command_name}}(&input, &db, &encryption).await;
        assert!(result.is_ok());
    }
}