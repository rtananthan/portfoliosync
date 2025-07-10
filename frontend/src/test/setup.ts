import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock fetch for API tests
global.fetch = vi.fn()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
})

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
})

// Mock environment variables for tests
vi.mock('../config/env', () => ({
  default: {
    APP_ENV: 'test',
    API_BASE_URL: 'http://localhost:3000/api',
    APP_NAME: 'PortfolioSync',
    APP_VERSION: '1.0.0',
    ENABLE_ANALYTICS: false,
    ENABLE_BENCHMARKING: true,
    ENABLE_EXPORT: true,
    BUILD_SOURCEMAP: false,
    BUILD_MINIFY: false,
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isTest: () => true,
  features: {
    analytics: false,
    benchmarking: true,
    export: true,
  },
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 5000,
    retries: 2,
  },
}))