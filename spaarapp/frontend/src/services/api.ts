import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'

// Check if Tauri APIs are available
const isTauriAvailable = typeof window !== 'undefined' && window.__TAURI__

// Safe invoke function that works in both web and Tauri modes
const safeInvoke = async <T>(command: string, args?: any): Promise<T> => {
  if (!isTauriAvailable) {
    // Return mock data when running in web mode
    return Promise.resolve(getMockData(command) as T)
  }

  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.warn(`Tauri invoke failed for ${command}, falling back to mock data:`, error)
    return Promise.resolve(getMockData(command) as T)
  }
}

// Mock data for web mode
const getMockData = (command: string) => {
  switch (command) {
    case 'get_transactions':
      return [
        {
          id: '1',
          description: 'Albert Heijn boodschappen',
          amount: -75.50,
          date: '2025-11-14',
          category_id: '1',
          account_number: 'NL123456789',
          account_holder: 'John Doe',
          transaction_type: 'debit',
          balance_after: 2500.00,
          notes: 'Wekelijkse boodschappen',
          tags: ['boodschappen', 'supermarkt'],
          is_recurring: true,
          recurring_frequency: 'weekly',
          created_at: '2025-11-14T10:00:00Z',
          updated_at: '2025-11-14T10:00:00Z'
        }
      ]
    case 'get_categories':
      return [
        {
          id: '1',
          name: 'Supermarkt',
          description: 'Winkels voor dagelijkse boodschappen',
          color: '#4CAF50',
          icon: '🛒',
          parent_id: null,
          is_system: false,
          budget_percentage: 15,
          created_at: '2025-11-14T10:00:00Z',
          updated_at: '2025-11-14T10:00:00Z'
        },
        {
          id: '2',
          name: 'Transport',
          description: 'Vervoerskosten',
          color: '#2196F3',
          icon: '🚗',
          parent_id: null,
          is_system: false,
          budget_percentage: 10,
          created_at: '2025-11-14T10:00:00Z',
          updated_at: '2025-11-14T10:00:00Z'
        }
      ]
    case 'get_budgets':
      return [
        {
          id: '1',
          name: 'Wekelijkse boodschappen',
          category_id: '1',
          amount: 100.00,
          period: 'weekly',
          spent: 75.50,
          remaining: 24.50,
          is_active: true,
          notification_threshold: 80,
          start_date: '2025-11-01',
          end_date: null,
          created_at: '2025-11-14T10:00:00Z',
          updated_at: '2025-11-14T10:00:00Z'
        }
      ]
    case 'get_settings':
      return {
        id: 'default',
        currency: 'EUR',
        date_format: 'DD-MM-YYYY',
        theme: 'light',
        language: 'nl',
        notifications_enabled: true,
        auto_categorization_enabled: true,
        ai_insights_enabled: true,
        budget_alerts_enabled: true,
        data_retention_days: 365,
        export_format: 'json',
        encryption_enabled: false,
        last_backup: null,
        created_at: '2025-11-14T10:00:00Z',
        updated_at: '2025-11-14T10:00:00Z'
      }
    case 'get_financial_insights':
      return [
        {
          id: '1',
          insight_type: 'spending_pattern',
          title: 'Uitgaven stijgen',
          description: 'Je uitgaven zijn de laatste maand met 15% gestegen',
          impact: 'medium',
          actionable: true,
          action_suggestions: ['Stel een budget in', 'Analyseer je grootste uitgaven'],
          confidence_score: 85,
          created_at: '2025-11-14T10:00:00Z'
        }
      ]
    case 'analyze_spending_patterns':
      return {
        total_spending: 1200.00,
        total_income: 3000.00,
        net_savings: 1800.00,
        top_categories: [
          {
            category_id: '1',
            category_name: 'Supermarkt',
            amount: 500.00,
            transaction_count: 12,
            percentage: 41.7
          },
          {
            category_id: '2',
            category_name: 'Transport',
            amount: 200.00,
            transaction_count: 8,
            percentage: 16.7
          }
        ],
        average_daily_spending: 40.00,
        spending_trend: 'increasing',
        period_start: '2025-10-14',
        period_end: '2025-11-14'
      }
    case 'get_budget_recommendations':
      return [
        'Stel een budget in voor restaurantbezoeken (gemiddeld €200/maand)',
        'Overweeg om meer te sparen door 10% van je inkomen apart te zetten',
        'Analyseer je uitgavenpatronen om besparingsmogelijkheden te vinden'
      ]
    default:
      return null
  }
}
import {
  Transaction,
  Category,
  Budget,
  Settings,
  FinancialInsight,
  SpendingAnalysis,
  DashboardStats,
  ApiResponse,
  CsvImportResult
} from '../types'

