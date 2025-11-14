// Shared utility functions between frontend and backend
use chrono::{DateTime, Utc};

/// Format a monetary amount in Dutch format
pub fn format_currency(amount: f64) -> String {
    format!("€{:.2}", amount.abs())
}

/// Format a date in Dutch format
pub fn format_date(date_str: &str) -> Result<String, Box<dyn std::error::Error>> {
    let dt = DateTime::parse_from_rfc3339(date_str)?;
    Ok(dt.format("%d-%m-%Y").to_string())
}

/// Calculate percentage of budget spent
pub fn calculate_budget_percentage(spent: f64, budget: f64) -> f64 {
    if budget == 0.0 {
        0.0
    } else {
        (spent / budget * 100.0).min(100.0)
    }
}

/// Validate IBAN (basic implementation)
pub fn validate_iban(iban: &str) -> bool {
    // Simple length check - full IBAN validation would be more complex
    let cleaned = iban.replace(" ", "").to_uppercase();
    cleaned.len() >= 15 && cleaned.len() <= 34
}