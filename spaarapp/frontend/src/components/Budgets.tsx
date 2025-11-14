import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  Card,
  CardContent,
  useTheme,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  alpha,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  NotificationsActive as NotificationIcon,
} from '@mui/icons-material'
import { budgetsApi, categoriesApi } from '../services/api'
import { Budget, Category } from '../types'

interface BudgetFormData {
  name: string
  category_id?: string
  amount: number
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  start_date: string
  end_date?: string
  is_active: boolean
  notification_threshold?: number
}

interface BudgetWithCategory extends Budget {
  category?: Category
}

const Budgets: React.FC = () => {
  const theme = useTheme()
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredBudgets, setFilteredBudgets] = useState<BudgetWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [showInactiveBudgets, setShowInactiveBudgets] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data for create/edit
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    amount: 0,
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    is_active: true,
  })

  // Load budgets and categories
  const loadData = async () => {
    try {
      setLoading(true)
      const [budgetsData, categoriesData] = await Promise.all([
        budgetsApi.getAll(),
        categoriesApi.getAll(),
      ])

      // Attach category information to budgets
      const budgetsWithCategories = budgetsData.map(budget => ({
        ...budget,
        category: categoriesData.find(cat => cat.id === budget.category_id),
      }))

      setBudgets(budgetsWithCategories)
      setFilteredBudgets(budgetsWithCategories)
      setCategories(categoriesData)
    } catch (err) {
      setError('Gegevens laden mislukt')
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter budgets based on search and active status
  useEffect(() => {
    let filtered = budgets

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(budget =>
        budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        budget.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter inactive budgets
    if (!showInactiveBudgets) {
      filtered = filtered.filter(budget => budget.is_active)
    }

    setFilteredBudgets(filtered)
  }, [budgets, searchTerm, showInactiveBudgets])

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      amount: 0,
      period: 'monthly',
      start_date: new Date().toISOString().split('T')[0],
      is_active: true,
    })
  }

  // Calculate budget progress percentage
  const getProgressPercentage = (budget: Budget) => {
    if (budget.amount <= 0) return 0
    const percentage = (budget.spent / budget.amount) * 100
    return Math.min(percentage, 100) // Cap at 100%
  }

  // Get budget status color and icon
  const getBudgetStatus = (budget: Budget) => {
    const percentage = getProgressPercentage(budget)

    if (percentage >= 100) {
      return {
        color: theme.palette.error.main,
        bgColor: alpha(theme.palette.error.main, 0.1),
        icon: <WarningIcon />,
        text: 'OverBudget',
      }
    } else if (percentage >= 80) {
      return {
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: <TrendingUpIcon />,
        text: 'Waarschuwing',
      }
    } else if (percentage >= 50) {
      return {
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        icon: <TimelineIcon />,
        text: 'Op Goed Weg',
      }
    } else {
      return {
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: <CheckCircleIcon />,
        text: 'Goed',
      }
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount)
  }

  // Handle create budget
  const handleCreateBudget = async () => {
    try {
      if (!formData.name.trim() || formData.amount <= 0) {
        setError('Budget naam en bedrag zijn verplicht')
        return
      }

      const newBudget = await budgetsApi.create(formData)
      setBudgets([...budgets, { ...newBudget, category: categories.find(cat => cat.id === formData.category_id) }])
      setIsCreateDialogOpen(false)
      resetFormData()
      setSuccess('Budget succesvol aangemaakt')
    } catch (err) {
      setError('Budget aanmaken mislukt')
      console.error('Failed to create budget:', err)
    }
  }

  // Handle update budget
  const handleUpdateBudget = async () => {
    try {
      if (!editingBudget || !formData.name.trim() || formData.amount <= 0) {
        setError('Budget naam en bedrag zijn verplicht')
        return
      }

      const updatedBudget = await budgetsApi.update(editingBudget.id, formData)
      setBudgets(budgets.map(budget =>
        budget.id === editingBudget.id
          ? { ...updatedBudget, category: categories.find(cat => cat.id === formData.category_id) }
          : budget
      ))
      setIsEditDialogOpen(false)
      setEditingBudget(null)
      resetFormData()
      setSuccess('Budget succesvol bijgewerkt')
    } catch (err) {
      setError('Budget bijwerken mislukt')
      console.error('Failed to update budget:', err)
    }
  }

  // Handle delete budget
  const handleDeleteBudget = async (budget: Budget) => {
    if (window.confirm(`Weet je zeker dat je "${budget.name}" wilt verwijderen?`)) {
      try {
        await budgetsApi.delete(budget.id)
        setBudgets(budgets.filter(b => b.id !== budget.id))
        setSuccess('Budget succesvol verwijderd')
      } catch (err) {
        setError('Budget verwijderen mislukt')
        console.error('Failed to delete budget:', err)
      }
    }
  }

  // Start editing budget
  const startEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      name: budget.name,
      category_id: budget.category_id,
      amount: budget.amount,
      period: budget.period,
      start_date: budget.start_date,
      end_date: budget.end_date,
      is_active: budget.is_active,
      notification_threshold: budget.notification_threshold,
    })
    setIsEditDialogOpen(true)
  }

  // Close dialogs
  const closeDialogs = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingBudget(null)
    resetFormData()
    setError(null)
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        Budgetten
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Zoek budgetten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-input': {
                  py: 1.5, // Larger touch target for ADHD
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'stretch', md: 'flex-end' } }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showInactiveBudgets}
                    onChange={(e) => setShowInactiveBudgets(e.target.checked)}
                  />
                }
                label="Toon Inactieve"
              />
              <Button
                variant="contained"
                onClick={() => setIsCreateDialogOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  minWidth: { xs: '100%', md: 'auto' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                }}
              >
                Nieuw Budget
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Budgets Grid */}
      {loading ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">Budgetten laden...</Typography>
        </Paper>
      ) : filteredBudgets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1">
            {searchTerm ? 'Geen budgetten gevonden voor je zoekopdracht' : 'Geen budgetten beschikbaar'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBudgets.map((budget) => {
            const status = getBudgetStatus(budget)
            const progressPercentage = getProgressPercentage(budget)
            const remaining = budget.amount - budget.spent

            return (
              <Grid item xs={12} md={6} lg={4} key={budget.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `2px solid ${alpha(status.color, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 8px 32px ${alpha(status.color, 0.2)}`,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    opacity: budget.is_active ? 1 : 0.6,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {budget.name}
                        </Typography>
                        {budget.category && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {budget.category.icon}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {budget.category.name}
                            </Typography>
                          </Box>
                        )}
                        <Chip
                          size="small"
                          label={status.text}
                          icon={status.icon}
                          sx={{
                            backgroundColor: status.bgColor,
                            color: status.color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => startEditBudget(budget)}
                          sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBudget(budget)}
                          sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1) }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Progress */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Voortgang
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {Math.round(progressPercentage)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progressPercentage >= 80 ? theme.palette.error.main : status.color,
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Financial Details */}
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Budget
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(budget.amount)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Uitgegeven
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {formatCurrency(budget.spent)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Resterend
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 600,
                            color: remaining >= 0 ? 'text.primary' : theme.palette.error.main,
                          }}
                        >
                          {formatCurrency(remaining)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Periode
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {budget.period === 'weekly' ? 'Wekelijks' :
                           budget.period === 'monthly' ? 'Maandelijks' :
                           budget.period === 'quarterly' ? 'Per Kwartaal' : 'Jaarlijks'}
                        </Typography>
                      </Grid>
                    </Grid>

                    {!budget.is_active && (
                      <Box sx={{ mt: 2, p: 1, backgroundColor: alpha(theme.palette.grey[500], 0.1), borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Dit budget is inactief
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onClose={closeDialogs}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 1 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {isEditDialogOpen ? 'Budget Bewerken' : 'Nieuw Budget'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Budget Naam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bedrag (€)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                margin="normal"
                required
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Periode</InputLabel>
                <Select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as any })}
                  label="Periode"
                >
                  <MenuItem value="weekly">Wekelijks</MenuItem>
                  <MenuItem value="monthly">Maandelijks</MenuItem>
                  <MenuItem value="quarterly">Per Kwartaal</MenuItem>
                  <MenuItem value="yearly">Jaarlijks</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Categorie (Optioneel)</InputLabel>
                <Select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value || undefined })}
                  label="Categorie (Optioneel)"
                >
                  <MenuItem value="">Geen categorie</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Startdatum"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Einddatum (Optioneel)"
                type="date"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
                margin="normal"
                inputProps={{ min: formData.start_date }}
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notificatie Drempel (€)"
                type="number"
                value={formData.notification_threshold || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  notification_threshold: parseFloat(e.target.value) || undefined
                })}
                margin="normal"
                helperText="Waarschuwing wanneer dit bedrag is uitgegeven"
                inputProps={{ min: 0, step: 0.01 }}
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                }
                label="Budget Actief"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={closeDialogs}
            startIcon={<CancelIcon />}
            sx={{ minWidth: 120, py: 1.5 }}
          >
            Annuleren
          </Button>
          <Button
            onClick={isEditDialogOpen ? handleUpdateBudget : handleCreateBudget}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              minWidth: 120,
              py: 1.5,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            }}
          >
            {isEditDialogOpen ? 'Bijwerken' : 'Aanmaken'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Messages */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

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

export default Budgets