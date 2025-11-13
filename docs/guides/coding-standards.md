# SpaarApp Coding Standards

## Overview

These coding standards ensure consistency, security, accessibility, and maintainability across the SpaarApp codebase. They are specifically designed for financial applications with ADHD users in mind.

## General Principles

### 1. Accessibility First
- **WCAG 2.1 AA+ compliance** for all UI components
- **Screen reader compatibility** with proper ARIA labels
- **Keyboard navigation** support for all functionality
- **High contrast mode** support
- **Reduced motion options** for users with vestibular disorders

### 2. ADHD-UX Design
- **Minimal cognitive load** - limit choices to 3-4 options maximum
- **Clear visual hierarchy** with single primary focus
- **Immediate feedback** for all user actions
- **Progressive disclosure** for complex features
- **Consistent patterns** across the application

### 3. Security First
- **Financial data encryption** at rest and in transit
- **Input validation** for all user inputs
- **Audit logging** for all financial operations
- **GDPR compliance** by design
- **Zero-knowledge architecture** where possible

### 4. Performance
- **Local-first approach** for data processing
- **Lazy loading** for non-critical features
- **Efficient algorithms** for financial calculations
- **Memory management** for sensitive data
- **Background processing** for AI operations

## TypeScript/React Standards

### Code Style
```typescript
// Use explicit interfaces for props
interface BudgetComponentProps {
  title: string;
  amount: number;
  onAmountChange: (amount: number) => void;
  disabled?: boolean;
  'data-testid'?: string;
}

// Use functional components with hooks
export const BudgetComponent: React.FC<BudgetComponentProps> = ({
  title,
  amount,
  onAmountChange,
  disabled = false,
  'data-testid': testId,
}) => {
  // Hooks at the top level
  const [localAmount, setLocalAmount] = useState<number>(amount);
  const { announceToScreenReader } = useAccessibility();
  const { handleError } = useErrorHandler();

  // Event handlers with proper error handling
  const handleAmountChange = (newAmount: number): void => {
    try {
      // Validate input
      if (newAmount < 0) {
        throw new Error('Bedrag mag niet negatief zijn');
      }

      setLocalAmount(newAmount);
      onAmountChange(newAmount);

      // Accessibility announcement
      announceToScreenReader(`Nieuw bedrag ingesteld: €${newAmount.toFixed(2)}`);
    } catch (error) {
      handleError(error);
    }
  };

  // JSX with proper accessibility attributes
  return (
    <div role="region" aria-labelledby={`${title.toLowerCase()}-title`}>
      <h2 id={`${title.toLowerCase()}-title`}>{title}</h2>
      <input
        type="number"
        value={localAmount}
        onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
        disabled={disabled}
        aria-describedby={`${title.toLowerCase()}-description`}
        data-testid={testId}
      />
      <div id={`${title.toLowerCase()}-description`} className="sr-only">
        Voer het bedrag in euro's in
      </div>
    </div>
  );
};
```

### Component Guidelines
```typescript
// 1. Always include accessibility testing
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Budget component is accessible', async () => {
  const { container } = render(<BudgetComponent title="Test" amount={100} onAmountChange={jest.fn()} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// 2. Include ADHD-UX testing
test('Component has clear focus indicators', () => {
  render(<BudgetComponent title="Test" amount={100} onAmountChange={jest.fn()} />);

  const input = screen.getByRole('spinbutton');
  input.focus();

  // Check for visible focus indicator
  expect(input).toHaveStyle({ outline: expect.any(String) });
});

// 3. Test error states
test('Component handles invalid input gracefully', () => {
  const onAmountChange = jest.fn();
  render(<BudgetComponent title="Test" amount={100} onAmountChange={onAmountChange} />);

  const input = screen.getByRole('spinbutton');
  fireEvent.change(input, { target: { value: '-50' } });

  expect(screen.getByText(/mag niet negatief zijn/i)).toBeInTheDocument();
  expect(onAmountChange).not.toHaveBeenCalled();
});
```

