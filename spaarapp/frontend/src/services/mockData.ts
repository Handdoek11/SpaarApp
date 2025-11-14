import {
  Transaction,
  Category,
  Budget,
  Settings,
  FinancialInsight,
  DashboardStats,
  SpendingAnalysis
} from '../types'

// Mock Dutch Categories
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Boodschappen',
    description: 'Dagelijkse boodschappen en supermarkt',
    color: '#4CAF50',
    icon: '🛒',
    is_system: true,
    budget_percentage: 25,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-2',
    name: 'Huur',
    description: 'Woonkosten en huur',
    color: '#2196F3',
    icon: '🏠',
    is_system: true,
    budget_percentage: 30,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-3',
    name: 'Utilities',
    description: 'Gas, water, licht en internet',
    color: '#FF9800',
    icon: '💡',
    is_system: true,
    budget_percentage: 10,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-4',
    name: 'Vervoer',
    description: 'OV, benzine en onderhoud',
    color: '#9C27B0',
    icon: '🚗',
    is_system: true,
    budget_percentage: 8,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-5',
    name: 'Entertainment',
    description: 'Uit eten, films en hobbies',
    color: '#E91E63',
    icon: '🎮',
    is_system: true,
    budget_percentage: 7,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-6',
    name: 'Gezondheid',
    description: 'Arts, medicijnen en sport',
    color: '#00BCD4',
    icon: '🏥',
    is_system: true,
    budget_percentage: 5,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-7',
    name: 'Salaris',
    description: 'Maandelijks salaris',
    color: '#4CAF50',
    icon: '💰',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-8',
    name: 'Overige',
    description: 'Overige uitgaven',
    color: '#607D8B',
    icon: '📝',
    is_system: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
]

