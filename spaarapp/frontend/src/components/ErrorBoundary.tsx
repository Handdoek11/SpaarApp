import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
}

const ErrorContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: theme.spacing(4),
  margin: theme.spacing(2),
  textAlign: 'center',
  backgroundColor: theme.palette.error.light,
  color: theme.palette.error.contrastText,
  borderRadius: theme.shape.borderRadius,
}))

const ErrorIcon = styled('div')(({ theme }) => ({
  fontSize: '4rem',
  marginBottom: theme.spacing(2),
  color: theme.palette.error.main,
}))

class ErrorBoundary extends Component<Props, State> {
  private maxRetries = 3

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // Log error to service (in production)
    if (import.meta.env.PROD) {
      // TODO: Implement error logging service
      this.logErrorToService(error, errorInfo)
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, you would send this to an error tracking service
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      console.error('Error logged:', errorData)

      // Send to error service (e.g., Sentry, LogRocket)
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData),
      // })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  private handleRetry = () => {
    const { retryCount } = this.state

    if (retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state
      const { fallback } = this.props

      // Custom fallback component
      if (fallback) {
        return fallback
      }

      return (
        <ErrorContainer elevation={3} role="alert" aria-live="assertive">
          <ErrorIcon>⚠️</ErrorIcon>

          <Typography variant="h4" component="h1" gutterBottom>
            Er is iets misgegaan
          </Typography>

          <Typography variant="body1" paragraph>
            SpaarApp heeft een onverwachte fout ondervonden. We zijn op de hoogte gebracht
            van dit probleem en werken aan een oplossing.
          </Typography>

          {import.meta.env.DEV && error && (
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                padding: 2,
                borderRadius: 1,
                margin: 2,
                textAlign: 'left',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxWidth: '100%',
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Development Error Details:
              </Typography>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                <strong>Error:</strong> {error.toString()}
                {'\n\n'}
                <strong>Stack:</strong> {error.stack}
                {'\n\n'}
                {errorInfo && (
                  <>
                    <strong>Component Stack:</strong> {errorInfo.componentStack}
                  </>
                )}
              </pre>
            </Box>
          )}

          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            {retryCount < this.maxRetries && (
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleRetry}
                sx={{ minWidth: 120 }}
              >
                Opnieuw Proberen ({this.maxRetries - retryCount} over)
              </Button>
            )}

            <Button
              variant="outlined"
              color="primary"
              onClick={this.handleGoHome}
              sx={{ minWidth: 120 }}
            >
              Naar Home
            </Button>

            <Button
              variant="text"
              color="primary"
              onClick={this.handleReload}
              sx={{ minWidth: 120 }}
            >
              Herstart App
            </Button>
          </Box>

          {retryCount >= this.maxRetries && (
            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
              Maximum aantal pogingen bereikt. Herstart de applicatie om het probleem op te lossen.
            </Typography>
          )}

          {/* Accessibility information */}
          <Box sx={{ mt: 2, fontSize: '0.875rem', opacity: 0.7 }}>
            <Typography variant="body2">
              Foutcode: {error?.name || 'Unknown'}
            </Typography>
            <Typography variant="body2">
              Tijdstip: {new Date().toLocaleString('nl-NL')}
            </Typography>
          </Box>
        </ErrorContainer>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary