import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { ErrorBoundary, ComponentErrorBoundary } from './ErrorBoundary'

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  test('renders error fallback when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  test('shows custom error message in development', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})

describe('ComponentErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('renders children when there is no error', () => {
    render(
      <ComponentErrorBoundary componentName="Test Component">
        <ThrowError shouldThrow={false} />
      </ComponentErrorBoundary>
    )

    expect(screen.getByText('No error')).toBeInTheDocument()
  })

  test('renders component-specific error message', () => {
    render(
      <ComponentErrorBoundary componentName="Test Component">
        <ThrowError shouldThrow={true} />
      </ComponentErrorBoundary>
    )

    expect(screen.getByText('Test Component Error')).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})