import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Development server configuration
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
    open: false, // Don't open browser automatically for ADHD users
    cors: true,
  },

  // Build configuration
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true, // Helpful for debugging
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: import.meta.env.PROD, // Remove console logs in production
        drop_debugger: import.meta.env.PROD,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'spaarapp/frontend/index.html'),
      },
      output: {
        manualChunks: {
          // Split vendor dependencies for better caching
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom'],
          charts: ['recharts'],
          utils: ['dayjs', 'uuid', 'axios'],
        },
      },
    },
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': resolve(__dirname, 'spaarapp/frontend/src'),
      '@components': resolve(__dirname, 'spaarapp/frontend/src/components'),
      '@utils': resolve(__dirname, 'spaarapp/frontend/src/utils'),
      '@types': resolve(__dirname, 'spaarapp/frontend/src/types'),
    },
  },

  // CSS configuration
  css: {
    devSourcemap: true,
  },

  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // Environment variables configuration
  envPrefix: 'VITE_',

  // Optimized dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@mui/x-charts',
      '@mui/x-date-pickers',
      '@emotion/react',
      '@emotion/styled',
      'dayjs',
      'recharts',
      'react-hook-form',
      '@hookform/resolvers',
      'yup',
      'zustand',
      'axios',
      'react-query',
      'react-hot-toast',
      'framer-motion',
      'react-beautiful-dnd',
      'react-dropzone',
      'papaparse',
      'file-saver',
      'uuid',
    ],
    exclude: ['@tauri-apps/api'],
  },

  // Worker configuration for heavy computations
  worker: {
    format: 'es',
  },

  // Preview configuration for production builds
  preview: {
    port: 4173,
    host: 'localhost',
  },
})