// Transaction API
export const transactionsApi = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    try {
      const result = await safeInvoke<Transaction[]>('get_transactions')
      return result
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      throw new Error(`Transacties ophalen mislukt: ${error}`)
    }
  },

  // Get single transaction by ID
  getById: async (id: string): Promise<Transaction | null> => {
    try {
      const result = await invoke<Transaction | null>('get_transaction_by_id', { id })
      return result
    } catch (error) {
      console.error(`Failed to fetch transaction ${id}:`, error)
      throw new Error(`Transactie ophalen mislukt: ${error}`)
    }
  },

  // Create new transaction
  create: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    try {
      const result = await invoke<Transaction>('add_transaction', { transaction })
      return result
    } catch (error) {
      console.error('Failed to create transaction:', error)
      throw new Error(`Transactie aanmaken mislukt: ${error}`)
    }
  },

  // Update existing transaction
  update: async (id: string, transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    try {
      const result = await invoke<Transaction>('update_transaction', { id, transaction })
      return result
    } catch (error) {
      console.error(`Failed to update transaction ${id}:`, error)
      throw new Error(`Transactie bijwerken mislukt: ${error}`)
    }
  },

  // Delete transaction
  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await invoke<boolean>('delete_transaction', { id })
      return result
    } catch (error) {
      console.error(`Failed to delete transaction ${id}:`, error)
      throw new Error(`Transactie verwijderen mislukt: ${error}`)
    }
  },
}

// Categories API
export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    try {
      const result = await invoke<Category[]>('get_categories')
      return result
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw new Error(`Categorieën ophalen mislukt: ${error}`)
    }
  },

  // Get single category by ID
  getById: async (id: string): Promise<Category | null> => {
    try {
      const result = await invoke<Category | null>('get_category_by_id', { id })
      return result
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error)
      throw new Error(`Categorie ophalen mislukt: ${error}`)
    }
  },

  // Create new category
  create: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    try {
      const result = await invoke<Category>('add_category', { category })
      return result
    } catch (error) {
      console.error('Failed to create category:', error)
      throw new Error(`Categorie aanmaken mislukt: ${error}`)
    }
  },

  // Update existing category
  update: async (id: string, category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    try {
      const result = await invoke<Category>('update_category', { id, category })
      return result
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error)
      throw new Error(`Categorie bijwerken mislukt: ${error}`)
    }
  },

  // Delete category
  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await invoke<boolean>('delete_category', { id })
      return result
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error)
      throw new Error(`Categorie verwijderen mislukt: ${error}`)
    }
  },
}

