// SpaarApp Security Configuration
// Financial-grade security implementation for Dutch compliance

use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use anyhow::Result;

/// Security configuration for the application
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityConfig {
    /// Encryption settings
    pub encryption: EncryptionConfig,

    /// Database security
    pub database: DatabaseSecurityConfig,

    /// API security
    pub api: ApiSecurityConfig,

    /// Audit logging
    pub audit: AuditConfig,

    /// GDPR compliance
    pub gdpr: GdprConfig,

    /// Financial security
    pub financial: FinancialSecurityConfig,
}

/// Encryption configuration using industry standards
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptionConfig {
    /// Encryption algorithm (AES-256-GCM recommended)
    pub algorithm: String,

    /// Key derivation iterations for PBKDF2
    pub key_derivations_iterations: u32,

    /// Salt length in bytes
    pub salt_length: usize,

    /// IV length in bytes
    pub iv_length: usize,

    /// Key rotation period in days
    pub key_rotation_days: u32,

    /// Memory limit for key derivation (KB)
    pub memory_limit_kb: u32,
}

impl Default for EncryptionConfig {
    fn default() -> Self {
        Self {
            algorithm: "AES-256-GCM".to_string(),
            key_derivations_iterations: 100_000, // OWASP recommended
            salt_length: 32,
            iv_length: 12,
            key_rotation_days: 90,
            memory_limit_kb: 64 * 1024, // 64MB
        }
    }
}

/// Database security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseSecurityConfig {
    /// Enable database encryption
    pub encryption_enabled: bool,

    /// Connection timeout in seconds
    pub connection_timeout_secs: u64,

    /// Maximum connection pool size
    pub max_pool_size: u32,

    /// Enable query logging for audit
    pub enable_query_logging: bool,

    /// Auto-vacuum threshold (MB)
    pub auto_vacuum_threshold_mb: u32,

    /// Backup encryption enabled
    pub backup_encryption_enabled: bool,

    /// Retention period for audit logs (days)
    pub audit_retention_days: u32,
}

impl Default for DatabaseSecurityConfig {
    fn default() -> Self {
        Self {
            encryption_enabled: true,
            connection_timeout_secs: 30,
            max_pool_size: 10,
            enable_query_logging: true,
            auto_vacuum_threshold_mb: 100,
            backup_encryption_enabled: true,
            audit_retention_days: 365 * 7, // 7 years for financial compliance
        }
    }
}

/// API security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiSecurityConfig {
    /// Claude API security
    pub claude: ClaudeApiSecurity,

    /// Rate limiting
    pub rate_limiting: RateLimitConfig,

    /// Request validation
    pub request_validation: RequestValidationConfig,

    /// CORS settings
    pub cors: CorsConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClaudeApiSecurity {
    /// Maximum request size in characters
    pub max_request_chars: usize,

    /// Maximum tokens per request
    pub max_tokens_per_request: usize,

    /// Cost limit per month in EUR
    pub monthly_cost_limit_eur: rust_decimal::Decimal,

    /// Enable content filtering
    pub enable_content_filtering: bool,

    /// Allowed operations
    pub allowed_operations: Vec<String>,

    /// PII detection enabled
    pub pii_detection_enabled: bool,
}

