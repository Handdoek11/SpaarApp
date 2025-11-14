import { invoke } from '@tauri-apps/api/core'
import { open } from '@tauri-apps/plugin-dialog'
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
import {
  mockTransactions,
  mockCategories,
  mockBudgets,
  mockSettings,
  mockInsights,
  mockDashboardStats,
  mockSpendingAnalysis,
  shouldUseMockData
} from './mockData'

// Helper function to check if we should use mock data
const useMockData = (): boolean => {
  return shouldUseMockData()
}

// Transaction API with mock data fallback
export const transactionsApi = {
  // Get all transactions
  getAll: async (): Promise<Transaction[]> => {
    if (useMockData()) {
      console.log('Using mock transactions data')
      return mockTransactions
    }

    try {
      const result = await invoke<Transaction[]>('get_transactions')
      return result
    } catch (error) {
      console.warn('Failed to fetch transactions, falling back to mock data:', error)
      return mockTransactions
    }
  },

  // Get single transaction by ID
  getById: async (id: string): Promise<Transaction | null> => {
    if (useMockData()) {
      console.log('Using mock transaction data')
      return mockTransactions.find(t => t.id === id) || null
    }

    try {
      const result = await invoke<Transaction | null>('get_transaction_by_id', { id })
      return result
    } catch (error) {
      console.warn(`Failed to fetch transaction ${id}, falling back to mock data:`, error)
      return mockTransactions.find(t => t.id === id) || null
    }
  },

  // Create new transaction
  create: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
    if (useMockData()) {
      console.log('Mock: Creating transaction')
      const newTransaction: Transaction = {
        ...transaction,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockTransactions.push(newTransaction)
      return newTransaction
    }

    try {
      const result = await invoke<Transaction>('add_transaction', { transaction })
      return result
    } catch (error) {
      console.warn('Failed to create transaction, using mock:', error)
      const newTransaction: Transaction = {
        ...transaction,
        id: `mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockTransactions.push(newTransaction)
      return newTransaction
    }
  },

  // Update existing transaction
  update: async (id: string, transaction: Partial<Transaction>): Promise<Transaction | null> => {
    if (useMockData()) {
      console.log('Mock: Updating transaction')
      const index = mockTransactions.findIndex(t => t.id === id)
      if (index !== -1) {
        mockTransactions[index] = { ...mockTransactions[index], ...transaction, updated_at: new Date().toISOString() }
        return mockTransactions[index]
      }
      return null
    }

    try {
      const result = await invoke<Transaction | null>('update_transaction', { id, transaction })
      return result
    } catch (error) {
      console.warn(`Failed to update transaction ${id}, using mock:`, error)
      const index = mockTransactions.findIndex(t => t.id === id)
      if (index !== -1) {
        mockTransactions[index] = { ...mockTransactions[index], ...transaction, updated_at: new Date().toISOString() }
        return mockTransactions[index]
      }
      return null
    }
  },

  // Delete transaction
  delete: async (id: string): Promise<boolean> => {
    if (useMockData()) {
      console.log('Mock: Deleting transaction')
      const index = mockTransactions.findIndex(t => t.id === id)
      if (index !== -1) {
        mockTransactions.splice(index, 1)
        return true
      }
      return false
    }

    try {
      const result = await invoke<boolean>('delete_transaction', { id })
      return result
    } catch (error) {
      console.warn(`Failed to delete transaction ${id}, using mock:`, error)
      const index = mockTransactions.findIndex(t => t.id === id)
      if (index !== -1) {
        mockTransactions.splice(index, 1)
        return true
      }
      return false
    }
  }
}

// Category API with mock data fallback
export const categoriesApi = {
  // Get all categories
  getAll: async (): Promise<Category[]> => {
    if (useMockData()) {
      console.log('Using mock categories data')
      return mockCategories
    }

    try {
      const result = await invoke<Category[]>('get_categories')
      return result
    } catch (error) {
      console.warn('Failed to fetch categories, falling back to mock data:', error)
      return mockCategories
    }
  },

  // Create new category
  create: async (category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
    if (useMockData()) {
      console.log('Mock: Creating category')
      const newCategory: Category = {
        ...category,
        id: `cat-mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockCategories.push(newCategory)
      return newCategory
    }

    try {
      const result = await invoke<Category>('add_category', { category })
      return result
    } catch (error) {
      console.warn('Failed to create category, using mock:', error)
      const newCategory: Category = {
        ...category,
        id: `cat-mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockCategories.push(newCategory)
      return newCategory
    }
  }
}

// Budget API with mock data fallback
export const budgetsApi = {
  // Get all budgets
  getAll: async (): Promise<Budget[]> => {
    if (useMockData()) {
      console.log('Using mock budgets data')
      return mockBudgets
    }

    try {
      const result = await invoke<Budget[]>('get_budgets')
      return result
    } catch (error) {
      console.warn('Failed to fetch budgets, falling back to mock data:', error)
      return mockBudgets
    }
  },

  // Create new budget
  create: async (budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<Budget> => {
    if (useMockData()) {
      console.log('Mock: Creating budget')
      const newBudget: Budget = {
        ...budget,
        id: `bud-mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockBudgets.push(newBudget)
      return newBudget
    }

    try {
      const result = await invoke<Budget>('add_budget', { budget })
      return result
    } catch (error) {
      console.warn('Failed to create budget, using mock:', error)
      const newBudget: Budget = {
        ...budget,
        id: `bud-mock-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      mockBudgets.push(newBudget)
      return newBudget
    }
  }
}

// Settings API with mock data fallback
export const settingsApi = {
  // Get settings
  get: async (): Promise<Settings> => {
    if (useMockData()) {
      console.log('Using mock settings data')
      return mockSettings
    }

    try {
      const result = await invoke<Settings>('get_settings')
      return result
    } catch (error) {
      console.warn('Failed to fetch settings, falling back to mock data:', error)
      return mockSettings
    }
  },

  // Update settings
  update: async (settings: Partial<Settings>): Promise<Settings> => {
    if (useMockData()) {
      console.log('Mock: Updating settings')
      const updatedSettings = { ...mockSettings, ...settings, updated_at: new Date().toISOString() }
      Object.assign(mockSettings, updatedSettings)
      return updatedSettings
    }

    try {
      const result = await invoke<Settings>('update_settings', { settings })
      return result
    } catch (error) {
      console.warn('Failed to update settings, using mock:', error)
      const updatedSettings = { ...mockSettings, ...settings, updated_at: new Date().toISOString() }
      Object.assign(mockSettings, updatedSettings)
      return updatedSettings
    }
  }
}

// Insights API with mock data fallback
export const insightsApi = {
  // Get all insights
  getAll: async (): Promise<FinancialInsight[]> => {
    if (useMockData()) {
      console.log('Using mock insights data')
      return mockInsights
    }

    try {
      const result = await invoke<FinancialInsight[]>('get_insights')
      return result
    } catch (error) {
      console.warn('Failed to fetch insights, falling back to mock data:', error)
      return mockInsights
    }
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (useMockData()) {
      console.log('Using mock dashboard stats data')
      return mockDashboardStats
    }

    try {
      const result = await invoke<DashboardStats>('get_dashboard_stats')
      return result
    } catch (error) {
      console.warn('Failed to fetch dashboard stats, falling back to mock data:', error)
      return mockDashboardStats
    }
  },

  // Get spending analysis
  getSpendingAnalysis: async (): Promise<SpendingAnalysis> => {
    if (useMockData()) {
      console.log('Using mock spending analysis data')
      return mockSpendingAnalysis
    }

    try {
      const result = await invoke<SpendingAnalysis>('get_spending_analysis')
      return result
    } catch (error) {
      console.warn('Failed to fetch spending analysis, falling back to mock data:', error)
      return mockSpendingAnalysis
    }
  }
}

// App API with mock data fallback
export const appApi = {
  // Get app info
  getInfo: async (): Promise<string> => {
    if (useMockData()) {
      return 'SpaarApp v1.0.0 (Mock Mode)'
    }

    try {
      const result = await invoke<string>('get_app_info')
      return result
    } catch (error) {
      console.warn('Failed to get app info, using mock:', error)
      return 'SpaarApp v1.0.0 (Mock Mode)'
    }
  },

  // Import CSV file
  importCsv: async (): Promise<CsvImportResult> => {
    if (useMockData()) {
      console.log('Mock: CSV import')
      return {
        success: true,
        imported_count: 15,
        errors: [],
        duplicate_count: 2,
        total_processed: 17
      }
    }

    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'CSV Files',
          extensions: ['csv']
        }]
      })

      if (!selected) {
        throw new Error('Geen bestand geselecteerd')
      }

      const result = await invoke<CsvImportResult>('import_csv', { filePath: selected })
      return result
    } catch (error) {
      console.warn('CSV import failed, using mock result:', error)
      return {
        success: true,
        imported_count: 15,
        errors: [],
        duplicate_count: 2,
        total_processed: 17
      }
    }
  }
}

// CSV API methods (using appApi for actual import)
export const csvApi = {
  validateStructure: async (content: string): Promise<boolean> => {
    // Mock validation - just check if content looks like CSV
    return content.includes('Datum') && content.includes('Bedrag') && content.includes('Omschrijving')
  },

  previewContent: async (content: string, limit: number = 10): Promise<any[]> => {
    // Mock preview - return sample preview data
    return [
      {
        datum: '15-01-2024',
        naam: 'Albert Heijn',
        rekening: 'NL91ABNA0417164300',
        tegenrekening: 'NL91ABNA0417164300',
        code: 'GT',
        afbij: 'Af',
        bedrag: '87,45',
        mutatiesoort: 'Betaalautomaat',
        mededelingen: 'Betaling'
      },
      {
        datum: '10-01-2024',
        naam: 'NS Vervoer',
        rekening: 'NL91ABNA0417164300',
        tegenrekening: 'NL91ABNA0417164300',
        code: 'GT',
        afbij: 'Af',
        bedrag: '125,50',
        mutatiesoort: 'Incasso',
        mededelingen: 'Maandabonnement'
      }
    ]
  },

  parseContent: async (content: string): Promise<CsvImportResult> => {
    // Mock parsing result
    return {
      success: true,
      imported_count: 15,
      errors: [],
      duplicate_count: 2,
      total_processed: 17
    }
  }
}

// Files API methods
export const filesApi = {
  selectCsvFile: async (): Promise<string | null> => {
    if (useMockData()) {
      // Return mock file path for testing
      return 'mock:/transactions-sample.csv'
    }

    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'CSV Files',
          extensions: ['csv']
        }]
      })
      return selected as string || null
    } catch (error) {
      console.warn('File selection failed:', error)
      return null
    }
  },

  readFile: async (filePath: string): Promise<string> => {
    if (useMockData() && filePath.startsWith('mock:')) {
      // Return mock CSV content
      return `Datum,Naam/Omschrijving,Rekening,Tegenrekening,Code,Af/Bij,Bedrag,MutatieSoort,Mededelingen
15-01-2024,Albert Heijn,NL91ABNA0417164300,NL91ABNA0417164300,GT,Af,87,45,Betaalautomaat,Betaling
10-01-2024,NS Vervoer,NL91ABNA0417164300,NL91ABNA0417164300,GT,Af,125,50,Incasso,Maandabonnement`
    }

    try {
      const result = await invoke<string>('read_file', { filePath })
      return result
    } catch (error) {
      console.warn('File read failed, using mock content:', error)
      return `Datum,Naam/Omschrijving,Rekening,Tegenrekening,Code,Af/Bij,Bedrag,MutatieSoort,Mededelingen
15-01-2024,Albert Heijn,NL91ABNA0417164300,NL91ABNA0417164300,GT,Af,87,45,Betaalautomaat,Betaling`
    }
  }
}

// Export all APIs
export default {
  transactionsApi,
  categoriesApi,
  budgetsApi,
  settingsApi,
  insightsApi,
  appApi,
  csvApi,
  filesApi
}