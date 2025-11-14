import React from 'react'
import { Box, CircularProgress, Typography, Paper } from '@mui/material'
import { styled, keyframes } from '@mui/material/styles'

interface LoadingScreenProps {
  message?: string
  submessage?: string
  size?: number
  showLogo?: boolean
}

// Subtle animation for ADHD users (not too distracting)
const pulse = keyframes`
  0%, 100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
`

const LoadingContainer = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  borderRadius: 0,
  boxShadow: 'none',
}))

const LogoContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  animation: `${pulse} 2s ease-in-out infinite`,
}))

const Logo = styled('div')(({ theme }) => ({
  width: 80,
  height: 80,
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
}))

const LoadingContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(2),
  textAlign: 'center',
  maxWidth: 400,
}))

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&.MuiCircularProgress-indeterminate': {
    animationDuration: '1.5s', // Slightly slower for ADHD users
  },
}))

const LoadingTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(1),
}))

const LoadingMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.5,
  fontSize: '1rem',
}))

const LoadingSubMessage = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontSize: '0.875rem',
  fontStyle: 'italic',
}))

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'SpaarApp wordt geladen...',
  submessage = 'Een moment geduld terwijl we uw financiële dashboard voorbereiden.',
  size = 40,
  showLogo = true,
}) => {
  return (
    <LoadingContainer role="status" aria-label="Applicatie wordt geladen">
      {showLogo && (
        <LogoContainer>
          <Logo>💰</Logo>
          <Typography variant="h5" component="div" fontWeight="600">
            SpaarApp
          </Typography>
        </LogoContainer>
      )}

      <LoadingContent>
        <LoadingSpinner
          size={size}
          thickness={4}
          aria-hidden="true"
        />

        <LoadingTitle variant="h6" component="h2">
          {message}
        </LoadingTitle>

        <LoadingMessage variant="body1">
          {submessage}
        </LoadingMessage>

        {/* Progress indicator for accessibility */}
        <div
          role="progressbar"
          aria-valuetext="Laden..."
          aria-busy="true"
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
        >
          Bezig met laden van SpaarApp...
        </div>

        {/* Loading tips for ADHD users */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: 'rgba(33, 150, 243, 0.08)', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            💡 Tip: U kuntCtrl+K gebruiken voor snelle zoekopdrachten zodra de app geladen is.
          </Typography>
        </Box>
      </LoadingContent>
    </LoadingContainer>
  )
}

export default LoadingScreen