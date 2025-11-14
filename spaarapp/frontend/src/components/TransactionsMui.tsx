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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  IconButton,
  Menu,
  FormControl,
  InputLabel,
  Select,
  Fab,
  Snackbar,
  LinearProgress
} from '@mui/material'
import {
  Add as AddIcon,
  Upload as UploadIcon,
  Description as FileTextIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import toast from 'react-hot-toast'

import { Transaction, Category } from '../types'
import { transactionsApi, categoriesApi } from '../services/apiWithFallback'
import { CsvImport } from './CsvImport'

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[8],
  },
}))

const TransactionsTable = styled(Table)(({ theme }) => ({
  '& .MuiTableCell-head': {
    backgroundColor: theme.palette.grey[50],
    fontWeight: 600,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}))

const StatusChip = styled(Chip)<{ type: 'credit' | 'debit' }>(({ theme, type }) => ({
  backgroundColor: type === 'credit'
    ? theme.palette.success.main
    : theme.palette.error.main,
  color: 'white',
  fontWeight: 500,
}))

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showImport, setShowImport] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionsApi.getAll(),
        categoriesApi.getAll()
      ])
      setTransactions(transactionsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Transacties konden niet worden geladen')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportComplete = (importedTransactions: Transaction[]) => {
    setTransactions(prev => [...importedTransactions, ...prev])
    setShowImport(false)
    toast.success(`${importedTransactions.length} transacties geïmporteerd`)
  }

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

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.icon || '📝'
  }

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.color || '#757575'
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesType = filterType === 'all' || transaction.transaction_type === filterType

    const matchesCategory = selectedCategory === 'all' || transaction.category_id === selectedCategory

    return matchesSearch && matchesType && matchesCategory
  })

  const totalBalance = filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = filteredTransactions.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(filteredTransactions.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + t.amount, 0))

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        role="status"
        aria-label="Transacties worden geladen"
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Transacties worden geladen...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" component="h1" gutterBottom>
            Transacties
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Beheer je financiële transacties
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowImport(true)}
          sx={{ minHeight: 48 }}
        >
          Transactie Toevoegen
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Totaaldo
              </Typography>
              <Typography variant="h4" component="div">
                {formatCurrency(totalBalance)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Inkomen
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                +{formatCurrency(totalIncome)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Uitgaven
              </Typography>
              <Typography variant="h4" component="div" color="error.main">
                -{formatCurrency(totalExpenses)}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="overline">
                Transacties
              </Typography>
              <Typography variant="h4" component="div">
                {filteredTransactions.length}
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <StyledCard sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Zoek transacties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon color="action" />,
              }}
              sx={{ minWidth: 300 }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleMenuClick}
              sx={{ minHeight: 48 }}
            >
              Filters
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { minWidth: 250 }
              }}
            >
              <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Type
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                  >
                    <MenuItem value="all">Alle</MenuItem>
                    <MenuItem value="credit">Bij</MenuItem>
                    <MenuItem value="debit">Af</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Categorie
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <MenuItem value="all">Alle categorieën</MenuItem>
                    <MenuItem value="">Geen categorie</MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Menu>
          </Box>
        </CardContent>
      </StyledCard>

      {/* Transactions Table */}
      <StyledCard>
        <CardContent sx={{ p: 0 }}>
          {filteredTransactions.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center'
              }}
            >
              <FileTextIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {searchQuery || filterType !== 'all' || selectedCategory !== 'all'
                  ? 'Geen transacties gevonden'
                  : 'Nog geen transacties'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || filterType !== 'all' || selectedCategory !== 'all'
                  ? 'Probeer je zoekopdracht of filters aan te passen'
                  : 'Importeer je Rabobank CSV-bestand om te beginnen'
                }
              </Typography>
              {!searchQuery && filterType === 'all' && selectedCategory === 'all' && (
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={() => setShowImport(true)}
                  sx={{ minHeight: 48 }}
                >
                  Importeer CSV
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <TransactionsTable>
                <TableHead>
                  <TableRow>
                    <TableCell>Datum</TableCell>
                    <TableCell>Omschrijving</TableCell>
                    <TableCell>Categorie</TableCell>
                    <TableCell align="right">Bedrag</TableCell>
                    <TableCell align="center">Type</TableCell>
                    <TableCell>Saldo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(transaction.date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {transaction.description}
                          </Typography>
                          {transaction.notes && (
                            <Typography variant="caption" color="text.secondary">
                              {transaction.notes}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {transaction.category_id && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {categories.find(c => c.id === transaction.category_id)?.name}
                            </Typography>
                            <Typography sx={{ fontSize: '14px' }}>
                              {getCategoryIcon(categories.find(c => c.id === transaction.category_id)?.name || '')}
                            </Typography>
                          </Box>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          color={transaction.transaction_type === 'credit' ? 'success.main' : 'error.main'}
                        >
                          {transaction.transaction_type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <StatusChip
                          type={transaction.transaction_type}
                          label={transaction.transaction_type === 'credit' ? 'Bij' : 'Af'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {transaction.balance_after ? formatCurrency(transaction.balance_after) : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TransactionsTable>
            </TableContainer>
          )}
        </CardContent>
      </StyledCard>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => setShowImport(true)}
      >
        <AddIcon />
      </Fab>

      {/* CSV Import Dialog */}
      <CsvImport
        open={showImport}
        onClose={() => setShowImport(false)}
        onImportComplete={handleImportComplete}
      />
    </Box>
  )
}

export default Transactions