// Mock Dutch Transactions
export const mockTransactions: Transaction[] = [
  // Recent transactions
  {
    id: 'txn-1',
    description: 'Albert Heijn',
    amount: -87.45,
    date: '2024-01-15',
    category_id: 'cat-1',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 2341.55,
    notes: 'Wekelijkse boodschappen',
    tags: ['boodschappen', 'wekelijks'],
    is_recurring: true,
    recurring_frequency: 'weekly',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'txn-2',
    description: 'Salaris Januari',
    amount: 2850.00,
    date: '2024-01-01',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'credit',
    balance_after: 4529.00,
    notes: 'Maandsalaris 2024',
    tags: ['salaris', 'maandelijks'],
    is_recurring: true,
    recurring_frequency: 'monthly',
    created_at: '2024-01-01T09:00:00Z',
    updated_at: '2024-01-01T09:00:00Z'
  },
  {
    id: 'txn-3',
    description: 'Huur Appartement',
    amount: -950.00,
    date: '2024-01-01',
    category_id: 'cat-2',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 3579.00,
    notes: 'Maandelijkse huur',
    tags: ['huur', 'vast'],
    is_recurring: true,
    recurring_frequency: 'monthly',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z'
  },
  {
    id: 'txn-4',
    description: 'NS Vervoer',
    amount: -125.50,
    date: '2024-01-10',
    category_id: 'cat-4',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 3704.50,
    notes: 'Maandabonnement NS',
    tags: ['vervoer', 'abonnement'],
    is_recurring: true,
    recurring_frequency: 'monthly',
    created_at: '2024-01-10T14:22:00Z',
    updated_at: '2024-01-10T14:22:00Z'
  },
  {
    id: 'txn-5',
    description: 'Essent',
    amount: -145.80,
    date: '2024-01-05',
    category_id: 'cat-3',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 4383.20,
    notes: 'Energie en gas',
    tags: ['utilities', 'vast'],
    is_recurring: true,
    recurring_frequency: 'monthly',
    created_at: '2024-01-05T11:45:00Z',
    updated_at: '2024-01-05T11:45:00Z'
  },
  {
    id: 'txn-6',
    description: 'Pathé Bioscoop',
    amount: -28.00,
    date: '2024-01-13',
    category_id: 'cat-5',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 2429.00,
    notes: 'Film met vrienden',
    tags: ['entertainment', 'uitje'],
    is_recurring: false,
    created_at: '2024-01-13T20:15:00Z',
    updated_at: '2024-01-13T20:15:00Z'
  },
  {
    id: 'txn-7',
    description: 'Jumbo',
    amount: -45.30,
    date: '2024-01-12',
    category_id: 'cat-1',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 2457.00,
    notes: 'Extra boodschappen',
    tags: ['boodschappen'],
    is_recurring: false,
    created_at: '2024-01-12T18:30:00Z',
    updated_at: '2024-01-12T18:30:00Z'
  },
  {
    id: 'txn-8',
    description: 'Shell Tankstation',
    amount: -65.20,
    date: '2024-01-11',
    category_id: 'cat-4',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 2522.20,
    notes: 'Volgetankt',
    tags: ['benzine', 'vervoer'],
    is_recurring: false,
    created_at: '2024-01-11T07:45:00Z',
    updated_at: '2024-01-11T07:45:00Z'
  },
  {
    id: 'txn-9',
    description: 'Kruidvat',
    amount: -23.95,
    date: '2024-01-14',
    category_id: 'cat-8',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 2405.05,
    notes: 'Persoonlijke verzorging',
    tags: ['persoonlijk'],
    is_recurring: false,
    created_at: '2024-01-14T16:20:00Z',
    updated_at: '2024-01-14T16:20:00Z'
  },
  {
    id: 'txn-10',
    description: 'KPN',
    amount: -45.00,
    date: '2024-01-08',
    category_id: 'cat-3',
    account_number: 'NL91ABNA0417164300',
    account_holder: 'J. Jansen',
    transaction_type: 'debit',
    balance_after: 4529.00,
    notes: 'Internet en mobiel',
    tags: ['internet', 'telefoon'],
    is_recurring: true,
    recurring_frequency: 'monthly',
    created_at: '2024-01-08T09:30:00Z',
    updated_at: '2024-01-08T09:30:00Z'
  }
]

// Mock Budgets
export const mockBudgets: Budget[] = [
  {
    id: 'bud-1',
    name: 'Maandelijkse Boodschappen',
    category_id: 'cat-1',
    amount: 600.00,
    period: 'monthly',
    spent: 325.15,
    remaining: 274.85,
    is_active: true,
    notification_threshold: 0.8,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T10:30:00Z'
  },
  {
    id: 'bud-2',
    name: 'Vervoer Budget',
    category_id: 'cat-4',
    amount: 200.00,
    period: 'monthly',
    spent: 190.70,
    remaining: 9.30,
    is_active: true,
    notification_threshold: 0.9,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-11T07:45:00Z'
  },
  {
    id: 'bud-3',
    name: 'Entertainment',
    category_id: 'cat-5',
    amount: 150.00,
    period: 'monthly',
    spent: 78.50,
    remaining: 71.50,
    is_active: true,
    notification_threshold: 0.85,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-13T20:15:00Z'
  },
  {
    id: 'bud-4',
    name: 'Utilities',
    category_id: 'cat-3',
    amount: 300.00,
    period: 'monthly',
    spent: 190.80,
    remaining: 109.20,
    is_active: true,
    notification_threshold: 0.95,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-05T11:45:00Z'
  }
]

// Mock Settings
export const mockSettings: Settings = {
  id: 'settings-1',
  currency: 'EUR',
  date_format: 'DD-MM-YYYY',
  theme: 'light',
  language: 'nl',
  notifications_enabled: true,
  auto_categorization_enabled: true,
  ai_insights_enabled: true,
  budget_alerts_enabled: true,
  data_retention_days: 365,
  export_format: 'csv',
  encryption_enabled: true,
  last_backup: '2024-01-14T23:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-14T23:00:00Z'
}

