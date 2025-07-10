// Environment configuration with validation and type safety

interface AppConfig {
  APP_ENV: 'development' | 'production' | 'test'
  API_BASE_URL: string
  APP_NAME: string
  APP_VERSION: string
  ENABLE_ANALYTICS: boolean
  ENABLE_BENCHMARKING: boolean
  ENABLE_EXPORT: boolean
  DEV_PORT?: number
  DEV_OPEN_BROWSER?: boolean
  SENTRY_DSN?: string
  SENTRY_ENVIRONMENT?: string
  GA_TRACKING_ID?: string
  BUILD_SOURCEMAP: boolean
  BUILD_MINIFY: boolean
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = (import.meta as any).env?.[key]
  if (value !== undefined) {
    return value
  }
  if (defaultValue !== undefined) {
    return defaultValue
  }
  throw new Error(`Environment variable ${key} is required but not set`)
}

function getBooleanEnvVar(key: string, defaultValue: boolean = false): boolean {
  const value = (import.meta as any).env?.[key]
  if (value === undefined) {
    return defaultValue
  }
  return value === 'true'
}

function getNumberEnvVar(key: string, defaultValue?: number): number | undefined {
  const value = (import.meta as any).env?.[key]
  if (value === undefined) {
    return defaultValue
  }
  const parsed = parseInt(value, 10)
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, got: ${value}`)
  }
  return parsed
}

// Validate and create configuration
const config: AppConfig = {
  APP_ENV: getEnvVar('VITE_APP_ENV', 'development') as 'development' | 'production' | 'test',
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'PortfolioSync'),
  APP_VERSION: getEnvVar('VITE_APP_VERSION', '1.0.0'),
  ENABLE_ANALYTICS: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', true),
  ENABLE_BENCHMARKING: getBooleanEnvVar('VITE_ENABLE_BENCHMARKING', true),
  ENABLE_EXPORT: getBooleanEnvVar('VITE_ENABLE_EXPORT', true),
  DEV_PORT: getNumberEnvVar('VITE_DEV_PORT', 3000),
  DEV_OPEN_BROWSER: getBooleanEnvVar('VITE_DEV_OPEN_BROWSER', true),
  SENTRY_DSN: getEnvVar('VITE_SENTRY_DSN', ''),
  SENTRY_ENVIRONMENT: getEnvVar('VITE_SENTRY_ENVIRONMENT', 'development'),
  GA_TRACKING_ID: getEnvVar('VITE_GA_TRACKING_ID', ''),
  BUILD_SOURCEMAP: getBooleanEnvVar('VITE_BUILD_SOURCEMAP', false),
  BUILD_MINIFY: getBooleanEnvVar('VITE_BUILD_MINIFY', true),
}

// Validate required configurations
if (!config.API_BASE_URL) {
  throw new Error('API_BASE_URL is required')
}

// Log configuration in development
if (config.APP_ENV === 'development') {
  console.log('App Configuration:', {
    ...config,
    SENTRY_DSN: config.SENTRY_DSN ? '[REDACTED]' : undefined,
    GA_TRACKING_ID: config.GA_TRACKING_ID ? '[REDACTED]' : undefined,
  })
}

export default config

// Helper functions for common use cases
export const isDevelopment = () => config.APP_ENV === 'development'
export const isProduction = () => config.APP_ENV === 'production'
export const isTest = () => config.APP_ENV === 'test'

// Feature flags
export const features = {
  analytics: config.ENABLE_ANALYTICS,
  benchmarking: config.ENABLE_BENCHMARKING,
  export: config.ENABLE_EXPORT,
} as const

// API configuration
export const api = {
  baseUrl: config.API_BASE_URL,
  timeout: 30000, // 30 seconds
  retries: 3,
} as const

// Build information
export const buildInfo = {
  version: config.APP_VERSION,
  environment: config.APP_ENV,
  buildTime: new Date().toISOString(),
} as const