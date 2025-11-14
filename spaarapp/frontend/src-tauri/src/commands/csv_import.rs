use crate::error::AppResult;
use crate::models::{Transaction, TransactionType, CsvImportConfig};
use chrono::{DateTime, NaiveDate, Utc};
use csv::{ReaderBuilder, StringRecord};
use rust_decimal::Decimal;
use std::collections::HashMap;
use std::io::Cursor;
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CsvImportResult {
    pub transactions: Vec<Transaction>,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
    pub total_rows: usize,
    pub imported_rows: usize,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct RabobankTransaction {
    pub datum: String,
    pub naam_omschrijving: String,
    pub rekening: String,
    pub tegenrekening: String,
    pub code: String,
    pub af_bij: String,
    pub bedrag: String,
    pub mutatiesoort: String,
    pub mededelingen: String,
}

#[tauri::command]
pub async fn import_csv(file_path: String) -> AppResult<CsvImportResult> {
    let content = std::fs::read_to_string(&file_path)?;
    parse_rabobank_csv(content).await
}

#[tauri::command]
pub async fn parse_csv(content: String) -> AppResult<CsvImportResult> {
    parse_rabobank_csv(content).await
}

#[tauri::command]
pub async fn preview_csv(content: String, limit: Option<usize>) -> AppResult<CsvImportResult> {
    let mut result = parse_rabobank_csv(content).await?;
    if let Some(limit) = limit {
        result.transactions.truncate(limit);
    }
    Ok(result)
}

#[tauri::command]
pub async fn validate_csv_structure(content: String) -> AppResult<bool> {
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .has_headers(true)
        .from_reader(Cursor::new(content));

    let headers = rdr.headers()?;

    let required_headers = vec![
        "Datum",
        "Naam/Omschrijving",
        "Rekening",
        "Tegenrekening",
        "Code",
        "Af/Bij",
        "Bedrag",
        "MutatieSoort",
        "Mededelingen",
    ];

    for header in &required_headers {
        if !headers.iter().any(|h| h.trim() == *header) {
            return Ok(false);
        }
    }

    Ok(true)
}

async fn parse_rabobank_csv(content: String) -> AppResult<CsvImportResult> {
    let mut rdr = ReaderBuilder::new()
        .delimiter(b';')
        .has_headers(true)
        .from_reader(Cursor::new(content));

    let mut transactions = Vec::new();
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    let mut total_rows = 0;

    let headers = rdr.headers()?.clone();
    let header_map: HashMap<String, usize> = headers
        .iter()
        .enumerate()
        .map(|(i, h)| (h.trim().to_string(), i))
        .collect();

    for (line_num, result) in rdr.records().enumerate() {
        total_rows += 1;

        let record = match result {
            Ok(r) => r,
            Err(e) => {
                errors.push(format!("Fout op regel {}: {}", line_num + 2, e));
                continue;
            }
        };

        match parse_rabobank_record(&record, &header_map, line_num + 2) {
            Ok(mut transaction) => {
                // Auto-categorize based on description
                transaction.category_id = auto_categorize(&transaction.description);

                // Check for potential duplicates
                if transactions.iter().any(|t: &crate::models::Transaction| {
                    t.date == transaction.date
                    && t.description == transaction.description
                    && t.amount == transaction.amount
                }) {
                    warnings.push(format!(
                        "Mogelijke duplicaat gevonden op regel {}: {} ({}: {})",
                        line_num + 2,
                        transaction.description,
                        transaction.date.format("%d-%m-%Y"),
                        transaction.amount
                    ));
                }

                transactions.push(transaction);
            }
            Err(e) => {
                errors.push(format!("Fout op regel {}: {}", line_num + 2, e));
            }
        }
    }

    let imported_rows = transactions.len();

    // Add summary warnings
    if transactions.is_empty() {
        warnings.push("Geen geldige transacties gevonden in het CSV-bestand".to_string());
    }

    Ok(CsvImportResult {
        transactions,
        errors,
        warnings,
        total_rows,
        imported_rows,
    })
}

fn parse_rabobank_record(
    record: &StringRecord,
    header_map: &HashMap<String, usize>,
    line_num: usize,
) -> AppResult<Transaction> {
    // Extract fields using flexible header matching
    let get_field = |headers: &[&str]| {
        for header in headers {
            if let Some(idx) = header_map.get(&header.to_string()) {
                return record.get(*idx).unwrap_or("").trim();
            }
        }
        ""
    };

    let datum_str = get_field(&["Datum", "datum"]);
    let naam_omschrijving = get_field(&["Naam/Omschrijving", "Naam", "Omschrijving"]);
    let rekening = get_field(&["Rekening", "rekening"]);
    let tegenrekening = get_field(&["Tegenrekening", "tegenrekening"]);
    let af_bij = get_field(&["Af/Bij", "Af", "Bij"]);
    let bedrag_str = get_field(&["Bedrag", "bedrag"]);
    let mutatiesoort = get_field(&["MutatieSoort", "Mutatie"]);
    let mededelingen = get_field(&["Mededelingen", "Mededeling"]);

    // Parse date (DD-MM-YYYY format)
    let date = if datum_str.is_empty() {
        return Err(anyhow::anyhow!("Datum is leeg op regel {}", line_num).into());
    } else {
        // Try different date formats
        let formats = ["%d-%m-%Y", "%d/%m/%Y", "%Y-%m-%d", "%d-%m-%y"];
        let mut parsed_date = None;

        for format in &formats {
            if let Ok(naive_date) = NaiveDate::parse_from_str(datum_str, format) {
                parsed_date = Some(DateTime::from_naive_utc_and_offset(
                    naive_date.and_hms_opt(12, 0, 0).unwrap(),
                    Utc,
                ));
                break;
            }
        }

        parsed_date.ok_or_else(|| {
            anyhow::anyhow!("Ongeldige datum formaat: {} op regel {}", datum_str, line_num)
        })?
    };

    // Parse amount (handle Dutch decimal separator and currency)
    let amount_clean = bedrag_str
        .replace("€", "")
        .replace(".", "")
        .replace(",", ".")
        .trim()
        .to_string();

    let amount = if amount_clean.is_empty() || amount_clean == "0" {
        return Err(anyhow::anyhow!("Bedrag is ongeldig: {} op regel {}", bedrag_str, line_num).into());
    } else {
        Decimal::from_str(&amount_clean).map_err(|_| {
            anyhow::anyhow!("Kan bedrag niet parseren: {} op regel {}", bedrag_str, line_num)
        })?
    };

    // Determine transaction type
    let transaction_type = match af_bij.to_lowercase().as_str() {
        "bij" => "credit".to_string(),
        "af" => "debit".to_string(),
        _ => {
            // Try to determine from amount sign or description
            if amount < Decimal::ZERO {
                "debit".to_string()
            } else {
                "credit".to_string()
            }
        }
    };

    // Create description
    let mut description_parts = Vec::new();
    if !naam_omschrijving.is_empty() {
        description_parts.push(naam_omschrijving.to_string());
    }
    if !mutatiesoort.is_empty() && mutatiesoort != "GT" {
        description_parts.push(mutatiesoort.to_string());
    }
    if !mededelingen.is_empty() {
        description_parts.push(mededelingen.to_string());
    }

    let description = if description_parts.is_empty() {
        "Onbekende transactie".to_string()
    } else {
        description_parts.join(" - ")
    };

    let now = Utc::now();

    Ok(Transaction {
        id: Uuid::new_v4().to_string(),
        description,
        amount: amount.abs(),
        date,
        category_id: None,
        account_number: Some(rekening.to_string()),
        account_holder: Some(tegenrekening.to_string()),
        transaction_type,
        balance_after: None,
        notes: if !mededelingen.is_empty() { Some(mededelingen.to_string()) } else { None },
        tags: serde_json::to_string(&extract_tags(&naam_omschrijving, &mutatiesoort, &mededelingen)).unwrap_or_default(),
        is_recurring: is_recurring_transaction(&naam_omschrijving, &mutatiesoort),
        recurring_frequency: detect_recurring_frequency(&naam_omschrijving),
        created_at: now,
        updated_at: now,
    })
}

fn auto_categorize(description: &str) -> Option<String> {
    let desc_lower = description.to_lowercase();

    // Common Dutch keywords for categories
    let categories: &[(&str, &[&str])] = &[
        ("supermarkt", &["albert heijn", "jumbo", "plus", "dirk", "c1000", "vomar", "dekamarkt", "ekoplaza"]),
        ("boodschappen", &["ah", "picnic", "gorillas", "flinck", "crisp"]),
        ("restaurant", &["restaurant", "cafe", "bar", "eetcafe", "lunch", "diner"]),
        ("fastfood", &["mcdonald", "bk", "burger king", "kfc", "subway", "dominos"]),
        ("woning", &["huur", "hypotheek", "energie", "gas", "elektra", "water", "vve"]),
        ("verzekering", &["verzekering", "inz", "cz", "menzis", "aegon", "nn"]),
        ("telecom", &["kpn", "vodafone", "t-mobile", "ziggo", "tele2"]),
        ("transport", &["ns", "ov", "trein", "bus", "tram", "metro", "benzine", "shell", "bp", "total"]),
        ("internet", &["ziggo", "kpn", "t-mobile", "online"]),
        ("salaris", &["salaris", "loon", "inkomen"]),
        ("belasting", &["belasting", "toeslag", "douane"]),
        ("entertainment", &["netflix", "spotify", "videoland", "bol.com", "amazon", "coolblue"]),
        ("sport", &["sportschool", "fitness", "gym", "basic-fit"]),
        ("kleding", &["h&m", "zara", "c&a", "we", "bijenkorf"]),
        ("gezondheid", &["apotheek", "huisarts", "ziekenhuis", "tandarts"]),
        ("onderwijs", &["school", "universiteit", "studie", "les", "cursus"]),
    ];

    for (category_id, keywords) in categories {
        for keyword in keywords.iter() {
            if desc_lower.contains(keyword) {
                return Some(category_id.to_string());
            }
        }
    }

    None
}

fn extract_tags(naam: &str, mutatiesoort: &str, mededelingen: &str) -> Vec<String> {
    let mut tags = Vec::new();
    let text = format!("{} {} {}", naam, mutatiesoort, mededelingen).to_lowercase();

    // Common tags
    if text.contains("incasso") || text.contains("sepa") {
        tags.push("automatische incasso".to_string());
    }
    if text.contains("ideal") {
        tags.push("iDEAL".to_string());
    }
    if text.contains("pin") {
        tags.push("pinbetaling".to_string());
    }
    if text.contains("online") || text.contains("webshop") {
        tags.push("online".to_string());
    }
    if text.contains("cash") || text.contains("geldautomaat") {
        tags.push("contant".to_string());
    }
    if text.contains("gift") || text.contains("cadeau") {
        tags.push("geschenk".to_string());
    }

    tags
}

fn is_recurring_transaction(naam: &str, mutatiesoort: &str) -> bool {
    let text = format!("{} {}", naam, mutatiesoort).to_lowercase();

    text.contains("incasso")
        || text.contains("periodiek")
        || text.contains("maandelijks")
        || text.contains("kwartaal")
        || text.contains("jaarlijks")
        || text.contains("abonnement")
        || text.contains("verzekering")
}

fn detect_recurring_frequency(description: &str) -> Option<String> {
    let desc_lower = description.to_lowercase();

    if desc_lower.contains("maandelijks") || desc_lower.contains("per maand") {
        Some("maandelijks".to_string())
    } else if desc_lower.contains("wekelijks") || desc_lower.contains("per week") {
        Some("wekelijks".to_string())
    } else if desc_lower.contains("kwartaal") || desc_lower.contains("per kwartaal") {
        Some("per kwartaal".to_string())
    } else if desc_lower.contains("jaarlijks") || desc_lower.contains("per jaar") {
        Some("jaarlijks".to_string())
    } else {
        None
    }
}