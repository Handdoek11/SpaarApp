use crate::error::AppResult;
use crate::models::{Budget, BudgetPeriod};
use crate::AppState;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use sqlx::{self, Row};

#[tauri::command]
pub async fn get_budgets(state: State<'_, AppState>) -> AppResult<Vec<Budget>> {
    let pool = state.db.lock().await.get_pool().await?;

    let rows = sqlx::query(
        r#"
        SELECT
            id, name, category_id, amount, period, spent, remaining, is_active,
            notification_threshold, start_date, end_date, created_at, updated_at
        FROM budgets
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        "#
    )
    .fetch_all(&pool)
    .await?;

    let budgets = rows.into_iter().map(|row| {
        crate::models::Budget {
            id: row.get("id"),
            name: row.get("name"),
            category_id: row.get("category_id"),
            amount: row.get::<String, _>("amount").parse().unwrap_or_default(),
            period: row.get("period"),
            spent: row.get::<String, _>("spent").parse().unwrap_or_default(),
            remaining: row.get::<String, _>("remaining").parse().unwrap_or_default(),
            is_active: row.get("is_active"),
            notification_threshold: row.get::<Option<String>, _>("notification_threshold").and_then(|s| s.parse().ok()),
            start_date: row.get("start_date"),
            end_date: row.get("end_date"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    Ok(budgets)
}

#[tauri::command]
pub async fn add_budget(
    mut budget: Budget,
    state: State<'_, AppState>
) -> AppResult<Budget> {
    let pool = state.db.lock().await.get_pool().await?;

    // Generate ID if not provided
    if budget.id.is_empty() {
        budget.id = Uuid::new_v4().to_string();
    }

    // Set timestamps and defaults
    let now = Utc::now();
    budget.created_at = now;
    budget.updated_at = now;
    budget.spent = rust_decimal::Decimal::ZERO; // New budgets start with 0 spent
    budget.is_active = true;

    let result = sqlx::query(
        r#"
        INSERT INTO budgets (
            id, name, category_id, amount, period, spent, is_active,
            notification_threshold, start_date, end_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&budget.id)
    .bind(&budget.name)
    .bind(&budget.category_id)
    .bind(budget.amount.to_string())
    .bind(&budget.period)
    .bind(budget.spent.to_string())
    .bind(budget.is_active)
    .bind(budget.notification_threshold.map(|d| d.to_string()))
    .bind(budget.start_date)
    .bind(budget.end_date)
    .bind(budget.created_at)
    .bind(budget.updated_at)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    // Calculate remaining (amount - spent)
    budget.remaining = budget.amount - budget.spent;

    Ok(budget)
}

#[tauri::command]
pub async fn update_budget(
    id: String,
    mut budget: Budget,
    state: State<'_, AppState>
) -> AppResult<Budget> {
    let pool = state.db.lock().await.get_pool().await?;

    // Ensure ID matches and update timestamp
    budget.id = id.clone();
    budget.updated_at = Utc::now();

    // Don't allow changing spent amount directly - this should be calculated
    let existing_row = sqlx::query("SELECT spent FROM budgets WHERE id = ?")
        .bind(&id)
        .fetch_one(&pool)
        .await?;

    budget.spent = existing_row.get::<String, _>("spent").parse().unwrap_or_default();

    let result = sqlx::query(
        r#"
        UPDATE budgets SET
            name = ?, category_id = ?, amount = ?, period = ?, is_active = ?,
            notification_threshold = ?, start_date = ?, end_date = ?, updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&budget.name)
    .bind(&budget.category_id)
    .bind(budget.amount.to_string())
    .bind(&budget.period)
    .bind(budget.is_active)
    .bind(budget.notification_threshold.map(|d| d.to_string()))
    .bind(budget.start_date)
    .bind(budget.end_date)
    .bind(budget.updated_at)
    .bind(&id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    // Update remaining amount
    budget.remaining = budget.amount - budget.spent;

    Ok(budget)
}

#[tauri::command]
pub async fn delete_budget(id: String, state: State<'_, AppState>) -> AppResult<bool> {
    let pool = state.db.lock().await.get_pool().await?;

    let result = sqlx::query("DELETE FROM budgets WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn update_budget_spending(
    id: String,
    additional_spent: f64,
    state: State<'_, AppState>
) -> AppResult<Budget> {
    let pool = state.db.lock().await.get_pool().await?;

    let rows = sqlx::query(
        r#"
        UPDATE budgets SET
            spent = spent + ?,
            updated_at = ?
        WHERE id = ?
        RETURNING id, name, category_id, amount, period, spent, remaining, is_active,
                  notification_threshold, start_date, end_date, created_at, updated_at
        "#
    )
    .bind(additional_spent.to_string())
    .bind(Utc::now())
    .bind(&id)
    .fetch_all(&pool)
    .await?;

    if rows.is_empty() {
        return Err(crate::error::AppError::Database(sqlx::Error::RowNotFound));
    }

    let row = &rows[0];
    let amount = row.get::<String, _>("amount").parse().unwrap_or_default();
    let spent = row.get::<String, _>("spent").parse().unwrap_or_default();

    let budget = Budget {
        id: row.get("id"),
        name: row.get("name"),
        category_id: row.get("category_id"),
        amount,
        period: row.get("period"),
        spent,
        remaining: amount - spent,
        is_active: row.get("is_active"),
        notification_threshold: row.get::<Option<String>, _>("notification_threshold").and_then(|s| s.parse().ok()),
        start_date: row.get("start_date"),
        end_date: row.get("end_date"),
        created_at: row.get("created_at"),
        updated_at: row.get("updated_at"),
    };

    Ok(budget)
}

#[tauri::command]
pub async fn get_budget_by_id(
    id: String,
    state: State<'_, AppState>
) -> AppResult<Option<Budget>> {
    let pool = state.db.lock().await.get_pool().await?;

    let row = sqlx::query(
        r#"
        SELECT
            id, name, category_id, amount, period, spent, remaining, is_active,
            notification_threshold, start_date, end_date, created_at, updated_at
        FROM budgets
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await?;

    let budget = row.map(|r| {
        crate::models::Budget {
            id: r.get("id"),
            name: r.get("name"),
            category_id: r.get("category_id"),
            amount: r.get::<String, _>("amount").parse().unwrap_or_default(),
            period: r.get("period"),
            spent: r.get::<String, _>("spent").parse().unwrap_or_default(),
            remaining: r.get::<String, _>("remaining").parse().unwrap_or_default(),
            is_active: r.get("is_active"),
            notification_threshold: r.get::<Option<String>, _>("notification_threshold").and_then(|s| s.parse().ok()),
            start_date: r.get("start_date"),
            end_date: r.get("end_date"),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }
    });

    Ok(budget)
}

#[tauri::command]
pub async fn get_budget_summary(state: State<'_, AppState>) -> AppResult<BudgetSummary> {
    let pool = state.db.lock().await.get_pool().await?;

    let summary = sqlx::query(
        r#"
        SELECT
            COUNT(*) as total_budgets,
            COUNT(CASE WHEN is_active THEN 1 END) as active_budgets,
            SUM(amount) as total_budgeted,
            SUM(spent) as total_spent,
            SUM(remaining) as total_remaining
        FROM budgets
        WHERE is_active = TRUE
        "#
    )
    .fetch_one(&pool)
    .await?;

    let budget_summary = BudgetSummary {
        total_budgets: summary.get::<i64, _>("total_budgets"),
        active_budgets: summary.get::<i64, _>("active_budgets"),
        total_budgeted: summary.get::<Option<String>, _>("total_budgeted")
            .and_then(|s| s.parse().ok()).unwrap_or(0.0),
        total_spent: summary.get::<Option<String>, _>("total_spent")
            .and_then(|s| s.parse().ok()).unwrap_or(0.0),
        total_remaining: summary.get::<Option<String>, _>("total_remaining")
            .and_then(|s| s.parse().ok()).unwrap_or(0.0),
    };

    Ok(budget_summary)
}

#[derive(serde::Serialize)]
pub struct BudgetSummary {
    pub total_budgets: i64,
    pub active_budgets: i64,
    pub total_budgeted: f64,
    pub total_spent: f64,
    pub total_remaining: f64,
}