impl Default for ClaudeApiSecurity {
    fn default() -> Self {
        Self {
            max_request_chars: 100_000,
            max_tokens_per_request: 4096,
            monthly_cost_limit_eur: rust_decimal::Decimal::new(1000, 2), // €10.00
            enable_content_filtering: true,
            allowed_operations: vec![
                "analyze_transactions".to_string(),
                "categorize_expenses".to_string(),
                "generate_insights".to_string(),
                "budget_optimization".to_string(),
            ],
            pii_detection_enabled: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RateLimitConfig {
    /// Requests per minute
    pub requests_per_minute: u32,

    /// Burst limit
    pub burst_limit: u32,

    /// Rate limit window in seconds
    pub window_secs: u64,

    /// Enable exponential backoff
    pub enable_exponential_backoff: bool,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            requests_per_minute: 60,
            burst_limit: 10,
            window_secs: 60,
            enable_exponential_backoff: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RequestValidationConfig {
    /// Maximum request body size in bytes
    pub max_body_size_bytes: usize,

    /// Required headers
    pub required_headers: Vec<String>,

    /// Blocked user agents
    pub blocked_user_agents: Vec<String>,

    /// Enable IP whitelisting
    pub enable_ip_whitelist: bool,

    /// Whitelisted IPs
    pub whitelisted_ips: Vec<String>,
}

impl Default for RequestValidationConfig {
    fn default() -> Self {
        Self {
            max_body_size_bytes: 10 * 1024 * 1024, // 10MB
            required_headers: vec!["content-type".to_string()],
            blocked_user_agents: vec![
                "curl".to_string(),
                "wget".to_string(),
            ],
            enable_ip_whitelist: false,
            whitelisted_ips: vec![],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorsConfig {
    /// Allowed origins
    pub allowed_origins: Vec<String>,

    /// Allowed methods
    pub allowed_methods: Vec<String>,

    /// Allowed headers
    pub allowed_headers: Vec<String>,

    /// Max age in seconds
    pub max_age_secs: u64,
}

impl Default for CorsConfig {
    fn default() -> Self {
        Self {
            allowed_origins: vec!["http://localhost:1420".to_string()],
            allowed_methods: vec![
                "GET".to_string(),
                "POST".to_string(),
                "PUT".to_string(),
                "DELETE".to_string(),
            ],
            allowed_headers: vec![
                "content-type".to_string(),
                "authorization".to_string(),
            ],
            max_age_secs: 3600,
        }
    }
}

/// Audit logging configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditConfig {
    /// Enable audit logging
    pub enabled: bool,

    /// Log file path
    pub log_file_path: Option<PathBuf>,

    /// Maximum log file size in MB
    pub max_file_size_mb: u32,

    /// Number of log files to retain
    pub retain_files: u32,

    /// Log level
    pub log_level: String,

    /// Enable real-time monitoring
    pub enable_real_time_monitoring: bool,

    /// Alert threshold for suspicious activity
    pub alert_threshold: AlertThreshold,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AlertThreshold {
    /// Failed login attempts
    pub failed_login_attempts: u32,

    /// Data export attempts per hour
    pub data_export_attempts_per_hour: u32,

    /// Unusual transaction amounts
    pub unusual_transaction_multiplier: rust_decimal::Decimal,

    /// API calls per minute
    pub api_calls_per_minute: u32,
}

impl Default for AlertThreshold {
    fn default() -> Self {
        Self {
            failed_login_attempts: 5,
            data_export_attempts_per_hour: 10,
            unusual_transaction_multiplier: rust_decimal::Decimal::new(500, 2), // 5x normal
            api_calls_per_minute: 100,
        }
    }
}

impl Default for AuditConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            log_file_path: Some(PathBuf::from("logs/audit.log")),
            max_file_size_mb: 100,
            retain_files: 30,
            log_level: "INFO".to_string(),
            enable_real_time_monitoring: true,
            alert_threshold: AlertThreshold::default(),
        }
    }
}

/// GDPR compliance configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GdprConfig {
    /// GDPR compliance enabled
    pub enabled: bool,

    /// Data retention period in days
    pub data_retention_days: u32,

    /// Automatic data cleanup enabled
    pub auto_cleanup_enabled: bool,

    /// Cleanup interval in days
    pub cleanup_interval_days: u32,

    /// Consent management
    pub consent: ConsentConfig,

    /// Data subject rights
    pub subject_rights: SubjectRightsConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentConfig {
    /// Require explicit consent
    pub require_explicit_consent: bool,

    /// Consent storage duration in days
    pub consent_retention_days: u32,

    /// Allow consent withdrawal
    pub allow_withdrawal: bool,

    /// Granular consent options
    pub granular_consent: bool,
}

impl Default for ConsentConfig {
    fn default() -> Self {
        Self {
            require_explicit_consent: true,
            consent_retention_days: 365 * 10, // 10 years
            allow_withdrawal: true,
            granular_consent: true,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SubjectRightsConfig {
    /// Allow data export (GDPR Art. 20)
    pub allow_data_export: bool,

    /// Export format (JSON, CSV, PDF)
    pub export_formats: Vec<String>,

    /// Allow data deletion (GDPR Art. 17)
    pub allow_data_deletion: bool,

    /// Deletion grace period in days
    pub deletion_grace_period_days: u32,

    /// Allow data correction (GDPR Art. 16)
    pub allow_data_correction: bool,
}

impl Default for SubjectRightsConfig {
    fn default() -> Self {
        Self {
            allow_data_export: true,
            export_formats: vec![
                "JSON".to_string(),
                "CSV".to_string(),
                "PDF".to_string(),
            ],
            allow_data_deletion: true,
            deletion_grace_period_days: 30,
            allow_data_correction: true,
        }
    }
}

impl Default for GdprConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            data_retention_days: 365 * 7, // 7 years for financial data
            auto_cleanup_enabled: true,
            cleanup_interval_days: 30,
            consent: ConsentConfig::default(),
            subject_rights: SubjectRightsConfig::default(),
        }
    }
}

/// Financial security configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FinancialSecurityConfig {
    /// PSD2 compliance
    pub psd2: Psd2Config,

    /// Transaction limits
    pub transaction_limits: TransactionLimits,

    /// Anti-fraud measures
    pub anti_fraud: AntiFraudConfig,

    /// Dutch banking compliance
    pub dutch_banking: DutchBankingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Psd2Config {
    /// PSD2 compliance enabled
    pub enabled: bool,

    /// Strong Customer Authentication (SCA)
    pub sca_required: bool,

    /// Two-factor authentication methods
    pub two_factor_methods: Vec<String>,

    /// Transaction authentication threshold in EUR
    pub transaction_auth_threshold_eur: rust_decimal::Decimal,
}

impl Default for Psd2Config {
    fn default() -> Self {
        Self {
            enabled: true,
            sca_required: false, // Not required for local application
            two_factor_methods: vec![
                "totp".to_string(),
                "biometric".to_string(),
            ],
            transaction_auth_threshold_eur: rust_decimal::Decimal::new(30000, 2), // €300
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionLimits {
    /// Maximum daily transaction amount in EUR
    pub max_daily_eur: rust_decimal::Decimal,

    /// Maximum weekly transaction amount in EUR
    pub max_weekly_eur: rust_decimal::Decimal,

    /// Maximum monthly transaction amount in EUR
    pub max_monthly_eur: rust_decimal::Decimal,

    /// Maximum single transaction in EUR
    pub max_single_transaction_eur: rust_decimal::Decimal,

    /// Maximum transactions per day
    pub max_transactions_per_day: u32,
}

impl Default for TransactionLimits {
    fn default() -> Self {
        Self {
            max_daily_eur: rust_decimal::Decimal::new(100000, 2), // €1,000
            max_weekly_eur: rust_decimal::Decimal::new(500000, 2), // €5,000
            max_monthly_eur: rust_decimal::Decimal::new(2000000, 2), // €20,000
            max_single_transaction_eur: rust_decimal::Decimal::new(100000, 2), // €1,000
            max_transactions_per_day: 50,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AntiFraudConfig {
    /// Enable fraud detection
    pub enabled: bool,

    /// Machine learning fraud detection
    pub ml_detection_enabled: bool,

    /// Pattern recognition
    pub pattern_recognition: bool,

    /// Geographic verification (for future bank API integration)
    pub geographic_verification: bool,

    /// Device fingerprinting
    pub device_fingerprinting: bool,

    /// Suspicious activity auto-block
    pub auto_block_suspicious: bool,
}

impl Default for AntiFraudConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            ml_detection_enabled: false, // Requires ML model
            pattern_recognition: true,
            geographic_verification: false, // Not applicable for local app
            device_fingerprinting: true,
            auto_block_suspicious: false, // Alert only, don't block
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DutchBankingConfig {
    /// Dutch banking compliance enabled
    pub enabled: bool,

    /// Supported Dutch banks
    pub supported_banks: Vec<String>,

    /// IBAN validation
    pub iban_validation: bool,

    /// BIC validation
    pub bic_validation: bool,

    /// SEPA compliance
    pub sepa_compliance: bool,

    /// Dutch Financial Supervision Act (Wft) compliance
    pub wft_compliance: bool,
}

impl Default for DutchBankingConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            supported_banks: vec![
                "Rabobank".to_string(),
                "ING".to_string(),
                "ABN AMRO".to_string(),
                "ASN Bank".to_string(),
                "RegioBank".to_string(),
                "Triodos Bank".to_string(),
                "Van Lanschot".to_string(),
            ],
            iban_validation: true,
            bic_validation: true,
            sepa_compliance: true,
            wft_compliance: true,
        }
    }
}

impl Default for FinancialSecurityConfig {
    fn default() -> Self {
        Self {
            psd2: Psd2Config::default(),
            transaction_limits: TransactionLimits::default(),
            anti_fraud: AntiFraudConfig::default(),
            dutch_banking: DutchBankingConfig::default(),
        }
    }
}

impl Default for SecurityConfig {
    fn default() -> Self {
        Self {
            encryption: EncryptionConfig::default(),
            database: DatabaseSecurityConfig::default(),
            api: ApiSecurityConfig {
                claude: ClaudeApiSecurity::default(),
                rate_limiting: RateLimitConfig::default(),
                request_validation: RequestValidationConfig::default(),
                cors: CorsConfig::default(),
            },
            audit: AuditConfig::default(),
            gdpr: GdprConfig::default(),
            financial: FinancialSecurityConfig::default(),
        }
    }
}

/// Load security configuration from environment and config files
pub fn load_security_config() -> Result<SecurityConfig> {
    let mut config = SecurityConfig::default();

    // Override with environment variables
    if let Ok(monthly_limit) = std::env::var("CLAUDE_MONTHLY_BUDGET_EUR") {
        config.api.claude.monthly_cost_limit_eur = monthly_limit.parse()?;
    }

    if let Ok(encryption_key) = std::env::var("DATABASE_ENCRYPTION_KEY") {
        // Validate encryption key length
        if encryption_key.len() != 32 {
            return Err(anyhow::anyhow!(
                "DATABASE_ENCRYPTION_KEY must be exactly 32 characters"
            ));
        }
    }

    // Load from config file if it exists
    if let Ok(config_content) = std::fs::read_to_string("config/security.json") {
        let file_config: SecurityConfig = serde_json::from_str(&config_content)?;
        // Merge with default config
        config = merge_configs(config, file_config);
    }

    Ok(config)
}

/// Merge configuration with file overrides
fn merge_configs(default: SecurityConfig, override_config: SecurityConfig) -> SecurityConfig {
    // Simple merge - in production, use proper deep merge
    SecurityConfig {
        encryption: override_config.encryption,
        database: override_config.database,
        api: override_config.api,
        audit: override_config.audit,
        gdpr: override_config.gdpr,
        financial: override_config.financial,
    }
}

/// Validate security configuration
pub fn validate_security_config(config: &SecurityConfig) -> Result<()> {
    // Validate encryption settings
    if config.encryption.key_derivations_iterations < 10_000 {
        return Err(anyhow::anyhow!(
            "Key derivation iterations must be at least 10,000"
        ));
    }

    // Validate financial limits
    if config.financial.transaction_limits.max_single_transaction_eur
        > config.financial.transaction_limits.max_daily_eur {
        return Err(anyhow::anyhow!(
            "Single transaction limit cannot exceed daily limit"
        ));
    }

    // Validate GDPR settings
    if config.gdpr.data_retention_days < 365 {
        return Err(anyhow::anyhow!(
            "Financial data retention must be at least 1 year for compliance"
        ));
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = SecurityConfig::default();
        assert!(config.encryption.algorithm == "AES-256-GCM");
        assert!(config.encryption.key_derivations_iterations >= 10_000);
        assert!(config.gdpr.enabled);
        assert!(config.financial.dutch_banking.enabled);
    }

    #[test]
    fn test_config_validation() {
        let mut config = SecurityConfig::default();
        assert!(validate_security_config(&config).is_ok());

        // Test invalid key iterations
        config.encryption.key_derivations_iterations = 1000;
        assert!(validate_security_config(&config).is_err());
    }

    #[test]
    fn test_transaction_limits() {
        let limits = TransactionLimits::default();
        assert!(limits.max_single_transaction_eur <= limits.max_daily_eur);
        assert!(limits.max_daily_eur <= limits.max_weekly_eur);
        assert!(limits.max_weekly_eur <= limits.max_monthly_eur);
    }
}