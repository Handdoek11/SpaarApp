// Export all TypeScript types for the frontend

// Database models matching the backend
export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category_id?: string
  account_number?: string
  account_holder?: string
  transaction_type: 'credit' | 'debit'
  balance_after?: number
  notes?: string
  tags: string[]
  is_recurring: boolean
  recurring_frequency?: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description?: string
  color: string
  icon: string
  parent_id?: string
  is_system: boolean
  budget_percentage?: number
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  name: string
  category_id?: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  spent: number
  remaining: number
  is_active: boolean
  notification_threshold?: number
  start_date: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Settings {
  id: string
  currency: string
  date_format: string
  theme: 'light' | 'dark' | 'auto'
  language: string
  notifications_enabled: boolean
  auto_categorization_enabled: boolean
  ai_insights_enabled: boolean
  budget_alerts_enabled: boolean
  data_retention_days: number
  export_format: string
  encryption_enabled: boolean
  last_backup?: string
  created_at: string
  updated_at: string
}

export interface FinancialInsight {
  id: string
  insight_type: 'spending_pattern' | 'budget_optimization' | 'savings_opportunity' | 'unusual_activity'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
  action_suggestions: string[]
  confidence_score: number
  created_at: string
}

export interface SpendingAnalysis {
  total_spending: number
  total_income: number
  net_savings: number
  top_categories: CategorySpending[]
  average_daily_spending: number
  spending_trend: 'increasing' | 'decreasing' | 'stable'
  period_start: string
  period_end: string
  current_month_spending: number
}

export interface CategorySpending {
  category_id: string
  category_name: string
  amount: number
  transaction_count: number
  percentage: number
}

// UI State types
export interface AppState {
  isLoading: boolean
  error: string | null
  settings: Settings | null
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
}

export interface DashboardStats {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  budgetUtilization: number
  total_balance: number
  recentTransactions: Transaction[]
  insights: FinancialInsight[]
}

// Form types
export interface TransactionForm {
  description: string
  amount: string
  date: string
  category_id?: string
  notes?: string
  tags: string[]
}

export interface BudgetForm {
  name: string
  category_id?: string
  amount: string
  period: Budget['period']
  notification_threshold?: string
}

export interface CategoryForm {
  name: string
  description?: string
  color: string
  icon: string
  parent_id?: string
  budget_percentage?: string
}

export interface CategoryFormData {
  name: string
  description?: string
  color: string
  icon: string
  parent_id?: string
  budget_percentage?: number
  is_system?: boolean
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  path: string
  icon: string
  badge?: number
  disabled?: boolean
}

// Import/Export types
export interface CsvImportConfig {
  bank: string
  date_format: string
  delimiter: string
  encoding: string
  has_header_row: boolean
  column_mapping: {
    date?: number
    description?: number
    amount?: number
    account_number?: number
    account_holder?: number
    transaction_type?: number
    balance_after?: number
  }
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  transactions: Transaction[]
}

export interface CsvImportResult {
  success: boolean
  transactions: Transaction[]
  errors: string[]
  warnings: string[]
  total_rows: number
  imported_rows: number
}

// Filter and search types
export interface TransactionFilters {
  category_id?: string
  date_range?: {
    start: string
    end: string
  }
  amount_range?: {
    min: number
    max: number
  }
  search?: string
  tags?: string[]
  transaction_type?: 'credit' | 'debit'
}

export interface SortConfig {
  field: keyof Transaction
  direction: 'asc' | 'desc'
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

// Chart data types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

export interface BudgetChartData {
  category: string
  budgeted: number
  spent: number
  remaining: number
  percentage: number
}

// Utility types
export type SortField = 'date' | 'amount' | 'description' | 'category'
export type FilterOperator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
  timestamp: string
}