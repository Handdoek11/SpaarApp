/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
  readonly BASE_URL: string
  // Add any other environment variables you're using
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}