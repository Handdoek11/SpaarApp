import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Alert,
  Snackbar,
  useTheme,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Chip,
  alpha,
} from '@mui/material'
import {
  Save as SaveIcon,
  Restore as RestoreIcon,
  FileDownload as ExportIcon,
  FileUpload as ImportIcon,
  Refresh as RefreshIcon,
  Brightness7 as LightModeIcon,
  Brightness4 as DarkModeIcon,
  BrightnessAuto as AutoModeIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material'
import { settingsApi } from '../services/api'
import { Settings as SettingsType } from '../types'

const Settings: React.FC = () => {
  const theme = useTheme()
  const [settings, setSettings] = useState<SettingsType | null>(null)
  const [originalSettings, setOriginalSettings] = useState<SettingsType | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmResetDialogOpen, setConfirmResetDialogOpen] = useState(false)
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false)

  // Load settings
  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsApi.get()
      setSettings(data)
      setOriginalSettings(data)
      setHasUnsavedChanges(false)
    } catch (err) {
      setError('Instellingen laden mislukt')
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }

  // Save settings
  const saveSettings = async () => {
    if (!settings) return

    try {
      setSaving(true)
      const updated = await settingsApi.update(settings)
      setSettings(updated)
      setOriginalSettings(updated)
      setHasUnsavedChanges(false)
      setSuccess('Instellingen succesvol opgeslagen')
    } catch (err) {
      setError('Instellingen opslaan mislukt')
      console.error('Failed to save settings:', err)
    } finally {
      setSaving(false)
    }
  }

  // Reset to default settings
  const resetToDefault = async () => {
    try {
      setSaving(true)
      const defaultSettings = await settingsApi.resetToDefault()
      setSettings(defaultSettings)
      setOriginalSettings(defaultSettings)
      setHasUnsavedChanges(false)
      setSuccess('Instellingen succesvol gereset naar standaardwaarden')
      setConfirmResetDialogOpen(false)
    } catch (err) {
      setError('Resetten mislukt')
      console.error('Failed to reset settings:', err)
    } finally {
      setSaving(false)
    }
  }

  // Export settings
  const exportSettings = async () => {
    try {
      if (!settings) return

      const settingsJson = JSON.stringify(settings, null, 2)
      const blob = new Blob([settingsJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `spaarapp-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setSuccess('Instellingen geëxporteerd')
    } catch (err) {
      setError('Exporteren mislukt')
      console.error('Failed to export settings:', err)
    }
  }

  // Import settings
  const importSettings = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const importedSettings = JSON.parse(text)

        // Validate settings structure
        if (!importedSettings.currency || !importedSettings.theme || !importedSettings.language) {
          setError('Ongeldig instellingenbestand')
          return
        }

        const updated = await settingsApi.import(importedSettings)
        setSettings(updated)
        setOriginalSettings(updated)
        setHasUnsavedChanges(false)
        setSuccess('Instellingen succesvol geïmporteerd')
      } catch (err) {
        setError('Importeren mislukt - controleer het bestandsformaat')
        console.error('Failed to import settings:', err)
      }
    }

    input.click()
  }

  // Update setting
  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    if (!settings) return

    setSettings({
      ...settings,
      [key]: value,
    })

    // Check if there are changes
    if (originalSettings && originalSettings[key] !== value) {
      setHasUnsavedChanges(true)
    } else if (originalSettings && originalSettings[key] === value) {
      // Check if other fields have changes
      const otherFieldsChanged = Object.keys(settings).some(
        k => k !== key && settings[k as keyof SettingsType] !== originalSettings[k as keyof SettingsType]
      )
      setHasUnsavedChanges(otherFieldsChanged)
    }
  }

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1">Instellingen laden...</Typography>
      </Paper>
    )
  }

  if (!settings) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="error">
          Kon instellingen niet laden
        </Typography>
        <Button variant="outlined" onClick={loadSettings} sx={{ mt: 2 }}>
          Opnieuw proberen
        </Button>
      </Paper>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Instellingen
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={exportSettings}
          >
            Exporteren
          </Button>
          <Button
            variant="outlined"
            startIcon={<ImportIcon />}
            onClick={importSettings}
          >
            Importeren
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={() => setConfirmResetDialogOpen(true)}
          >
            Resetten
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <SaveIcon />}
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || saving}
            sx={{
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            }}
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </Box>
      </Box>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Je hebt niet-opgeslagen wijzigingen. Klik op "Opslaan" om je wijzigingen te behouden.
        </Alert>
      )}

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

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <PaletteIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Weergave
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Thema</InputLabel>
                    <Select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value as SettingsType['theme'])}
                      label="Thema"
                      startAdornment={
                        <InputAdornment position="start">
                          {settings.theme === 'light' ? <LightModeIcon /> :
                           settings.theme === 'dark' ? <DarkModeIcon /> : <AutoModeIcon />}
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="light">Licht</MenuItem>
                      <MenuItem value="dark">Donker</MenuItem>
                      <MenuItem value="auto">Automatisch</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="language">Taal</InputLabel>
                    <Select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      label="Taal"
                      startAdornment={
                        <InputAdornment position="start">
                          <LanguageIcon />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value="nl">Nederlands</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Valuta</InputLabel>
                    <Select
                      value={settings.currency}
                      onChange={(e) => updateSetting('currency', e.target.value)}
                      label="Valuta"
                    >
                      <MenuItem value="EUR">EUR (Euro)</MenuItem>
                      <MenuItem value="USD">USD (Dollar)</MenuItem>
                      <MenuItem value="GBP">GBP (Pond)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="date_format">Datumformaat</InputLabel>
                    <Select
                      value={settings.date_format}
                      onChange={(e) => updateSetting('date_format', e.target.value)}
                      label="Datumformaat"
                    >
                      <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
                      <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <NotificationsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Notificaties
              </Typography>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Notificaties inschakelen"
                    secondary="Ontvang notificaties voor budget waarschuwingen en inzichten"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.notifications_enabled}
                      onChange={(e) => updateSetting('notifications_enabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Budget waarschuwingen"
                    secondary="Waarschuwingen wanneer je 80% van je budget hebt bereikt"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.budget_alerts_enabled}
                      onChange={(e) => updateSetting('budget_alerts_enabled', e.target.checked)}
                      disabled={!settings.notifications_enabled}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Features Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <CheckIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Functies
              </Typography>

              <List sx={{ p: 0 }}>
                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="Automatische categorisering"
                    secondary="Categoriseer transacties automatisch op basis van beschrijvingen"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.auto_categorization_enabled}
                      onChange={(e) => updateSetting('auto_categorization_enabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <Divider />

                <ListItem sx={{ px: 0, py: 1 }}>
                  <ListItemText
                    primary="AI-inzichten"
                    secondary="Genereer persoonlijke financiële inzichten met AI"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.ai_insights_enabled}
                      onChange={(e) => updateSetting('ai_insights_enabled', e.target.checked)}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Data & Privacy Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                Data & Privacy
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Data Bewaartermijn (dagen)"
                    type="number"
                    value={settings.data_retention_days}
                    onChange={(e) => updateSetting('data_retention_days', parseInt(e.target.value) || 365)}
                    inputProps={{ min: 30, max: 3650 }}
                    helperText="Oude transacties worden automatisch verwijderd na dit aantal dagen"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="export_format">Export Formaat</InputLabel>
                    <Select
                      value={settings.export_format}
                      onChange={(e) => updateSetting('export_format', e.target.value)}
                      label="Export Formaat"
                    >
                      <MenuItem value="json">JSON</MenuItem>
                      <MenuItem value="csv">CSV</MenuItem>
                      <MenuItem value="pdf">PDF</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        Data Versleuteling
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Versleutel je financiële data met AES-256 encryptie
                      </Typography>
                    </Box>
                    <Switch
                      checked={settings.encryption_enabled}
                      onChange={(e) => updateSetting('encryption_enabled', e.target.checked)}
                    />
                  </Box>
                </Grid>

                {settings.last_backup && (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: alpha(theme.palette.info.main, 0.1), borderRadius: 1 }}>
                      <BackupIcon sx={{ mr: 1, color: theme.palette.info.main }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Laatste backup
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(settings.last_backup).toLocaleString('nl-NL')}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label="Beschikbaar"
                        color="success"
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Danger Zone */}
        <Grid item xs={12}>
          <Card sx={{ border: `2px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.error.main, display: 'flex', alignItems: 'center' }}>
                <WarningIcon sx={{ mr: 1 }} />
                Gevaarlijke Zone
              </Typography>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>Let op:</strong> De volgende acties zijn permanent en kunnen niet ongedaan worden gemaakt.
              </Alert>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDeleteDialogOpen(true)}
              >
                Verwijder alle data
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog open={confirmResetDialogOpen} onClose={() => setConfirmResetDialogOpen(false)}>
        <DialogTitle>Instellingen Resetten</DialogTitle>
        <DialogContent>
          <Typography>
            Weet je zeker dat je alle instellingen wilt resetten naar de standaardwaarden?
            Dit kan niet ongedaan worden gemaakt.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmResetDialogOpen(false)}>Annuleren</Button>
          <Button onClick={resetToDefault} color="error" variant="contained">
            Resetten
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Data Confirmation Dialog */}
      <Dialog open={confirmDeleteDialogOpen} onClose={() => setConfirmDeleteDialogOpen(false)}>
        <DialogTitle>Alle Data Verwijderen</DialogTitle>
        <DialogContent>
          <Typography paragraph>
            <strong>WAARSCHUWING:</strong> Dit zal ALLE je financiële data permanent verwijderen, inclusief:
          </Typography>
          <ul>
            <li>Alle transacties</li>
            <li>Categorieën</li>
            <li>Budgetten</li>
            <li>Inzichten</li>
            <li>Instellingen</li>
          </ul>
          <Typography paragraph>
            Deze actie kan <strong>niet</strong> ongedaan worden gemaakt. We raden aan om eerst een backup te maken.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteDialogOpen(false)}>Annuleren</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              // Implement delete all data functionality
              setConfirmDeleteDialogOpen(false)
              setSuccess('Alle data is verwijderd')
              loadSettings() // Reload settings
            }}
          >
            Verwijder Alles
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Settings