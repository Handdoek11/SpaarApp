import React, { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  Savings as SavingsIcon,
  PieChart as BudgetIcon,
  Add as AddIcon,
  Receipt as TransactionIcon,
  Lightbulb as InsightIcon,
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'

// Import types and API
import { Transaction, FinancialInsight, DashboardStats } from '../types'
import { transactionsApi, insightsApi, appApi } from '../services/apiWithFallback'

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
}))

const StatCard = styled(StyledCard)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].main}dd 0%, ${theme.palette[color].light}dd 100%)`,
  color: 'white',
  '& .MuiTypography-root': {
    color: 'white',
  },
}))

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [insights, setInsights] = useState<FinancialInsight[]>([])

  // Load real data from Tauri backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load transactions and insights in parallel
        const [transactionsResult, insightsResult] = await Promise.allSettled([
          transactionsApi.getAll(),
          insightsApi.getDashboardStats()
        ])

        // Process transactions
        let transactions: Transaction[] = []
        if (transactionsResult.status === 'fulfilled') {
          transactions = transactionsResult.value
        } else {
          console.warn('Failed to load transactions:', transactionsResult.reason)
          toast.error('Transacties laden mislukt')
        }

        // Process insights
        let insights: FinancialInsight[] = []
        if (insightsResult.status === 'fulfilled') {
          insights = insightsResult.value
        } else {
          console.warn('Failed to load insights:', insightsResult.reason)
          // Don't show toast for insights, it's not critical
        }

        // Calculate dashboard stats from real data
        const totalIncome = transactions
          .filter(t => t.transaction_type === 'credit')
          .reduce((sum, t) => sum + t.amount, 0)

        const totalExpenses = transactions
          .filter(t => t.transaction_type === 'debit')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const netSavings = totalIncome - totalExpenses
        const budgetUtilization = transactions.length > 0 ? 72 : 0 // Placeholder for now

        const dashboardStats: DashboardStats = {
          totalIncome,
          totalExpenses,
          netSavings,
          budgetUtilization,
          recentTransactions: transactions.slice(0, 5), // Get 5 most recent
          insights,
        }

        setStats(dashboardStats)
        setRecentTransactions(transactions.slice(0, 5)) // Get 5 most recent for display
        setInsights(Array.isArray(insights) ? insights.slice(0, 3) : []) // Get 3 most recent insights

        if (transactions.length === 0) {
          toast('Geen transacties gevonden. Voeg uw eerste transactie toe!', {
            icon: 'ℹ️',
          })
        }

      } catch (err) {
        console.error('Failed to load dashboard data:', err)
        const errorMessage = err instanceof Error ? err.message : 'Onbekende fout'
        setError(`Dashboard data laden mislukt: ${errorMessage}`)
        toast.error('Dashboard laden mislukt')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        role="status"
        aria-label="Dashboard wordt geladen"
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Dashboard wordt geladen...
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => window.location.reload()}>
            Opnieuw proberen
          </Button>
        }
        sx={{ mb: 2 }}
      >
        {error}
      </Alert>
    )
  }

  if (!stats) {
    return (
      <Alert severity="info">
        Geen data beschikbaar. Voeg transacties toe om uw dashboard te vullen.
      </Alert>
    )
  }

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welkom bij SpaarApp! Hier is uw financieel overzicht.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
          sx={{ minHeight: 48 }}
        >
          Transactie Toevoegen
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="success">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.totalIncome)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Totaal Inkomen
                  </Typography>
                </Box>
                <IncomeIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="error">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.totalExpenses)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Totaal Uitgaven
                  </Typography>
                </Box>
                <ExpenseIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="primary">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div">
                    {formatCurrency(stats.netSavings)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Netto Besparing
                  </Typography>
                </Box>
                <SavingsIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard color="warning">
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.budgetUtilization}%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Budget Gebruik
                  </Typography>
                </Box>
                <BudgetIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </StatCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Transactions */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Recente Transacties</Typography>
              <Button variant="text" size="small">
                Bekijk alles
              </Button>
            </Box>

            {recentTransactions.length > 0 ? (
              <List>
                {recentTransactions.map((transaction) => (
                  <ListItem key={transaction.id} sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <TransactionIcon
                        color={transaction.transaction_type === 'credit' ? 'success' : 'action'}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={transaction.description}
                      secondary={formatDate(transaction.date)}
                    />
                    <Typography
                      variant="h6"
                      color={transaction.transaction_type === 'credit' ? 'success.main' : 'text.primary'}
                      sx={{ fontWeight: 600 }}
                    >
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height={250}
                color="text.secondary"
              >
                <TransactionIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Geen transacties yet
                </Typography>
                <Typography variant="body2">
                  Voeg uw eerste transactie toe om te beginnen.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* AI Insights */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <InsightIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">AI Inzichten</Typography>
            </Box>

            {insights.length > 0 ? (
              <Box>
                {insights.map((insight) => (
                  <Card key={insight.id} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ pb: 2 }}>
                      <Box display="flex" alignItems="center" mb={1}>
                        <Chip
                          label={insight.impact}
                          size="small"
                          color={
                            insight.impact === 'high'
                              ? 'error'
                              : insight.impact === 'medium'
                              ? 'warning'
                              : 'success'
                          }
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {Math.round(insight.confidence_score * 100)}% zekerheid
                        </Typography>
                      </Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {insight.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height={280}
                color="text.secondary"
              >
                <InsightIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Analyse wordt voorbereid
                </Typography>
                <Typography variant="body2" textAlign="center">
                  Voeg meer transacties toe om AI-inzichten te ontvangen.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default Dashboard
