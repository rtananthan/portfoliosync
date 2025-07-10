import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  test('renders error message with title and message', () => {
    render(
      <ErrorMessage
        title="Test Error"
        message="This is a test error message"
        onClose={() => {}}
      />
    )

    expect(screen.getByText('Test Error')).toBeInTheDocument()
    expect(screen.getByText('This is a test error message')).toBeInTheDocument()
  })

  test('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    
    render(
      <ErrorMessage
        title="Test Error"
        message="This is a test error message"
        onClose={onClose}
      />
    )

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('renders action button when provided', () => {
    const onAction = vi.fn()
    
    render(
      <ErrorMessage
        title="Test Error"
        message="This is a test error message"
        onClose={() => {}}
        actionLabel="Retry"
        onAction={onAction}
      />
    )

    const actionButton = screen.getByRole('button', { name: /retry/i })
    expect(actionButton).toBeInTheDocument()
    
    fireEvent.click(actionButton)
    expect(onAction).toHaveBeenCalledTimes(1)
  })
})