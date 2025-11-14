use chrono::{DateTime, Utc};
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub description: String,
    // SQLX mapping: try from "0.0"
    pub amount: rust_decimal::Decimal,
    pub date: chrono::DateTime<chrono::Utc>,
    pub category_id: Option<String>,
    pub account_number: Option<String>,
    pub account_holder: Option<String>,
    pub transaction_type: String, // Store as string to avoid enum complications
    // SQLX mapping: try from "0.0"
    pub balance_after: Option<rust_decimal::Decimal>,
    pub notes: Option<String>,
    pub tags: String, // Store as JSON string instead of Vec<String>
    pub is_recurring: bool,
    pub recurring_frequency: Option<String>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TransactionType {
    Credit,
    Debit,
}

impl Default for TransactionType {
    fn default() -> Self {
        TransactionType::Debit
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: String,
    pub icon: String,
    pub parent_id: Option<String>,
    pub is_system: bool,
    // SQLX mapping: try from "0.0"
    pub budget_percentage: Option<rust_decimal::Decimal>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Budget {
    pub id: String,
    pub name: String,
    pub category_id: Option<String>,
    // SQLX mapping: try from "0.0"
    pub amount: rust_decimal::Decimal,
    pub period: String, // Store as string to avoid enum complications
    // SQLX mapping: try from "0.0"
    pub spent: rust_decimal::Decimal,
    pub remaining: rust_decimal::Decimal,
    pub is_active: bool,
    // Skip SQLX mapping
    pub notification_threshold: Option<rust_decimal::Decimal>,
    pub start_date: chrono::DateTime<chrono::Utc>,
    // Skip SQLX mapping
    pub end_date: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BudgetPeriod {
    Weekly,
    Monthly,
    Quarterly,
    Yearly,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialInsight {
    pub id: String,
    pub insight_type: String, // Store as string to avoid enum complications
    pub title: String,
    pub description: String,
    pub impact: String, // Store as string to avoid enum complications
    pub actionable: bool,
    pub action_suggestions: String, // Store as JSON string instead of Vec<String>
    pub confidence_score: f64,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InsightType {
    SpendingPattern,
    BudgetOptimization,
    SavingsOpportunity,
    UnusualActivity,
    RecurringExpense,
    GoalProgress,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InsightImpact {
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpendingAnalysis {
    pub total_spending: rust_decimal::Decimal,
    pub total_income: rust_decimal::Decimal,
    pub net_savings: rust_decimal::Decimal,
    pub top_categories: Vec<CategorySpending>,
    pub average_daily_spending: rust_decimal::Decimal,
    pub spending_trend: TrendDirection,
    pub period_start: chrono::DateTime<chrono::Utc>,
    pub period_end: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategorySpending {
    pub category_id: String,
    pub category_name: String,
    pub amount: rust_decimal::Decimal,
    pub transaction_count: u32,
    pub percentage: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Increasing,
    Decreasing,
    Stable,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub id: String,
    pub currency: String,
    pub date_format: String,
    pub theme: String,
    pub language: String,
    pub notifications_enabled: bool,
    pub auto_categorization_enabled: bool,
    pub ai_insights_enabled: bool,
    pub budget_alerts_enabled: bool,
    pub data_retention_days: u32,
    pub export_format: String,
    pub encryption_enabled: bool,
    // Skip SQLX mapping
    pub last_backup: Option<chrono::DateTime<chrono::Utc>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub updated_at: chrono::DateTime<chrono::Utc>,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            currency: "EUR".to_string(),
            date_format: "DD-MM-YYYY".to_string(),
            theme: "light".to_string(),
            language: "nl".to_string(),
            notifications_enabled: true,
            auto_categorization_enabled: true,
            ai_insights_enabled: true,
            budget_alerts_enabled: true,
            data_retention_days: 365,
            export_format: "csv".to_string(),
            encryption_enabled: true,
            last_backup: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CsvImportConfig {
    pub bank: String,
    pub date_format: String,
    pub delimiter: String,
    pub encoding: String,
    pub has_header_row: bool,
    pub column_mapping: ColumnMapping,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColumnMapping {
    pub date: Option<usize>,
    pub description: Option<usize>,
    pub amount: Option<usize>,
    pub account_number: Option<usize>,
    pub account_holder: Option<usize>,
    pub transaction_type: Option<usize>,
    pub balance_after: Option<usize>,
}

impl Default for CsvImportConfig {
    fn default() -> Self {
        Self {
            bank: "rabobank".to_string(),
            date_format: "YYYYMMDD".to_string(),
            delimiter: ",".to_string(),
            encoding: "utf-8".to_string(),
            has_header_row: true,
            column_mapping: ColumnMapping {
                date: Some(0),
                description: Some(1),
                amount: Some(2),
                account_number: Some(3),
                account_holder: Some(4),
                transaction_type: Some(5),
                balance_after: Some(6),
            },
        }
    }
}