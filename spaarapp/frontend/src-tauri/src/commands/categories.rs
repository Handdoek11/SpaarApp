use crate::error::AppResult;
use crate::models::Category;
use crate::AppState;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;
use sqlx::{self, Row};

#[tauri::command]
pub async fn get_categories(state: State<'_, AppState>) -> AppResult<Vec<Category>> {
    let pool = state.db.lock().await.get_pool().await?;

    let rows = sqlx::query(
        r#"
        SELECT
            id, name, description, color, icon, parent_id, is_system,
            budget_percentage, created_at, updated_at
        FROM categories
        ORDER BY is_system DESC, name ASC
        "#
    )
    .fetch_all(&pool)
    .await?;

    let categories = rows.into_iter().map(|row| {
        crate::models::Category {
            id: row.get("id"),
            name: row.get("name"),
            description: row.get("description"),
            color: row.get("color"),
            icon: row.get("icon"),
            parent_id: row.get("parent_id"),
            is_system: row.get("is_system"),
            budget_percentage: row.get::<Option<String>, _>("budget_percentage").and_then(|s| s.parse().ok()),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }).collect();

    Ok(categories)
}

#[tauri::command]
pub async fn add_category(
    mut category: Category,
    state: State<'_, AppState>
) -> AppResult<Category> {
    let pool = state.db.lock().await.get_pool().await?;

    // Generate ID if not provided
    if category.id.is_empty() {
        category.id = Uuid::new_v4().to_string();
    }

    // Set timestamps
    let now = Utc::now();
    category.created_at = now;
    category.updated_at = now;

    // Set default values
    if category.color.is_empty() {
        category.color = "#2196F3".to_string();
    }
    if category.icon.is_empty() {
        category.icon = "category".to_string();
    }

    let result = sqlx::query(
        r#"
        INSERT INTO categories (
            id, name, description, color, icon, parent_id, is_system,
            budget_percentage, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        "#
    )
    .bind(&category.id)
    .bind(&category.name)
    .bind(&category.description)
    .bind(&category.color)
    .bind(&category.icon)
    .bind(&category.parent_id)
    .bind(category.is_system)
    .bind(category.budget_percentage.map(|d| d.to_string()))
    .bind(category.created_at)
    .bind(category.updated_at)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    Ok(category)
}

#[tauri::command]
pub async fn update_category(
    id: String,
    mut category: Category,
    state: State<'_, AppState>
) -> AppResult<Category> {
    let pool = state.db.lock().await.get_pool().await?;

    // Ensure ID matches and update timestamp
    category.id = id.clone();
    category.updated_at = Utc::now();

    // Don't allow changing is_system status
    // This should remain as it was originally set
    let existing_row = sqlx::query("SELECT is_system FROM categories WHERE id = ?")
        .bind(&id)
        .fetch_optional(&pool)
        .await?;

    if let Some(row) = existing_row {
        category.is_system = row.get("is_system");
    }

    let result = sqlx::query(
        r#"
        UPDATE categories SET
            name = ?, description = ?, color = ?, icon = ?, parent_id = ?,
            budget_percentage = ?, updated_at = ?
        WHERE id = ?
        "#
    )
    .bind(&category.name)
    .bind(&category.description)
    .bind(&category.color)
    .bind(&category.icon)
    .bind(&category.parent_id)
    .bind(category.budget_percentage.map(|d| d.to_string()))
    .bind(category.updated_at)
    .bind(&id)
    .execute(&pool)
    .await?;

    if result.rows_affected() == 0 {
        return Err(crate::error::AppError::Database(
            sqlx::Error::RowNotFound
        ));
    }

    Ok(category)
}

#[tauri::command]
pub async fn delete_category(id: String, state: State<'_, AppState>) -> AppResult<bool> {
    let pool = state.db.lock().await.get_pool().await?;

    // Check if category is system category (cannot delete)
    let category_row = sqlx::query("SELECT is_system FROM categories WHERE id = ?")
        .bind(&id)
        .fetch_optional(&pool)
        .await?;

    if let Some(row) = category_row {
        let is_system: bool = row.get("is_system");
        if is_system {
            return Err(crate::error::AppError::InvalidInput(
                "Cannot delete system categories".to_string()
            ));
        }
    }

    // Check if category has transactions
    let transaction_count = sqlx::query("SELECT COUNT(*) as count FROM transactions WHERE category_id = ?")
        .bind(&id)
        .fetch_one(&pool)
        .await?;

    let count: i64 = transaction_count.get("count");
    if count > 0 {
        return Err(crate::error::AppError::InvalidInput(
            "Cannot delete category with existing transactions".to_string()
        ));
    }

    let result = sqlx::query("DELETE FROM categories WHERE id = ?")
        .bind(&id)
        .execute(&pool)
        .await?;

    Ok(result.rows_affected() > 0)
}

#[tauri::command]
pub async fn get_category_by_id(
    id: String,
    state: State<'_, AppState>
) -> AppResult<Option<Category>> {
    let pool = state.db.lock().await.get_pool().await?;

    let row = sqlx::query(
        r#"
        SELECT
            id, name, description, color, icon, parent_id, is_system,
            budget_percentage, created_at, updated_at
        FROM categories
        WHERE id = ?
        "#
    )
    .bind(&id)
    .fetch_optional(&pool)
    .await?;

    let category = row.map(|r| {
        crate::models::Category {
            id: r.get("id"),
            name: r.get("name"),
            description: r.get("description"),
            color: r.get("color"),
            icon: r.get("icon"),
            parent_id: r.get("parent_id"),
            is_system: r.get("is_system"),
            budget_percentage: r.get::<Option<String>, _>("budget_percentage").and_then(|s| s.parse().ok()),
            created_at: r.get("created_at"),
            updated_at: r.get("updated_at"),
        }
    });

    Ok(category)
}