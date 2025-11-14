import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Snackbar,
  useTheme,
  Tooltip,
  Tabs,
  Tab,
  CircularProgress,
  AlertTitle,
  Divider,
  alpha,
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Savings as SavingsIcon,
  Warning as WarningIcon,
  Lightbulb as LightbulbIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  AccountBalanceWallet as WalletIcon,
  ShoppingCart as ShoppingIcon,
  LocalOffer as OfferIcon,
} from '@mui/icons-material'
import { insightsApi } from '../services/api'
import { FinancialInsight, SpendingAnalysis, CategorySpending } from '../types'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box>{children}</Box>}
    </div>
  )
}

const Insights: React.FC = () => {
  const theme = useTheme()
  const [tabValue, setTabValue] = useState(0)
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [spendingAnalysis, setSpendingAnalysis] = useState<SpendingAnalysis | null>(null)
  const [budgetRecommendations, setBudgetRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load all insights data
  const loadInsightsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [insightsData, analysisData, recommendationsData] = await Promise.all([
        insightsApi.getFinancialInsights(),
        insightsApi.analyzeSpendingPatterns(),
        insightsApi.getBudgetRecommendations(),
      ])

      setInsights(insightsData)
      setSpendingAnalysis(analysisData)
      setBudgetRecommendations(recommendationsData)
    } catch (err) {
      setError('Inzichten laden mislukt')
      console.error('Failed to load insights:', err)
    } finally {
      setLoading(false)
    }
  }

  // Refresh insights data
  const refreshData = async () => {
    setRefreshing(true)
    try {
      await loadInsightsData()
    } finally {
      setRefreshing(false)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadInsightsData()
  }, [])

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Get insight type color and icon
  const getInsightTypeConfig = (type: FinancialInsight['insight_type']) => {
    switch (type) {
      case 'spending_pattern':
        return {
          color: theme.palette.info.main,
          icon: <TimelineIcon />,
          bgColor: alpha(theme.palette.info.main, 0.1),
          label: 'Uitgavenpatroon',
        }
      case 'budget_optimization':
        return {
          color: theme.palette.primary.main,
          icon: <AssessmentIcon />,
          bgColor: alpha(theme.palette.primary.main, 0.1),
          label: 'Budget Optimalisatie',
        }
      case 'savings_opportunity':
        return {
          color: theme.palette.success.main,
          icon: <SavingsIcon />,
          bgColor: alpha(theme.palette.success.main, 0.1),
          label: 'Besparing',
        }
      case 'unusual_activity':
        return {
          color: theme.palette.warning.main,
          icon: <WarningIcon />,
          bgColor: alpha(theme.palette.warning.main, 0.1),
          label: 'Ongebruikelijk',
        }
      default:
        return {
          color: theme.palette.grey[500],
          icon: <LightbulbIcon />,
          bgColor: alpha(theme.palette.grey[500], 0.1),
          label: 'Algemeen',
        }
    }
  }

  // Get impact level configuration
  const getImpactConfig = (impact: FinancialInsight['impact']) => {
    switch (impact) {
      case 'high':
        return {
          color: theme.palette.error.main,
          label: 'Hoge impact',
          weight: 600,
        }
      case 'medium':
        return {
          color: theme.palette.warning.main,
          label: 'Gemiddelde impact',
          weight: 500,
        }
      case 'low':
        return {
          color: theme.palette.info.main,
          label: 'Lage impact',
          weight: 400,
        }
      default:
        return {
          color: theme.palette.grey[500],
          label: 'Onbekend',
          weight: 400,
        }
    }
  }

  // Render spending overview
  const renderSpendingOverview = () => {
    if (!spendingAnalysis) return null

    const { total_spending, total_income, net_savings, spending_trend, average_daily_spending } = spendingAnalysis
    const savingsRate = total_income > 0 ? (net_savings / total_income) * 100 : 0

    return (
      <Grid container spacing={3}>
        {/* Main Financial Overview */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WalletIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Totaal Inkomsten
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                {formatCurrency(total_income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', border: `2px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ShoppingIcon sx={{ color: theme.palette.error.main, mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Totaal Uitgaven
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                {formatCurrency(total_spending)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', border: `2px solid ${alpha(net_savings >= 0 ? theme.palette.success.main : theme.palette.error.main, 0.2)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {net_savings >= 0 ? <SavingsIcon sx={{ color: theme.palette.success.main, mr: 1 }} /> : <WarningIcon sx={{ color: theme.palette.error.main, mr: 1 }} />}
                <Typography variant="h6" color="text.secondary">
                  Netto Besparing
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: net_savings >= 0 ? theme.palette.success.main : theme.palette.error.main }}>
                {formatCurrency(net_savings)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%', border: `2px solid ${alpha(theme.palette.info.main, 0.2)}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TimelineIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                <Typography variant="h6" color="text.secondary">
                  Gem. Dagelijks
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                {formatCurrency(average_daily_spending)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Trend Indicator */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Uitgaven Trend
                </Typography>
                <Chip
                  icon={spending_trend === 'increasing' ? <ArrowUpIcon /> : spending_trend === 'decreasing' ? <ArrowDownIcon /> : <TrendingUpIcon />}
                  label={spending_trend === 'increasing' ? 'Stijgend' : spending_trend === 'decreasing' ? 'Dalend' : 'Stabiel'}
                  color={spending_trend === 'increasing' ? 'error' : spending_trend === 'decreasing' ? 'success' : 'default'}
                />
              </Box>

              {/* Savings Rate */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Spaarpercentage
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {savingsRate.toFixed(1)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(savingsRate, 0), 100)}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.grey[300], 0.3),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: savingsRate >= 20 ? theme.palette.success.main :
                                       savingsRate >= 10 ? theme.palette.warning.main : theme.palette.error.main,
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Spending */}
        {spendingAnalysis.top_categories && spendingAnalysis.top_categories.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  <PieChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Top Uitgaven Categorieën
                </Typography>
                <Grid container spacing={2}>
                  {spendingAnalysis.top_categories.slice(0, 8).map((category, index) => (
                    <Grid item xs={12} md={6} key={category.category_id}>
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {index + 1}. {category.category_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatCurrency(category.amount)} ({category.percentage.toFixed(1)}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={category.percentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.grey[300], 0.3),
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.primary.main,
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          {category.transaction_count} transacties
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    )
  }

  // Render AI insights
  const renderAIInsights = () => {
    const actionableInsights = insights.filter(insight => insight.actionable)
    const highImpactInsights = insights.filter(insight => insight.impact === 'high')

    return (
      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
            <CardContent>
              <Typography variant="h6" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                Actiebare Inzichten
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                {actionableInsights.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inzichten die je kunt gebruiken om je financiën te verbeteren
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.warning.main, 0.05) }}>
            <CardContent>
              <Typography variant="h6" color="warning.main" sx={{ mb: 1, fontWeight: 600 }}>
                Hoge Impact
              </Typography>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {highImpactInsights.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Inzichten die de meeste invloed hebben op je financiële situatie
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', backgroundColor: alpha(theme.palette.success.main, 0.05) }}>
            <CardContent>
              <Typography variant="h6" color="success.main" sx={{ mb: 1, fontWeight: 600 }}>
                Gem. Betrouwbaarheid
              </Typography>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                {insights.length > 0 ? (insights.reduce((sum, insight) => sum + insight.confidence_score, 0) / insights.length).toFixed(0) : '0'}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gemiddelde betrouwbaarheidsscore van alle inzichten
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights List */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                <LightbulbIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI-Personlijke Inzichten
              </Typography>

              {insights.length === 0 ? (
                <Alert severity="info" sx={{ mb: 3 }}>
                  <AlertTitle>Geen inzichten beschikbaar</AlertTitle>
                  We hebben nog niet genoeg data om gepersonaliseerde inzichten te genereren. Voeg meer transacties toe om betere inzichten te krijgen.
                </Alert>
              ) : (
                <List>
                  {insights.map((insight, index) => {
                    const typeConfig = getInsightTypeConfig(insight.insight_type)
                    const impactConfig = getImpactConfig(insight.impact)

                    return (
                      <React.Fragment key={insight.id}>
                        <ListItem
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 2,
                            border: `2px solid ${alpha(typeConfig.color, 0.3)}`,
                            backgroundColor: alpha(typeConfig.color, 0.05),
                            '&:hover': {
                              backgroundColor: alpha(typeConfig.color, 0.1),
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 60 }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: typeConfig.bgColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: typeConfig.color,
                              }}
                            >
                              {typeConfig.icon}
                            </Box>
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {insight.title}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={typeConfig.label}
                                  sx={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                                />
                                <Chip
                                  size="small"
                                  label={impactConfig.label}
                                  sx={{
                                    backgroundColor: alpha(impactConfig.color, 0.1),
                                    color: impactConfig.color,
                                    fontWeight: impactConfig.weight,
                                  }}
                                />
                                {insight.actionable && (
                                  <Chip
                                    size="small"
                                    label="Actiebaar"
                                    icon={<CheckCircleIcon />}
                                    color="primary"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {insight.description}
                                </Typography>

                                {insight.action_suggestions && insight.action_suggestions.length > 0 && (
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                      Actiepunten:
                                    </Typography>
                                    {insight.action_suggestions.map((suggestion, idx) => (
                                      <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <OfferIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.primary.main }} />
                                        <Typography variant="body2">
                                          {suggestion}
                                        </Typography>
                                      </Box>
                                    ))}
                                  </Box>
                                )}

                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
                                  <Typography variant="caption" color="text.secondary">
                                    Betrouwbaarheid:
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={insight.confidence_score}
                                      sx={{
                                        flex: 1,
                                        height: 6,
                                        borderRadius: 3,
                                        backgroundColor: alpha(theme.palette.grey[300], 0.3),
                                        '& .MuiLinearProgress-bar': {
                                          backgroundColor: insight.confidence_score >= 80 ? theme.palette.success.main :
                                           insight.confidence_score >= 60 ? theme.palette.warning.main : theme.palette.error.main,
                                          borderRadius: 3,
                                        },
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ ml: 1, minWidth: 35 }}>
                                      {insight.confidence_score}%
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < insights.length - 1 && <Divider />}
                      </React.Fragment>
                    )
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  // Render budget recommendations
  const renderBudgetRecommendations = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                <AssessmentIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                AI Budget Aanbevelingen
              </Typography>

              {budgetRecommendations.length === 0 ? (
                <Alert severity="info">
                  <AlertTitle>Geen aanbevelingen beschikbaar</AlertTitle>
                  We hebben meer data nodig om gepersonaliseerde budget aanbevelingen te genereren.
                </Alert>
              ) : (
                <List>
                  {budgetRecommendations.map((recommendation, index) => (
                    <React.Fragment key={index}>
                      <ListItem
                        sx={{
                          p: 2,
                          mb: 1,
                          borderRadius: 2,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }}
                      >
                        <ListItemIcon>
                          <LightbulbIcon sx={{ color: theme.palette.primary.main }} />
                        </ListItemIcon>
                        <ListItemText
                          primary="AI Aanbeveling"
                          secondary={recommendation}
                        />
                      </ListItem>
                      {index < budgetRecommendations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          AI Inzichten
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          onClick={refreshData}
          disabled={loading || refreshing}
          sx={{ minWidth: 120 }}
        >
          {refreshing ? 'Verversen...' : 'Ververs'}
        </Button>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Fout</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            AI-inzichten genereren...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Dit kan even duren omdat we jouw financiële data analyseren
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Tabs */}
          <Paper sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
            >
              <Tab label="Overzicht" icon={<PieChartIcon />} iconPosition="start" />
              <Tab label="AI Inzichten" icon={<LightbulbIcon />} iconPosition="start" />
              <Tab label="Aanbevelingen" icon={<AssessmentIcon />} iconPosition="start" />
            </Tabs>
          </Paper>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            {renderSpendingOverview()}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {renderAIInsights()}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {renderBudgetRecommendations()}
          </TabPanel>
        </>
      )}

      {/* Success/Error Messages */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Insights