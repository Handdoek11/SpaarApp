use crate::error::{AppError, AppResult};
use crate::models::*;
use chrono::Utc;
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqliteSynchronous, SqlitePoolOptions};
use sqlx::{Pool, Sqlite, SqlitePool};
use std::str::FromStr;
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

pub struct Database {
    pool: Arc<Mutex<Option<SqlitePool>>>,
    path: String,
}

impl Database {
    pub async fn new(database_path: &str) -> AppResult<Self> {
        let db = Self {
            pool: Arc::new(Mutex::new(None)),
            path: database_path.to_string(),
        };

        // Initialize database
        db.initialize().await?;

        Ok(db)
    }

    async fn initialize(&self) -> AppResult<()> {
        // Use the path directly for Windows - SQLX will handle it properly
        // For SQLX compile-time verification, use unencrypted connection
        // For runtime, apply encryption if enabled
        let is_compile_time = std::env::var("SQLX_OFFLINE").is_ok() && std::env::var("SQLX_OFFLINE").unwrap() == "true";

        let mut connect_options = SqliteConnectOptions::from_str(&format!("sqlite:{}", self.path))?
            .create_if_missing(true)
            .journal_mode(SqliteJournalMode::Wal)
            .synchronous(SqliteSynchronous::Normal)
            .busy_timeout(std::time::Duration::from_secs(30));

        // Only apply encryption pragmas at runtime, not during compile-time verification
        if !is_compile_time {
            // Configure SQLite connection with encryption
            // Note: SQLCipher encryption key would be set here in production
            // For now, we'll use a default key or get it from environment/config
            let encryption_key = std::env::var("DB_ENCRYPTION_KEY").unwrap_or_else(|_| "spaarapp_default_key".to_string());

            // SQLCipher pragmas for encryption
            connect_options = connect_options
                .pragma("key", encryption_key.clone())
                .pragma("cipher_page_size", "4096")
                .pragma("kdf_iter", "256000")
                .pragma("cipher_hmac_algorithm", "HMAC_SHA512")
                .pragma("cipher_kdf_algorithm", "PBKDF2_HMAC_SHA512");
        }

        // Create connection pool
        let pool = SqlitePoolOptions::new()
            .max_connections(10)
            .connect_with(connect_options)
            .await?;

        // Store pool
        *self.pool.lock().await = Some(pool);

        // Run migrations
        self.migrate().await?;

        // Initialize default data
        self.seed_default_data().await?;

        Ok(())
    }

    async fn migrate(&self) -> AppResult<()> {
        let pool = self.pool.lock().await;
        let pool = pool.as_ref().ok_or("Database not initialized")?;

        // Create tables
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS settings (
                id TEXT PRIMARY KEY,
                currency TEXT NOT NULL DEFAULT 'EUR',
                date_format TEXT NOT NULL DEFAULT 'DD-MM-YYYY',
                theme TEXT NOT NULL DEFAULT 'light',
                language TEXT NOT NULL DEFAULT 'nl',
                notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                auto_categorization_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                ai_insights_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                budget_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                data_retention_days INTEGER NOT NULL DEFAULT 365,
                export_format TEXT NOT NULL DEFAULT 'csv',
                encryption_enabled BOOLEAN NOT NULL DEFAULT TRUE,
                last_backup TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                color TEXT NOT NULL DEFAULT '#2196F3',
                icon TEXT NOT NULL DEFAULT 'category',
                parent_id TEXT,
                is_system BOOLEAN NOT NULL DEFAULT FALSE,
                budget_percentage REAL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (parent_id) REFERENCES categories(id)
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS transactions (
                id TEXT PRIMARY KEY,
                description TEXT NOT NULL,
                amount DECIMAL(15,2) NOT NULL,
                date DATETIME NOT NULL,
                category_id TEXT,
                account_number TEXT,
                account_holder TEXT,
                transaction_type TEXT NOT NULL DEFAULT 'debit',
                balance_after DECIMAL(15,2),
                notes TEXT,
                tags TEXT DEFAULT '[]',
                is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
                recurring_frequency TEXT,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS budgets (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category_id TEXT,
                amount DECIMAL(15,2) NOT NULL,
                period TEXT NOT NULL DEFAULT 'monthly',
                spent DECIMAL(15,2) NOT NULL DEFAULT 0,
                remaining DECIMAL(15,2) GENERATED ALWAYS AS (amount - spent) STORED,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                notification_threshold DECIMAL(15,2),
                start_date DATETIME NOT NULL,
                end_date DATETIME,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id)
            )
            "#,
        )
        .execute(pool)
        .await?;

        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS financial_insights (
                id TEXT PRIMARY KEY,
                insight_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                impact TEXT NOT NULL,
                actionable BOOLEAN NOT NULL DEFAULT TRUE,
                action_suggestions TEXT DEFAULT '[]',
                confidence_score REAL NOT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#,
        )
        .execute(pool)
        .await?;

        // Create indexes for better performance
        let indexes = vec![
            "CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)",
            "CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)",
            "CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type)",
            "CREATE INDEX IF NOT EXISTS idx_transactions_recurring ON transactions(is_recurring)",
            "CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id)",
            "CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active)",
            "CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id)",
        ];

        for index in indexes {
            sqlx::query(index).execute(pool).await?;
        }

        Ok(())
    }