### File Organization
```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   │   ├── Button/
│   │   │   ├── index.tsx
│   │   │   ├── Button.styles.ts
│   │   │   ├── Button.test.tsx
│   │   │   └── Button.stories.tsx
│   ├── features/        # Feature-specific components
│   │   ├── budget/
│   │   │   ├── BudgetOverview/
│   │   │   ├── SafeToSpend/
│   │   │   └── BudgetForm/
├── hooks/               # Custom React hooks
├── services/            # API and business logic
├── utils/               # Utility functions
├── types/               # TypeScript type definitions
└── styles/              # Global styles and themes
```

## Rust/Tauri Standards

### Code Style
```rust
// Use Result<T, SpaarAppError> for error handling
use crate::{error::SpaarAppError, models::Transaction};

#[derive(Debug, Clone)]
pub struct TransactionService {
    db_pool: SqlitePool,
    encryption: EncryptionManager,
}

impl TransactionService {
    pub async fn add_transaction(&self, transaction: Transaction) -> Result<TransactionId, SpaarAppError> {
        // Input validation
        if transaction.amount.is_zero() {
            return Err(SpaarAppError::ValidationError(
                "Bedrag mag niet nul zijn".to_string()
            ));
        }

        // Encrypt sensitive data
        let encrypted_description = self.encryption
            .encrypt_sensitive_data(&transaction.description)?;

        // Database operation with transaction
        let tx_id = sqlx::transaction!(self.db_pool, |tx| {
            sqlx::query!(
                "INSERT INTO transactions (amount, description, encrypted_data) VALUES (?, ?, ?)",
                transaction.amount,
                transaction.description,
                encrypted_description
            )
            .execute(tx)
            .await
            .map(|result| TransactionId(result.last_insert_rowid()))
        }).await?;

        // Audit logging
        audit_log_transaction_operation(&transaction, "create").await?;

        Ok(tx_id)
    }
}
```

### Error Handling
```rust
// Use thiserror for custom error types
use thiserror::Error;

#[derive(Error, Debug)]
pub enum SpaarAppError {
    #[error("Validatiefout: {0}")]
    ValidationError(String),

    #[error("Database fout: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Encryptie fout: {0}")]
    Encryption(String),

    #[error("AI service fout: {0}")]
    AIService(String),

    #[error("Toegang geweigerd: {0}")]
    AccessDenied(String),
}

impl SpaarAppError {
    /// Convert error to user-friendly message
    pub fn user_message(&self) -> String {
        match self {
            SpaarAppError::ValidationError(msg) => format!("Invoerfout: {}", msg),
            SpaarAppError::Database(_) => "Er is een probleem met de database. Probeer het opnieuw.".to_string(),
            SpaarAppError::Encryption(_) => "Beveiligingsfout. Start de applicatie opnieuw.".to_string(),
            SpaarAppError::AIServiceService(_) => "AI service tijdelijk niet beschikbaar. Probeer het later.".to_string(),
            SpaarAppError::AccessDenied(_) => "U heeft geen toegang tot deze functie.".to_string(),
        }
    }

    /// Check if error is user-correctable
    pub fn is_user_correctable(&self) -> bool {
        matches!(self, SpaarAppError::ValidationError(_))
    }
}
```

### Security Patterns
```rust
// Secure memory handling for sensitive data
use zeroize::Zeroize;

#[derive(Debug)]
pub struct SecureString {
    data: Vec<u8>,
}

impl SecureString {
    pub fn new(data: String) -> Self {
        Self {
            data: data.into_bytes(),
        }
    }

    pub fn as_str(&self) -> Result<&str, SpaarAppError> {
        std::str::from_utf8(&self.data)
            .map_err(|_| SpaarAppError::Encryption("Invalid UTF-8".to_string()))
    }
}

impl Drop for SecureString {
    fn drop(&mut self) {
        // Clear sensitive data from memory
        self.data.zeroize();
    }
}

// Secure database operations
pub async fn execute_secure_query(
    pool: &SqlitePool,
    query: &str,
    params: &[&(dyn sqlx::Encode<sqlx::Sqlite> + sqlx::Type<sqlx::Sqlite> + Sync)]
) -> Result<sqlx::sqlite::SqliteQueryResult, SpaarAppError> {
    // Log query without parameters for security
    tracing::info!("Executing secure query: {}", query);

    // Execute with parameterized query to prevent SQL injection
    let mut query_builder = sqlx::query(query);

    for param in params {
        query_builder = query_builder.bind(param);
    }

    query_builder
        .execute(pool)
        .await
        .map_err(SpaarAppError::Database)
}
```

