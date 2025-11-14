import React, { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

// Import components
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Transactions from './components/TransactionsMui'
import Categories from './components/Categories'
import Budgets from './components/Budgets'
import Insights from './components/Insights'
import Settings from './components/Settings'
import LoadingScreen from './components/LoadingScreen'
import ErrorBoundary from './components/ErrorBoundary'

// Import Tauri for desktop features
import { invoke } from '@tauri-apps/api/core'
import { isTauri } from './utils/tauri'

// Styled components
const AppContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
}))

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}))

// Loading component for Suspense fallback
const RouteLoading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
    role="status"
    aria-label="Pagina wordt geladen"
  >
    <CircularProgress size={40} aria-label="Laden" />
  </Box>
)

// App component with routing and layout
const App: React.FC = () => {
  // Check if running in Tauri (desktop) environment
  const isDesktop = isTauri()

  React.useEffect(() => {
    // Initialize app-specific features
    const initializeApp = async () => {
      try {
        // Get app info if running in Tauri
        if (isDesktop) {
          const appInfo = await invoke<any>('get_app_info')
          console.log('SpaarApp initialized:', appInfo)
        }

        // Set document title and meta
        document.title = 'SpaarApp - ADHD-Friendly Financial Management'

        // Add keyboard navigation support
        const handleKeyDown = (event: KeyboardEvent) => {
          // Ctrl/Cmd + K for quick search (accessibility feature)
          if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault()
            // TODO: Implement quick search
            console.log('Quick search triggered')
          }

          // Escape key to close modals
          if (event.key === 'Escape') {
            // TODO: Implement modal closing
            console.log('Escape key pressed')
          }
        }

        document.addEventListener('keydown', handleKeyDown)

        // Add accessibility improvements
        document.body.setAttribute('data-app-initialized', 'true')

        return () => {
          document.removeEventListener('keydown', handleKeyDown)
        }
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    initializeApp()
  }, [isDesktop])

  return (
    <ErrorBoundary>
      <AppContainer>
        <MainContent>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Default redirect to dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Main routes */}
                <Route
                  path="dashboard"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Dashboard />
                    </Suspense>
                  }
                />

                <Route
                  path="transactions"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Transactions />
                    </Suspense>
                  }
                />

                <Route
                  path="categories"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Categories />
                    </Suspense>
                  }
                />

                <Route
                  path="budgets"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Budgets />
                    </Suspense>
                  }
                />

                <Route
                  path="insights"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Insights />
                    </Suspense>
                  }
                />

                <Route
                  path="settings"
                  element={
                    <Suspense fallback={<RouteLoading />}>
                      <Settings />
                    </Suspense>
                  }
                />

                {/* Catch all route - redirect to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Suspense>
        </MainContent>
      </AppContainer>
    </ErrorBoundary>
  )
}

export default App
