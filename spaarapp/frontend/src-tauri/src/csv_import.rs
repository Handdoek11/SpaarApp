use crate::error::{AppError, AppResult};
use crate::models::{CsvImportConfig, Transaction};
use csv::ReaderBuilder;
use chrono::{DateTime, Utc, NaiveDate};
use rust_decimal::Decimal;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct CsvRow {
    // Generic CSV row - will be mapped based on configuration
    fields: Vec<String>,
}

pub struct CsvImporter {
    config: CsvImportConfig,
}

impl CsvImporter {
    pub fn new(config: CsvImportConfig) -> Self {
        Self { config }
    }

    pub async fn import_from_file(&self, file_path: &str) -> AppResult<Vec<Transaction>> {
        let content = std::fs::read_to_string(file_path)
            .map_err(|e| AppError::Io(e))?;

        self.parse_csv_content(&content).await
    }

    pub async fn parse_csv_content(&self, content: &str) -> AppResult<Vec<Transaction>> {
        let mut rdr = ReaderBuilder::new()
            .delimiter(self.config.delimiter.chars().next().unwrap_or(',') as u8)
            .has_headers(self.config.has_header_row)
            .from_reader(content.as_bytes());

        let mut transactions = Vec::new();
        let mut record_number = 0;

        for result in rdr.records() {
            record_number += 1;

            let record = result.map_err(|e| {
                AppError::Csv(csv::Error::from(e))
            })?;

            let transaction = self.map_record_to_transaction(&record, record_number)
                .map_err(|e| {
                    AppError::InvalidInput(format!("Record {}: {}", record_number, e))
                })?;

            if let Some(tx) = transaction {
                transactions.push(tx);
            }
        }

        Ok(transactions)
    }

    fn map_record_to_transaction(
        &self,
        record: &csv::StringRecord,
        record_number: u32,
    ) -> AppResult<Option<Transaction>> {
        // Extract date
        let date_str = self.get_field_value(record, &self.config.column_mapping.date)
            .ok_or_else(|| "Missing date field".to_string())?;

        let date = self.parse_date(&date_str)?;

        // Extract description
        let description = self.get_field_value(record, &self.config.column_mapping.description)
            .unwrap_or_else(|| "Unknown transaction".to_string());

        // Extract amount
        let amount_str = self.get_field_value(record, &self.config.column_mapping.amount)
            .ok_or_else(|| "Missing amount field".to_string())?;

        let amount = Decimal::from_str_radix(&amount_str.replace(',', "."), 10)
            .map_err(|e| format!("Invalid amount: {}", e))?;

        // Determine transaction type from amount sign
        let transaction_type = if amount.is_sign_negative() {
            "debit".to_string()
        } else {
            "credit".to_string()
        };

        // Extract optional fields
        let account_number = self.get_field_value(record, &self.config.column_mapping.account_number);
        let account_holder = self.get_field_value(record, &self.config.column_mapping.account_holder);
        let balance_after_str = self.get_field_value(record, &self.config.column_mapping.balance_after);

        let balance_after = balance_after_str
            .and_then(|s| Decimal::from_str_radix(&s.replace(',', "."), 10).ok());

        // Create transaction
        let transaction = Transaction {
            id: uuid::Uuid::new_v4().to_string(),
            description,
            amount: amount.abs(),
            date: DateTime::from_naive_utc_and_offset(date.and_hms_opt(12, 0, 0).unwrap_or_default(), Utc),
            category_id: None, // Will be set by auto-categorization
            account_number,
            account_holder,
            transaction_type,
            balance_after,
            notes: Some(format!("Imported from CSV - Record {}", record_number)),
            tags: serde_json::to_string(&vec!["imported".to_string()]).unwrap_or_default(),
            is_recurring: false,
            recurring_frequency: None,
            created_at: Utc::now(),
            updated_at: Utc::now(),
        };

        Ok(Some(transaction))
    }

    fn get_field_value(&self, record: &csv::StringRecord, index: &Option<usize>) -> Option<String> {
        index.and_then(|i| record.get(i).map(|s| s.trim().to_string()))
            .filter(|s| !s.is_empty())
    }

    fn parse_date(&self, date_str: &str) -> AppResult<NaiveDate> {
        // Try different date formats commonly used by Dutch banks
        let formats = [
            "%Y%m%d",    // YYYYMMDD (Rabobank format)
            "%d-%m-%Y",  // DD-MM-YYYY
            "%d/%m/%Y",  // DD/MM/YYYY
            "%Y-%m-%d",  // YYYY-MM-DD
            "%d.%m.%Y",  // DD.MM.YYYY
        ];

        for format in &formats {
            if let Ok(date) = NaiveDate::parse_from_str(date_str, format) {
                return Ok(date);
            }
        }

        Err(AppError::InvalidInput(format!(
            "Unable to parse date '{}' with any known format",
            date_str
        )))
    }
}

// Import function for Rabobank CSV format
pub fn import_rabobank_csv(file_path: &str) -> AppResult<Vec<Transaction>> {
    let config = CsvImportConfig::default();
    let importer = CsvImporter::new(config);

    tokio::task::block_in_place(|| {
        tokio::runtime::Handle::current().block_on(importer.import_from_file(file_path))
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_date_parsing() {
        let config = CsvImportConfig::default();
        let importer = CsvImporter::new(config);

        assert!(importer.parse_date("20241112").is_ok());
        assert!(importer.parse_date("12-11-2024").is_ok());
        assert!(importer.parse_date("12/11/2024").is_ok());
        assert!(importer.parse_date("2024-11-12").is_ok());
        assert!(importer.parse_date("invalid").is_err());
    }
}