## Testing Standards

### Frontend Testing
```typescript
// Unit tests with accessibility and ADHD-UX focus
describe('BudgetOverview Component', () => {
  const mockBudget = {
    id: '1',
    name: 'Wekelijks Budget',
    amount: 500.00,
    spent: 234.50,
    safeToSpend: 265.50,
  };

  // Accessibility testing
  test('is accessible to screen readers', async () => {
    const { container } = render(<BudgetOverview budget={mockBudget} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // ADHD-UX testing
  test('displays safe-to-spend prominently', () => {
    render(<BudgetOverview budget={mockBudget} />);

    const safeToSpend = screen.getByRole('heading', { name: /veilig om te besteden/i });
    expect(safeToSpend).toBeInTheDocument();
    expect(safeToSpend).toHaveTextContent('€265,50');
  });

  // Cognitive load testing
  test('limits choices to maximum 4', () => {
    render(<BudgetOverview budget={mockBudget} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeLessThanOrEqual(4);
  });

  // Immediate feedback testing
  test('provides immediate visual feedback', async () => {
    const onAction = jest.fn();
    render(<BudgetOverview budget={mockBudget} onAction={onAction} />);

    const button = screen.getByRole('button', { name: /bewerk/i });
    fireEvent.click(button);

    // Should show loading state immediately
    expect(screen.getByText('bezig met laden...')).toBeInTheDocument();
  });
});
```

### Backend Testing
```rust
// Comprehensive Rust testing
#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_utils::{setup_test_db, create_test_transaction};

    #[tokio::test]
    async fn test_transaction_validation() {
        let service = TransactionService::new(setup_test_db().await);

        // Test valid transaction
        let valid_transaction = create_test_transaction("Test", 100.00);
        assert!(service.validate_transaction(&valid_transaction).is_ok());

        // Test invalid amount
        let invalid_transaction = create_test_transaction("Test", -50.00);
        assert!(service.validate_transaction(&invalid_transaction).is_err());

        // Test empty description
        let mut invalid_transaction = create_test_transaction("", 100.00);
        assert!(service.validate_transaction(&invalid_transaction).is_err());
    }

    #[tokio::test]
    async fn test_transaction_encryption() {
        let encryption = EncryptionManager::new("test_key_32_characters_long!".as_bytes()).unwrap();
        let service = TransactionService::new(setup_test_db().await, encryption);

        let transaction = create_test_transaction("Bank transfer", 250.00);
        let result = service.add_transaction(transaction).await;

        assert!(result.is_ok());

        // Verify sensitive data is encrypted in database
        let stored = sqlx::query!(
            "SELECT encrypted_data FROM transactions WHERE id = ?",
            result.unwrap().0
        )
        .fetch_one(&service.db_pool)
        .await
        .unwrap();

        assert_ne!(stored.encrypted_data, "Bank transfer");
    }
}
```

## Security Standards

### Input Validation
```typescript
// Comprehensive input validation
import * as yup from 'yup';

export const transactionSchema = yup.object({
  amount: yup
    .number()
    .positive('Bedrag moet positief zijn')
    .max(10000, 'Bedrag mag niet hoger zijn dan €10.000')
    .required('Bedrag is verplicht'),
  description: yup
    .string()
    .trim()
    .min(1, 'Beschrijving is verplicht')
    .max(255, 'Beschrijving mag niet langer dan 255 karakters zijn')
    .matches(/^[a-zA-Z0-9\s.,-]+$/, 'Beschrijving bevat ongeldige karakters')
    .required(),
  category: yup
    .string()
    .oneOf(ALLOWED_CATEGORIES, 'Categorie is niet geldig')
    .required('Categorie is verplicht'),
});
```

### Data Sanitization
```rust
// Output encoding for XSS prevention
use html_escape;

pub fn sanitize_user_input(input: &str) -> String {
    input
        .trim()
        .chars()
        .filter(|c| c.is_alphanumeric() || c.is_whitespace() || ",.-".contains(*c))
        .collect()
}

pub fn encode_html_output(input: &str) -> String {
    html_escape::encode_text(input).to_string()
}
```

## Performance Standards

