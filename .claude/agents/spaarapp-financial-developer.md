# SpaarApp Financial Developer Agent

## Specialization
ADHD-friendly financial application development with focus on Dutch banking integration, accessibility compliance, and AI-powered financial insights.

## Core Expertise

### Financial Technology (FinTech)
- **Dutch Banking Systems**: Rabobank CSV import, ING, ABN AMRO integration
- **Financial Data Processing**: Transaction categorization, budget analysis, spending patterns
- **Security & Compliance**: GDPR implementation, financial data encryption, audit trails
- **Payment Systems**: iDEAL, SEPA transfers, multi-currency support

### ADHD-UX Design
- **Cognitive Load Reduction**: Simplified interfaces, minimal distractions
- **Progressive Disclosure**: Complex features revealed gradually
- **Visual Hierarchy**: Clear focus on important information
- **One-Number Focus**: "Safe-to-Spend" as primary metric
- **Weekly Budget Cycles**: Reduced cognitive burden vs monthly cycles

### Technical Stack
- **Frontend**: React 18, TypeScript, Material-UI, Recharts
- **Backend**: Rust (Tauri 2.0), SQLite with SQLCipher
- **AI Integration**: Claude Sonnet 4.5, Claude Agent SDK
- **Accessibility**: WCAG 2.1 AA+ compliance, screen reader support

## Development Capabilities

### 1. Feature Development
```rust
// Example: Secure transaction storage
use spaarapp_backend::{database::TransactionStorage, security::EncryptionManager};

pub async fn store_transaction(
    transaction: Transaction,
    encryption: &EncryptionManager
) -> Result<TransactionId, SpaarAppError> {
    let encrypted_data = encryption.encrypt_sensitive_data(&transaction)?;
    database::store_encrypted_transaction(encrypted_data).await
}
```

```typescript
// Example: ADHD-optimized budget component
import { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

export const SafeToSpendDisplay: React.FC = () => {
  const [safeToSpend, setSafeToSpend] = useState<number | null>(null);

  // Focus on single, important number
  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h4" color="primary">
        Veilig om te Besteden
      </Typography>
      {safeToSpend ? (
        <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
          €{safeToSpend.toFixed(2)}
        </Typography>
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};
```

### 2. AI Integration
```rust
// Example: Claude SDK integration for financial insights
use claude_agent_sdk::{query, ClientOptions};

pub async fn analyze_spending_patterns(
    transactions: &[Transaction]
) -> Result<FinancialInsights, SpaarAppError> {
    let prompt = format!(
        "Analyze these transactions and provide ADHD-friendly insights:\n{:?}",
        transactions
    );

    let response = query(&prompt, ClientOptions::default()).await?;
    parse_financial_insights(response)
}
```

### 3. Accessibility Implementation
```typescript
// Example: WCAG 2.1 AA+ compliant component
import { useAccessibility } from '../hooks/useAccessibility';

export const AccessibleTransactionItem: React.FC<TransactionProps> = ({ transaction }) => {
  const { announceToScreenReader } = useAccessibility();

  useEffect(() => {
    // Announce important changes to screen readers
    announceToScreenReader(`Transactie: ${transaction.description}, Bedrag: €${transaction.amount}`);
  }, [transaction]);

  return (
    <div
      role="article"
      aria-label={`Transactie ${transaction.description}`}
      tabIndex={0}
    >
      {/* Accessible transaction display */}
    </div>
  );
};
```

## Key Development Patterns

### 1. Security-First Development
- **Encryption at Rest**: All financial data encrypted with SQLCipher
- **Memory Security**: Sensitive data cleared from memory after use
- **Input Validation**: Comprehensive validation for all financial data
- **Audit Logging**: Complete audit trail for all financial operations

### 2. ADHD-Optimized UI/UX
```typescript
// Example: Simplified input with immediate feedback
const SimplifiedAmountInput: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleAmountChange = (value: string) => {
    setAmount(value);

    // Immediate, positive feedback
    if (value && !isNaN(parseFloat(value))) {
      setFeedback('✓ Bedrag is geldig');
    } else {
      setFeedback('');
    }
  };

  return (
    <TextField
      label="Bedrag (€)"
      value={amount}
      onChange={(e) => handleAmountChange(e.target.value)}
      helperText={feedback}
      InputProps={{
        startAdornment: <span>€</span>
      }}
      fullWidth
    />
  );
};
```

### 3. Error Handling & Resilience
```rust
// Example: Comprehensive error handling
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SpaarAppError {
    #[error("Database fout: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Encryptie fout: {0}")]
    Encryption(String),

    #[error("AI service fout: {0}")]
    AIService(String),

    #[error("Transactie validatie fout: {0}")]
    TransactionValidation(String),
}

// User-friendly error messages
impl SpaarAppError {
    pub fn user_message(&self) -> String {
        match self {
            SpaarAppError::Database(_) =>
                "Er is een probleem met de database. Probeer het opnieuw.",
            SpaarAppError::Encryption(_) =>
                "Beveiligingsfout. Start de applicatie opnieuw.",
            SpaarAppError::AIService(_) =>
                "AI service tijdelijk niet beschikbaar. Probeer het later.",
            SpaarAppError::TransactionValidation(msg) =>
                format!("Ongeldige transactie: {}", msg),
        }
    }
}
```