// Budgets API
export const budgetsApi = {
  // Get all budgets
  getAll: async (): Promise<Budget[]> => {
    try {
      const result = await invoke<Budget[]>('get_budgets')
      return result
    } catch (error) {
      console.error('Failed to fetch budgets:', error)
      throw new Error(`Budgetten ophalen mislukt: ${error}`)
    }
  },

  // Get single budget by ID
  getById: async (id: string): Promise<Budget | null> => {
    try {
      const result = await invoke<Budget | null>('get_budget_by_id', { id })
      return result
    } catch (error) {
      console.error(`Failed to fetch budget ${id}:`, error)
      throw new Error(`Budget ophalen mislukt: ${error}`)
    }
  },

  // Create new budget
  create: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent' | 'remaining'>): Promise<Budget> => {
    try {
      const result = await invoke<Budget>('add_budget', { budget })
      return result
    } catch (error) {
      console.error('Failed to create budget:', error)
      throw new Error(`Budget aanmaken mislukt: ${error}`)
    }
  },

  // Update existing budget
  update: async (id: string, budget: Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'spent' | 'remaining'>): Promise<Budget> => {
    try {
      const result = await invoke<Budget>('update_budget', { id, budget })
      return result
    } catch (error) {
      console.error(`Failed to update budget ${id}:`, error)
      throw new Error(`Budget bijwerken mislukt: ${error}`)
    }
  },

  // Delete budget
  delete: async (id: string): Promise<boolean> => {
    try {
      const result = await invoke<boolean>('delete_budget', { id })
      return result
    } catch (error) {
      console.error(`Failed to delete budget ${id}:`, error)
      throw new Error(`Budget verwijderen mislukt: ${error}`)
    }
  },

  // Update budget spending
  updateSpending: async (id: string, additionalSpent: number): Promise<Budget> => {
    try {
      const result = await invoke<Budget>('update_budget_spending', {
        id,
        additionalSpent
      })
      return result
    } catch (error) {
      console.error(`Failed to update budget spending ${id}:`, error)
      throw new Error(`Budget uitgaven bijwerken mislukt: ${error}`)
    }
  },

  // Get budget summary
  getSummary: async () => {
    try {
      const result = await safeInvoke('get_budget_summary')
      return result
    } catch (error) {
      console.error('Failed to fetch budget summary:', error)
      throw new Error(`Budget overzicht ophalen mislukt: ${error}`)
    }
  },
}

// Settings API
export const settingsApi = {
  // Get current settings
  get: async (): Promise<Settings> => {
    try {
      const result = await invoke<Settings>('get_settings')
      return result
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw new Error(`Instellingen ophalen mislukt: ${error}`)
    }
  },

  // Update settings
  update: async (settings: Settings): Promise<Settings> => {
    try {
      const result = await invoke<Settings>('update_settings', { settings })
      return result
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw new Error(`Instellingen bijwerken mislukt: ${error}`)
    }
  },

  // Reset to default
  resetToDefault: async (): Promise<Settings> => {
    try {
      const result = await invoke<Settings>('reset_settings_to_default')
      return result
    } catch (error) {
      console.error('Failed to reset settings:', error)
      throw new Error(`Instellingen resetten mislukt: ${error}`)
    }
  },

  // Export settings
  export: async (): Promise<any> => {
    try {
      const result = await safeInvoke('export_settings')
      return result
    } catch (error) {
      console.error('Failed to export settings:', error)
      throw new Error(`Instellingen exporteren mislukt: ${error}`)
    }
  },

  // Import settings
  import: async (settingsJson: any): Promise<Settings> => {
    try {
      const result = await invoke<Settings>('import_settings', {
        settingsJson
      })
      return result
    } catch (error) {
      console.error('Failed to import settings:', error)
      throw new Error(`Instellingen importeren mislukt: ${error}`)
    }
  },
}

// AI Insights API
export const insightsApi = {
  // Get financial insights
  getFinancialInsights: async (): Promise<FinancialInsight[]> => {
    try {
      const result = await invoke<FinancialInsight[]>('get_financial_insights')
      return result
    } catch (error) {
      console.error('Failed to fetch financial insights:', error)
      throw new Error(`Financiële inzichten ophalen mislukt: ${error}`)
    }
  },

  // Analyze spending patterns
  analyzeSpendingPatterns: async (): Promise<SpendingAnalysis> => {
    try {
      const result = await invoke<SpendingAnalysis>('analyze_spending_patterns')
      return result
    } catch (error) {
      console.error('Failed to analyze spending patterns:', error)
      throw new Error(`Uitgavenpatronen analyseren mislukt: ${error}`)
    }
  },

  // Get budget recommendations
  getBudgetRecommendations: async (): Promise<string[]> => {
    try {
      const result = await invoke<string[]>('get_budget_recommendations')
      return result
    } catch (error) {
      console.error('Failed to get budget recommendations:', error)
      throw new Error(`Budget aanbevelingen ophalen mislukt: ${error}`)
    }
  },
}