// Mock Financial Insights
export const mockInsights: FinancialInsight[] = [
  {
    id: 'insight-1',
    insight_type: 'budget_optimization',
    title: 'Vervoer budget bijna bereikt',
    description: 'Je hebt dit maand al 95% van je vervoer budget gebruikt. Overweeg om meer met de fiets te reizen of carpoolen.',
    impact: 'medium',
    actionable: true,
    action_suggestions: [
      'Gebruik de fiets voor korte afstanden',
      'Plan samen ritten met collega\'s',
      'Check voor goedkopere tankstations'
    ],
    confidence_score: 0.85,
    created_at: '2024-01-15T08:00:00Z'
  },
  {
    id: 'insight-2',
    insight_type: 'savings_opportunity',
    title: 'Potentiële besparing: €50 per maand',
    description: 'Door je boodschappen te plannen en aanbiedingen in de gaten te houden, kun je circa €50 per maand besparen.',
    impact: 'low',
    actionable: true,
    action_suggestions: [
      'Maak weekmenu\'s en boodschappenlijsten',
      'Vergelijk prijzen tussen supermarkten',
      'Koop huismerk producten waar mogelijk'
    ],
    confidence_score: 0.72,
    created_at: '2024-01-14T10:30:00Z'
  },
  {
    id: 'insight-3',
    insight_type: 'spending_pattern',
    title: 'Bestedingspatroon analyses',
    description: 'Je uitgaven zijn dit maand 12% lager dan vorige maand. Goed bezig met de besparingen!',
    impact: 'high',
    actionable: false,
    action_suggestions: [],
    confidence_score: 0.91,
    created_at: '2024-01-13T14:20:00Z'
  }
]

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  total_balance: 2405.05,
  monthly_income: 2850.00,
  monthly_expenses: 1650.25,
  monthly_savings: 1199.75,
  budget_usage_percentage: 68.5,
  largest_expense_category: {
    category_id: 'cat-2',
    category_name: 'Huur',
    amount: 950.00
  },
  top_spending_category: {
    category_id: 'cat-1',
    category_name: 'Boodschappen',
    amount: 325.15
  },
  monthly_transactions_count: 24,
  recurring_transactions_count: 6
}

// Mock Spending Analysis
export const mockSpendingAnalysis: SpendingAnalysis = {
  current_month_spending: 1650.25,
  previous_month_spending: 1875.80,
  spending_change_percentage: -12.0,
  category_breakdown: [
    { category_id: 'cat-1', category_name: 'Boodschappen', amount: 325.15, percentage: 19.7 },
    { category_id: 'cat-2', category_name: 'Huur', amount: 950.00, percentage: 57.5 },
    { category_id: 'cat-3', category_name: 'Utilities', amount: 190.80, percentage: 11.6 },
    { category_id: 'cat-4', category_name: 'Vervoer', amount: 190.70, percentage: 11.6 },
    { category_id: 'cat-5', category_name: 'Entertainment', amount: 78.50, percentage: 4.8 },
    { category_id: 'cat-8', category_name: 'Overige', amount: 23.95, percentage: 1.4 }
  ],
  trend: 'decreasing',
  projected_monthly_spending: 1950.00
}

// Helper function to determine if we should use mock data
export const shouldUseMockData = (): boolean => {
  // Check if we're running in a browser environment (not Tauri)
  if (typeof window !== 'undefined' && !window.__TAURI__) {
    return true
  }

  // Check if Tauri APIs are available
  try {
    // This will fail if we're not in a Tauri environment or if the backend isn't running
    require('@tauri-apps/api/core')
    return false
  } catch {
    return true
  }
}

export default {
  mockCategories,
  mockTransactions,
  mockBudgets,
  mockSettings,
  mockInsights,
  mockDashboardStats,
  mockSpendingAnalysis,
  shouldUseMockData
}