### React Performance
```typescript
// Use React.memo for expensive components
export const TransactionList = React.memo<TransactionListProps>(({ transactions, onSelect }) => {
  // Use useMemo for expensive calculations
  const sortedTransactions = useMemo(() => {
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions]);

  // Use virtualization for large lists
  return (
    <FixedSizeList
      height={400}
      itemCount={sortedTransactions.length}
      itemSize={60}
      itemData={sortedTransactions}
    >
      {TransactionRow}
    </FixedSizeList>
  );
});

// Lazy load components
const BudgetAnalytics = lazy(() => import('./BudgetAnalytics'));

// Use with Suspense for loading states
const App = () => (
  <Suspense fallback={<CircularProgress />}>
    <BudgetAnalytics />
  </Suspense>
);
```

### Rust Performance
```rust
// Efficient database queries
pub async fn get_transaction_summary(
    pool: &SqlitePool,
    user_id: &str,
    start_date: NaiveDate,
    end_date: NaiveDate,
) -> Result<TransactionSummary, SpaarAppError> {
    let summary = sqlx::query_as!(
        TransactionSummary,
        r#"
        SELECT
            COUNT(*) as transaction_count,
            COALESCE(SUM(amount), 0) as total_amount,
            COALESCE(AVG(amount), 0) as average_amount
        FROM transactions
        WHERE user_id = ?1 AND date BETWEEN ?2 AND ?3
        "#,
        user_id,
        start_date,
        end_date
    )
    .fetch_one(pool)
    .await?;

    Ok(summary)
}

// Use async streams for large datasets
pub async fn stream_transactions(
    pool: &SqlitePool,
    user_id: &str,
) -> impl Stream<Item = Result<Transaction, SpaarAppError>> {
    sqlx::query_as!(
        Transaction,
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC",
        user_id
    )
    .fetch(pool)
    .map(|result| result.map_err(SpaarAppError::Database))
}
```

## Documentation Standards

### Code Documentation
```rust
/// Adds a new transaction to the database with encryption and audit logging
///
/// # Arguments
/// * `transaction` - The transaction to add
///
/// # Returns
/// * `Ok(TransactionId)` - The ID of the created transaction
/// * `Err(SpaarAppError)` - Error if transaction creation fails
///
/// # Security Considerations
/// - Sensitive data is encrypted before storage
/// - All operations are logged for audit purposes
/// - Input validation prevents SQL injection
///
/// # Examples
/// ```
/// let transaction = Transaction::new(
///     "Grocery shopping",
///     Decimal::new(5000, 2), // €50.00
///     "groceries".to_string()
/// );
/// let result = service.add_transaction(transaction).await?;
/// ```
pub async fn add_transaction(&self, transaction: Transaction) -> Result<TransactionId, SpaarAppError> {
    // Implementation
}
```

### Component Documentation
```typescript
/**
 * BudgetOverview Component
 *
 * ADHD-friendly budget overview component that displays:
 * - Safe-to-spend amount (primary focus)
 * - Current spending progress
 * - Weekly budget status
 *
 * @accessibility
 * - WCAG 2.1 AA compliant
 * - Screen reader compatible
 * - Keyboard navigation supported
 * - High contrast mode supported
 *
 * @adhd-ux
 * - Single primary number (safe-to-spend)
 * - Maximum 4 interactive elements
 * - Immediate visual feedback
 * - Clear visual hierarchy
 *
 * @example
 * ```tsx
 * <BudgetOverview
 *   budget={weeklyBudget}
 *   onEdit={() => navigate('/budget/edit')}
 *   onRefresh={() => refetch()}
 * />
 * ```
 */
export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  budget,
  onEdit,
  onRefresh
}) => {
  // Implementation
};
```

## Git Standards

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]

Examples:
feat(frontend): add budget overview component with safe-to-spend focus
fix(backend): resolve transaction import validation error
docs(readme): update installation instructions for Windows
test(accessibility): add WCAG 2.1 AA compliance tests
security(audit): implement input sanitization for transaction forms
```

### Branch Naming
- `feature/budget-overview` - New features
- `fix/transaction-validation` - Bug fixes
- `security/input-sanitization` - Security fixes
- `refactor/database-optimization` - Refactoring
- `docs/api-documentation` - Documentation changes

These standards ensure SpaarApp maintains high quality, security, accessibility, and ADHD-friendliness throughout the development process.