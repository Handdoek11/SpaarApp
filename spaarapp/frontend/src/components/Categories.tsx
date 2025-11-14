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
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material'
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Palette as ColorIcon,
  Category as CategoryIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material'
import { categoriesApi } from '../services/api'
import { Category } from '../types'

// Predefined colors for categories (ADHD-friendly high contrast colors)
const CATEGORY_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Mint Green
  '#FECA57', // Yellow
  '#B983FF', // Lavender
  '#FF8CC8', // Pink
  '#6C5CE7', // Purple
  '#A8E6CF', // Light Green
  '#FFB6C1', // Light Pink
]

// Predefined icons for categories
const CATEGORY_ICONS = [
  '🛒', // Shopping cart
  '🍔', // Food
  '🚗', // Transport
  '🏠', // Home
  '⚕️', // Health
  '🎮', // Entertainment
  '💰', // Finance
  '📚', // Education
  '👕', // Clothing
  '✈️', // Travel
  '🏥', // Medical
  '🏋️', // Fitness
  '🎬', // Movies
  '☕', // Coffee
  '🎯', // Goals
]

interface CategoryFormData {
  name: string
  description: string
  color: string
  icon: string
  parent_id?: string
  budget_percentage?: number
}

const Categories: React.FC = () => {
  const theme = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [showSystemCategories, setShowSystemCategories] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form data for create/edit
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  })

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoriesApi.getAll()
      setCategories(data)
      setFilteredCategories(data)
    } catch (err) {
      setError('Categorieën laden mislukt')
      console.error('Failed to load categories:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter categories based on search and system category toggle
  useEffect(() => {
    let filtered = categories

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter system categories
    if (!showSystemCategories) {
      filtered = filtered.filter(category => !category.is_system)
    }

    setFilteredCategories(filtered)
  }, [categories, searchTerm, showSystemCategories])

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
    })
  }

  // Handle create category
  const handleCreateCategory = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Categorie naam is verplicht')
        return
      }

      const newCategory = await categoriesApi.create(formData)
      setCategories([...categories, newCategory])
      setIsCreateDialogOpen(false)
      resetFormData()
      setSuccess('Categorie succesvol aangemaakt')
    } catch (err) {
      setError('Categorie aanmaken mislukt')
      console.error('Failed to create category:', err)
    }
  }

  // Handle update category
  const handleUpdateCategory = async () => {
    try {
      if (!editingCategory || !formData.name.trim()) {
        setError('Categorie naam is verplicht')
        return
      }

      const updatedCategory = await categoriesApi.update(editingCategory.id, formData)
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? updatedCategory : cat
      ))
      setIsEditDialogOpen(false)
      setEditingCategory(null)
      resetFormData()
      setSuccess('Categorie succesvol bijgewerkt')
    } catch (err) {
      setError('Categorie bijwerken mislukt')
      console.error('Failed to update category:', err)
    }
  }

  // Handle delete category
  const handleDeleteCategory = async (category: Category) => {
    if (category.is_system) {
      setError('Systeemcategorieën kunnen niet worden verwijderd')
      return
    }

    if (window.confirm(`Weet je zeker dat je "${category.name}" wilt verwijderen?`)) {
      try {
        await categoriesApi.delete(category.id)
        setCategories(categories.filter(cat => cat.id !== category.id))
        setSuccess('Categorie succesvol verwijderd')
      } catch (err) {
        setError('Categorie verwijderen mislukt')
        console.error('Failed to delete category:', err)
      }
    }
  }

  // Start editing category
  const startEditCategory = (category: Category) => {
    if (category.is_system) {
      setError('Systeemcategorieën kunnen niet worden bewerkt')
      return
    }

    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon,
      parent_id: category.parent_id,
      budget_percentage: category.budget_percentage,
    })
    setIsEditDialogOpen(true)
  }

  // Close dialogs
  const closeDialogs = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setEditingCategory(null)
    resetFormData()
    setError(null)
  }

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
        Categorieën
      </Typography>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Zoek categorieën..."
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
              <Button
                variant={showSystemCategories ? "contained" : "outlined"}
                onClick={() => setShowSystemCategories(!showSystemCategories)}
                startIcon={<FilterIcon />}
                sx={{ minWidth: { xs: '100%', md: 'auto' } }}
              >
                {showSystemCategories ? 'Verberg' : 'Toon'} Systeem
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsCreateDialogOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  minWidth: { xs: '100%', md: 'auto' },
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                }}
              >
                Nieuwe Categorie
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Categories List */}
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            Categorieën laden...
          </Typography>
        ) : filteredCategories.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            {searchTerm ? 'Geen categorieën gevonden voor je zoekopdracht' : 'Geen categorieën beschikbaar'}
          </Typography>
        ) : (
          <List>
            {filteredCategories.map((category, index) => (
              <React.Fragment key={category.id}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 2,
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8),
                    border: `2px solid ${alpha(category.color, 0.3)}`,
                    '&:hover': {
                      backgroundColor: alpha(category.color, 0.1),
                      borderColor: alpha(category.color, 0.5),
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 60 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: category.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: `0 2px 8px ${alpha(category.color, 0.3)}`,
                      }}
                    >
                      {category.icon}
                    </Box>
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {category.name}
                        </Typography>
                        {category.is_system && (
                          <Chip
                            label="Systeem"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      category.description && (
                        <Typography variant="body2" color="text.secondary">
                          {category.description}
                        </Typography>
                      )
                    }
                  />

                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Bewerk categorie">
                        <IconButton
                          onClick={() => startEditCategory(category)}
                          disabled={category.is_system}
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Verwijder categorie">
                        <IconButton
                          onClick={() => handleDeleteCategory(category)}
                          disabled={category.is_system}
                          sx={{
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < filteredCategories.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateDialogOpen || isEditDialogOpen}
        onClose={closeDialogs}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {isEditDialogOpen ? 'Categorie Bewerken' : 'Nieuwe Categorie'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Categorie Naam"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                margin="normal"
                required
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />

              <TextField
                fullWidth
                label="Beschrijving"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                sx={{ '& .MuiInputBase-input': { py: 1.5 } }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              {/* Color Picker */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Kleur
              </Typography>
              <Grid container spacing={1} sx={{ mb: 3 }}>
                {CATEGORY_COLORS.map((color) => (
                  <Grid item key={color}>
                    <IconButton
                      onClick={() => setFormData({ ...formData, color })}
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: color,
                        border: formData.color === color ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Icon Picker */}
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Icoon
              </Typography>
              <Grid container spacing={1}>
                {CATEGORY_ICONS.map((icon) => (
                  <Grid item key={icon}>
                    <IconButton
                      onClick={() => setFormData({ ...formData, icon })}
                      sx={{
                        width: 40,
                        height: 40,
                        border: formData.icon === icon ? `3px solid ${theme.palette.primary.main}` : '2px solid transparent',
                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          transform: 'scale(1.1)',
                        },
                        fontSize: '1.2rem',
                      }}
                    >
                      {icon}
                    </IconButton>
                  </Grid>
                ))}
              </Grid>
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
            onClick={isEditDialogOpen ? handleUpdateCategory : handleCreateCategory}
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

export default Categories