// App Info API
export const appApi = {
  // Get app info
  getInfo: async (): Promise<any> => {
    try {
      const result = await safeInvoke('get_app_info')
      return result
    } catch (error) {
      console.error('Failed to get app info:', error)
      throw new Error(`App informatie ophalen mislukt: ${error}`)
    }
  },

  // Get app version
  getVersion: async (): Promise<string> => {
    try {
      const result = await invoke<string>('get_version')
      return result
    } catch (error) {
      console.error('Failed to get app version:', error)
      throw new Error(`App versie ophalen mislukt: ${error}`)
    }
  },

  // Get platform
  getPlatform: async (): Promise<string> => {
    try {
      const result = await invoke<string>('get_platform')
      return result
    } catch (error) {
      console.error('Failed to get platform:', error)
      throw new Error(`Platform informatie ophalen mislukt: ${error}`)
    }
  },
}

// File System API
export const filesApi = {
  // Select file
  selectFile: async (): Promise<string | null> => {
    try {
      const result = await invoke<string | null>('select_file')
      return result
    } catch (error) {
      console.error('Failed to select file:', error)
      throw new Error(`Bestand selecteren mislukt: ${error}`)
    }
  },

  // Select CSV file specifically
  selectCsvFile: async (): Promise<string | null> => {
    try {
      const selected = await open({
        title: 'Selecteer CSV-bestand',
        filters: [
          {
            name: 'CSV-bestanden',
            extensions: ['csv']
          }
        ],
        multiple: false
      })

      if (selected && typeof selected === 'string') {
        return selected
      }

      return null
    } catch (error) {
      console.error('Failed to select CSV file:', error)
      throw new Error(`CSV-bestand selecteren mislukt: ${error}`)
    }
  },

  // Read file
  readFile: async (path: string): Promise<string> => {
    try {
      const result = await invoke<string>('read_file', { path })
      return result
    } catch (error) {
      console.error(`Failed to read file ${path}:`, error)
      throw new Error(`Bestand lezen mislukt: ${error}`)
    }
  },

  // Write file
  writeFile: async (path: string, content: string): Promise<boolean> => {
    try {
      const result = await invoke<boolean>('write_file', { path, content })
      return result
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error)
      throw new Error(`Bestand schrijven mislukt: ${error}`)
    }
  },
}

// CSV Import API
export const csvApi = {
  // Import CSV from file
  importFromFile: async (filePath: string): Promise<CsvImportResult> => {
    try {
      const result = await invoke<CsvImportResult>('import_csv', { filePath })
      return result
    } catch (error) {
      console.error(`Failed to import CSV from ${filePath}:`, error)
      throw new Error(`CSV importeren mislukt: ${error}`)
    }
  },

  // Parse CSV content
  parseContent: async (content: string): Promise<CsvImportResult> => {
    try {
      const result = await invoke<CsvImportResult>('parse_csv', { content })
      return result
    } catch (error) {
      console.error('Failed to parse CSV content:', error)
      throw new Error(`CSV parsen mislukt: ${error}`)
    }
  },

  // Preview CSV with limit
  previewContent: async (content: string, limit?: number): Promise<CsvImportResult> => {
    try {
      const result = await invoke<CsvImportResult>('preview_csv', { content, limit })
      return result
    } catch (error) {
      console.error('Failed to preview CSV content:', error)
      throw new Error(`CSV voorbeeld mislukt: ${error}`)
    }
  },

  // Validate CSV structure
  validateStructure: async (content: string): Promise<boolean> => {
    try {
      const result = await invoke<boolean>('validate_csv_structure', { content })
      return result
    } catch (error) {
      console.error('Failed to validate CSV structure:', error)
      throw new Error(`CSV validatie mislukt: ${error}`)
    }
  },
}

// Error handling helper
export const handleApiError = (error: any, fallbackMessage: string = 'Er is een onverwachte fout opgetreden') => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return fallbackMessage
}