    async fn seed_default_data(&self) -> AppResult<()> {
        let pool = self.pool.lock().await;
        let pool = pool.as_ref().ok_or("Database not initialized")?;

        // Insert default settings if not exists
        let default_settings = Settings::default();
        sqlx::query(
            r#"
            INSERT OR IGNORE INTO settings (
                id, currency, date_format, theme, language, notifications_enabled,
                auto_categorization_enabled, ai_insights_enabled, budget_alerts_enabled,
                data_retention_days, export_format, encryption_enabled, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&default_settings.id)
        .bind(&default_settings.currency)
        .bind(&default_settings.date_format)
        .bind(&default_settings.theme)
        .bind(&default_settings.language)
        .bind(default_settings.notifications_enabled)
        .bind(default_settings.auto_categorization_enabled)
        .bind(default_settings.ai_insights_enabled)
        .bind(default_settings.budget_alerts_enabled)
        .bind(default_settings.data_retention_days)
        .bind(&default_settings.export_format)
        .bind(default_settings.encryption_enabled)
        .bind(default_settings.created_at)
        .bind(default_settings.updated_at)
        .execute(pool)
        .await?;

        // Insert default categories
        let default_categories = vec![
            ("Boodschappen", "#4CAF50", "shopping_cart"),
            ("Huur", "#2196F3", "home"),
            ("Utilities", "#FF9800", "bolt"),
            ("Vervoer", "#9C27B0", "directions_car"),
            ("Entertainment", "#E91E63", "movie"),
            ("Gezondheid", "#00BCD4", "local_hospital"),
            ("Kleding", "#795548", "checkroom"),
            ("Eten & Drinken", "#FF5722", "restaurant"),
            ("Sparen", "#4CAF50", "savings"),
            ("Inkomen", "#8BC34A", "account_balance"),
        ];

        for (name, color, icon) in default_categories {
            let id = Uuid::new_v4().to_string();
            sqlx::query(
                r#"
                INSERT OR IGNORE INTO categories (id, name, color, icon, is_system, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                "#,
            )
            .bind(id)
            .bind(name)
            .bind(color)
            .bind(icon)
            .bind(true)
            .bind(Utc::now())
            .bind(Utc::now())
            .execute(pool)
            .await?;
        }

        Ok(())
    }

    pub async fn get_pool(&self) -> AppResult<SqlitePool> {
        let pool = self.pool.lock().await;
        pool.as_ref()
            .ok_or(AppError::Database(sqlx::Error::Configuration("Database not initialized".into())))
            .cloned()
    }
}

// Database helper functions
pub async fn execute_query<T>(
    pool: &SqlitePool,
    query: &str,
    params: T,
) -> AppResult<sqlx::sqlite::SqliteQueryResult>
where
    T: sqlx::IntoArguments<'static, sqlx::Sqlite> + Send,
{
    Ok(sqlx::query(query).execute(pool).await?)
}

pub async fn fetch_one<O>(
    pool: &SqlitePool,
    query: &str,
) -> AppResult<O>
where
    O: for<'r> sqlx::FromRow<'r, sqlx::sqlite::SqliteRow> + Send + Unpin,
{
    Ok(sqlx::query_as::<_, O>(query).fetch_one(pool).await?)
}

pub async fn fetch_all<O>(
    pool: &SqlitePool,
    query: &str,
) -> AppResult<Vec<O>>
where
    O: for<'r> sqlx::FromRow<'r, sqlx::sqlite::SqliteRow> + Send + Unpin,
{
    Ok(sqlx::query_as::<_, O>(query).fetch_all(pool).await?)
}

// Database testing and verification methods
impl Database {
    /// Test database connectivity and encryption
    pub async fn test_connection(&self) -> AppResult<bool> {
        let pool = self.get_pool().await?;

        // Simple test query to verify connection and encryption
        let result: Option<i64> = sqlx::query_scalar("SELECT 1")
            .fetch_one(&pool)
            .await?;

        Ok(result == Some(1))
    }

    /// Verify database encryption is working
    pub async fn verify_encryption(&self) -> AppResult<bool> {
        let pool = self.get_pool().await?;

        // Test if SQLCipher is active by checking cipher_version
        let cipher_version: Option<String> = sqlx::query_scalar("PRAGMA cipher_version")
            .fetch_one(&pool)
            .await?;

        match cipher_version {
            Some(version) => {
                tracing::info!("SQLCipher version: {}", version);
                Ok(!version.is_empty())
            }
            None => {
                tracing::warn!("SQLCipher not detected - database may not be encrypted");
                Ok(false)
            }
        }
    }

    /// Get database statistics
    pub async fn get_database_stats(&self) -> AppResult<serde_json::Value> {
        let pool = self.get_pool().await?;

        let transaction_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM transactions")
            .fetch_one(&pool)
            .await?;

        let category_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM categories")
            .fetch_one(&pool)
            .await?;

        let budget_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM budgets")
            .fetch_one(&pool)
            .await?;

        Ok(serde_json::json!({
            "transactions": transaction_count,
            "categories": category_count,
            "budgets": budget_count,
            "database_path": self.path,
            "encrypted": self.verify_encryption().await.unwrap_or(false)
        }))
    }
}