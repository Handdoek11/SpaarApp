use crate::error::AppResult;
use crate::models::{Transaction, TransactionType};
use crate::AppState;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use sqlx::{self, Row};

#[tauri::command]
pub async fn get_transactions(state: State<'_, AppState>) -> AppResult<Vec<Transaction>> {
    let pool = state.db.lock().await.get_pool().await?;

    let rows = sqlx::query(
        r#"
        SELECT
            id, description, amount, date, category_id, account_number,
            account_holder, transaction_type, balance_after, notes, tags,
            is_recurring, recurring_frequency, created_at, updated_at
        FROM transactions
        ORDER BY date DESC, created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await?;

    let transactions = rows.into_iter().map(|row| {
        crate::models::Transaction {
            id: row.get("id"),
            description: row.get("description"),
            amount: row.get::<String, _>("amount").parse().unwrap_or_default(),
            date: row.get("date"),
            category_id: row.get("category_id"),
            account_number: row.get("account_number"),
            account_holder: row.get("account_holder"),
            transaction_type: row.get("transaction_type"),
            balance_after: row.get::<Option<String>, _>("balance_after").map(|s| s.parse().unwrap_or_default()),
            notes: row.get("notes"),
            tags: row.get("tags"),
            is_recurring: row.get("is_recurring"),
            recurring_frequency: row.get("recurring_frequency"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    Ok(transactions)
}

#[tauri::command]
pub async fn add_transaction(
    mut transaction: Transaction,
    state: State<'_, AppState>
) -> AppResult<Transaction> {
    let pool = state.db.lock().await.get_pool().await?;

    // Generate ID if not provided
    if transaction.id.is_empty() {
        transaction.id = Uuid::new_v4().to_string();
    }

    // Set timestamps
    let now = Utc::now();
    transaction.created_at = now;
    transaction.updated_at = now;

    // Parse tags from array to JSON string
    let tags_json = serde_json::to_string(&transaction.tags)?;

    let result = sqlx::query(
        r#"
        INSERT INTO transactions (
            id, description, amount, date, category_id, account_number,
            account_holder, transaction_type, balance_after, notes, tags,
            is_recurring, recurring_frequency, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&transaction.id)
    .bind(&transaction.description)
    .bind(transaction.amount.to_string())
    .bind(transaction.date)
    .bind(&transaction.category_id)
    .bind(&transaction.account_number)
    .bind(&transaction.account_holder)
    .bind(&transaction.transaction_type)
    .bind(transaction.balance_after.map(|d| d.to_string()))
    .bind(&transaction.notes)
    .bind(tags_json)
    .bind(transaction.is_recurring)
    .bind(&transaction.recurring_frequency)
    .bind(transaction.created_at)
    .bind(transaction.updated_at)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    Ok(transaction)
}

#[tauri::command]
pub async fn update_transaction(
    id: String,
    mut transaction: Transaction,
    state: State<'_, AppState>
) -> AppResult<Transaction> {
    let pool = state.db.lock().await.get_pool().await?;

    // Ensure ID matches and update timestamp
    transaction.id = id.clone();
    transaction.updated_at = Utc::now();

    // Parse tags from array to JSON string
    let tags_json = serde_json::to_string(&transaction.tags)?;

    let result = sqlx::query(
        r#"
        UPDATE transactions SET
            description = ?, amount = ?, date = ?, category_id = ?,
            account_number = ?, account_holder = ?, transaction_type = ?,
            balance_after = ?, notes = ?, tags = ?, is_recurring = ?,
            recurring_frequency = ?, updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&transaction.description)
    .bind(transaction.amount.to_string())
    .bind(transaction.date)
    .bind(&transaction.category_id)
    .bind(&transaction.account_number)
    .bind(&transaction.account_holder)
    .bind(&transaction.transaction_type)
    .bind(transaction.balance_after.map(|d| d.to_string()))
    .bind(&transaction.notes)
    .bind(tags_json)
    .bind(transaction.is_recurring)
    .bind(&transaction.recurring_frequency)
    .bind(transaction.updated_at)
    .bind(&id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    Ok(transaction)
}

#[tauri::command]
pub async fn delete_transaction(id: String, state: State<'_, AppState>) -> AppResult<bool> {
    let pool = state.db.lock().await.get_pool().await?;

    let result = sqlx::query("DELETE FROM transactions WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn get_transaction_by_id(
    id: String,
    state: State<'_, AppState>
) -> AppResult<Option<Transaction>> {
    let pool = state.db.lock().await.get_pool().await?;

    let row = sqlx::query(
        r#"
        SELECT
            id, description, amount, date, category_id, account_number,
            account_holder, transaction_type, balance_after, notes, tags,
            is_recurring, recurring_frequency, created_at, updated_at
        FROM transactions
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await?;

    let transaction = row.map(|r| {
        crate::models::Transaction {
            id: r.get("id"),
            description: r.get("description"),
            amount: r.get::<String, _>("amount").parse().unwrap_or_default(),
            date: r.get("date"),
            category_id: r.get("category_id"),
            account_number: r.get("account_number"),
            account_holder: r.get("account_holder"),
            transaction_type: r.get("transaction_type"),
            balance_after: r.get::<Option<String>, _>("balance_after").map(|s| s.parse().unwrap_or_default()),
            notes: r.get("notes"),
            tags: r.get("tags"),
            is_recurring: r.get("is_recurring"),
            recurring_frequency: r.get("recurring_frequency"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }
    });

    Ok(transaction)
}