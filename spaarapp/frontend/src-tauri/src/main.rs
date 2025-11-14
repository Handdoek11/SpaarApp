// Prevent additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod models;
mod commands;
mod encryption;
mod csv_import;
mod ai_insights;
mod error;

use database::Database;
use error::AppError;
use std::sync::Arc;
use tokio::sync::Mutex;

pub type AppDatabase = Arc<Mutex<Database>>;

#[derive(Clone)]
pub struct AppState {
    pub db: AppDatabase,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize tracing
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .init();

    // Initialize the runtime and database
    let rt = tokio::runtime::Runtime::new().expect("Failed to create Tokio runtime");

    let db = rt.block_on(async {
        match Database::new("spaarapp.db").await {
            Ok(db) => {
                tracing::info!("Database initialized successfully");
                Arc::new(Mutex::new(db))
            }
            Err(e) => {
                tracing::error!("Failed to initialize database: {}", e);
                panic!("Database initialization failed: {}", e);
            }
        }
    });

    let state = AppState { db };

    tauri::Builder::default()
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            // Transaction commands
            commands::transactions::get_transactions,
            commands::transactions::add_transaction,
            commands::transactions::update_transaction,
            commands::transactions::delete_transaction,
            commands::transactions::get_transaction_by_id,

            // Category commands
            commands::categories::get_categories,
            commands::categories::add_category,
            commands::categories::update_category,
            commands::categories::delete_category,
            commands::categories::get_category_by_id,

            // Budget commands
            commands::budgets::get_budgets,
            commands::budgets::add_budget,
            commands::budgets::update_budget,
            commands::budgets::delete_budget,
            commands::budgets::get_budget_by_id,
            commands::budgets::get_budget_summary,
            commands::budgets::update_budget_spending,

            // CSV import commands
            commands::csv_import::import_csv,
            commands::csv_import::parse_csv,
            commands::csv_import::preview_csv,
            commands::csv_import::validate_csv_structure,

            // AI insights commands
            commands::ai_insights::get_financial_insights,
            commands::ai_insights::analyze_spending_patterns,
            commands::ai_insights::get_budget_recommendations,

            // Settings commands
            commands::settings::get_settings,
            commands::settings::update_settings,
            commands::settings::reset_settings_to_default,

            // File system commands
            commands::files::read_file,
            commands::files::write_file,
            commands::files::select_file,

            // App info commands
            commands::app::get_app_info,
            commands::app::get_version,
            commands::app::get_platform,
            commands::app::test_database,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run()
}
