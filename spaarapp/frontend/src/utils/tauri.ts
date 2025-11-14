/**
 * Tauri utility functions for detecting and interacting with the desktop environment
 */

/**
 * Check if the app is running in Tauri (desktop) environment
 */
export const isTauri = (): boolean => {
  try {
    return typeof window !== 'undefined' && '__TAURI__' in window
  } catch {
    return false
  }
}

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  try {
    return import.meta.env.DEV
  } catch {
    return false
  }
}

/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => {
  try {
    return import.meta.env.PROD
  } catch {
    return false
  }
}

/**
 * Get the app version
 */
export const getAppVersion = async (): Promise<string> => {
  if (!isTauri()) {
    return 'web-version'
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return await invoke<string>('get_version')
  } catch (error) {
    console.error('Failed to get app version:', error)
    return 'unknown'
  }
}

/**
 * Get platform information
 */
export const getPlatform = async (): Promise<string> => {
  if (!isTauri()) {
    return 'web'
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return await invoke<string>('get_platform')
  } catch (error) {
    console.error('Failed to get platform info:', error)
    return 'unknown'
  }
}

/**
 * Check if file operations are available
 */
export const hasFileSystemAccess = (): boolean => {
  return isTauri()
}

/**
 * Safe invoke function that works in both Tauri and web environments
 */
export const safeInvoke = async <T>(
  command: string,
  args?: any
): Promise<T | null> => {
  if (!isTauri()) {
    console.warn(`Tauri command '${command}' called in web environment`)
    return null
  }

  try {
    const { invoke } = await import('@tauri-apps/api/core')
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`Failed to invoke Tauri command '${command}':`, error)
    return null
  }
}