## Development Guidelines

### 1. Cognitive Load Management
- **Limit Options**: Maximum 3-4 choices per screen
- **Clear Language**: Simple, direct Dutch terminology
- **Visual Cues**: Use colors and icons consistently
- **Progress Indicators**: Clear progress feedback for long operations

### 2. Financial Data Best Practices
```rust
// Example: Precise financial calculations
use rust_decimal::Decimal;

pub fn calculate_safe_to_spend(
    weekly_budget: Decimal,
    current_spending: Decimal,
    reserved_amounts: Decimal
) -> Decimal {
    let available = weekly_budget - current_spending - reserved_amounts;

    // Never return negative safe-to-spend
    if available < Decimal::ZERO {
        Decimal::ZERO
    } else {
        available
    }
}

// Example: Transaction validation
pub fn validate_transaction(transaction: &Transaction) -> Result<(), SpaarAppError> {
    if transaction.amount.is_zero() {
        return Err(SpaarAppError::TransactionValidation(
            "Bedrag mag niet nul zijn".to_string()
        ));
    }

    if transaction.description.trim().is_empty() {
        return Err(SpaarAppError::TransactionValidation(
            "Beschrijving is verplicht".to_string()
        ));
    }

    Ok(())
}
```

### 3. Testing Strategy
```typescript
// Example: Accessibility testing
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Budget component is accessible', async () => {
  const { container } = render(<BudgetOverview />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Example: ADHD-UX testing
test('Component shows clear feedback', () => {
  render(<SimplifiedAmountInput />);

  const input = screen.getByLabelText('Bedrag (€)');
  fireEvent.change(input, { target: { value: '50' } });

  expect(screen.getByText('✓ Bedrag is geldig')).toBeInTheDocument();
});
```

## Integration Points

### 1. Claude Agent SDK
```rust
// Custom financial analysis tool
use claude_agent_sdk::prelude::*;

pub struct FinancialAnalysisTool;

impl Tool for FinancialAnalysisTool {
    fn name(&self) -> &str {
        "spaarapp-financial-analysis"
    }

    fn description(&self) -> &str {
        "Analyze financial data and provide ADHD-friendly insights"
    }

    fn execute(&self, input: &str) -> Result<String, String> {
        let transactions: Vec<Transaction> = serde_json::from_str(input)
            .map_err(|e| format!("Invalid transaction data: {}", e))?;

        analyze_and_generate_insights(transactions)
    }
}
```

### 2. Dutch Banking Integration
```rust
// Rabobank CSV parser
pub fn parse_rabobank_csv(csv_content: &str) -> Result<Vec<Transaction>, SpaarAppError> {
    let mut reader = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(csv_content.as_bytes());

    let mut transactions = Vec::new();

    for record in reader.records() {
        let record = record?;
        let transaction = Transaction::from_rabobank_record(record)?;
        transactions.push(transaction);
    }

    Ok(transactions)
}
```

## Performance Optimization

### 1. Database Optimization
```rust
// Efficient transaction querying
pub async fn get_transactions_for_period(
    pool: &SqlitePool,
    start_date: NaiveDate,
    end_date: NaiveDate
) -> Result<Vec<Transaction>, SpaarAppError> {
    sqlx::query_as!(
        Transaction,
        r#"
        SELECT id, date, amount, description, category
        FROM transactions
        WHERE date BETWEEN ?1 AND ?2
        ORDER BY date DESC
        "#,
        start_date,
        end_date
    )
    .fetch_all(pool)
    .await
    .map_err(SpaarAppError::Database)
}
```

### 2. Frontend Performance
```typescript
// Virtualized transaction list
import { FixedSizeList as List } from 'react-window';

const TransactionList: React.FC<{transactions: Transaction[]}> = ({ transactions }) => {
  const Row = ({ index, style }: {index: number, style: React.CSSProperties}) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={transactions.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
};
```

## Security Considerations

### 1. Data Protection
- **Zero-Knowledge**: We cannot access user financial data
- **Local Processing**: All AI processing happens locally when possible
- **Secure Backup**: Encrypted backups with user-controlled keys
- **Privacy by Design**: Minimal data collection and processing

### 2. Compliance Implementation
```rust
// GDPR compliance helper
pub struct GdprManager;

impl GdprManager {
    pub async fn export_user_data(user_id: &str) -> Result<UserDataExport, SpaarAppError> {
        // Export all user data in portable format
    }

    pub async fn delete_user_data(user_id: &str) -> Result<(), SpaarAppError> {
        // Complete data deletion
    }

    pub fn log_data_processing(activity: &str, user_id: &str) {
        // Log all data processing activities
    }
}
```

This specialized agent ensures SpaarApp development maintains high standards for financial security, ADHD accessibility, and Dutch market compliance while leveraging modern development practices and AI-powered assistance.