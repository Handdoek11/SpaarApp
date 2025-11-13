// SpaarApp Component Template
// ADHD-friendly React component with accessibility and security best practices

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAccessibility } from '../hooks/useAccessibility';
import { useErrorHandler } from '../hooks/useErrorHandler';

// Props interface with TypeScript
interface {{ComponentName}}Props {
  // Define your props here
  title?: string;
  onData?: (data: any) => void;
  disabled?: boolean;
}

/**
 * {{ComponentName}} Component
 *
 * ADHD-friendly component that provides:
 * - Clear visual feedback
 * - Screen reader support
 * - Keyboard navigation
 * - Error handling
 * - Loading states
 */
export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  title = 'SpaarApp Component',
  onData,
  disabled = false,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Accessibility hooks
  const { announceToScreenReader, setFocus } = useAccessibility();
  const { handleError } = useErrorHandler();

  // Effects for accessibility announcements
  useEffect(() => {
    if (data) {
      announceToScreenReader(`${title} data geladen`);
    }
  }, [data, title, announceToScreenReader]);

  useEffect(() => {
    if (error) {
      announceToScreenReader(`Fout in ${title}: ${error}`);
    }
  }, [error, title, announceToScreenReader]);

  // Event handlers
  const handleAction = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Your async logic here
      const result = await yourAsyncFunction();

      setData(result);

      // Announce success
      announceToScreenReader(`${title} actie succesvol voltooid`);

      // Callback to parent
      if (onData) {
        onData(result);
      }
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      role="region"
      aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        backgroundColor: 'background.paper',
      }}
    >
      {/* Header with clear title */}
      <Typography
        id={`${title.toLowerCase().replace(/\s+/g, '-')}-title`}
        variant="h6"
        component="h2"
        gutterBottom
      >
        {title}
      </Typography>

      {/* Error display with clear messaging */}
      {error && (
        <Alert
          severity="error"
          onClose={() => setError(null)}
          sx={{ mb: 2 }}
          role="alert"
          aria-live="polite"
        >
          {error}
        </Alert>
      )}

      {/* Loading state with clear indication */}
      {isLoading ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          py={3}
          aria-label="Bezig met laden"
        >
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Bezig met laden...
          </Typography>
        </Box>
      ) : (
        /* Main content */
        <Box>
          {/* Your component content here */}

          {/* Action button with clear label */}
          <Button
            variant="contained"
            onClick={handleAction}
            disabled={disabled}
            sx={{ mt: 2 }}
            aria-label={`${title} actie uitvoeren`}
          >
            {data ? 'Opnieuw uitvoeren' : 'Uitvoeren'}
          </Button>
        </Box>
      )}

      {/* Success feedback */}
      {data && !isLoading && (
        <Alert
          severity="success"
          sx={{ mt: 2 }}
          role="status"
          aria-live="polite"
        >
          Actie succesvol voltooid!
        </Alert>
      )}
    </Box>
  );
};

// Example async function - replace with your actual logic
async function yourAsyncFunction(): Promise<any> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, timestamp: new Date().toISOString() };
}

export default {{ComponentName}};