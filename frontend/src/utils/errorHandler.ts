// User-friendly error messages for common scenarios
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  API_ERROR: 'There was a problem with the server. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested information could not be found.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  MARKET_DATA_ERROR: 'Unable to fetch current market data. Displaying cached prices.',
  DELETE_ERROR: 'Failed to delete the item. Please try again.',
  UPDATE_ERROR: 'Failed to update the item. Please try again.',
  CREATE_ERROR: 'Failed to create the item. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
}

interface ErrorDetails {
  title: string
  message: string
  canRetry: boolean
  isCritical: boolean
}

export function parseError(error: any): ErrorDetails {
  // If it's already a structured error
  if (error?.title && error?.message) {
    return {
      title: error.title,
      message: error.message,
      canRetry: error.canRetry ?? true,
      isCritical: error.isCritical ?? false
    }
  }

  // Network errors
  if (!navigator.onLine) {
    return {
      title: 'Connection Error',
      message: 'You appear to be offline. Please check your internet connection.',
      canRetry: true,
      isCritical: false
    }
  }

  // API response errors
  if (error?.response) {
    const status = error.response.status
    
    switch (status) {
      case 400:
        return {
          title: 'Invalid Request',
          message: error.response.data?.message || ERROR_MESSAGES.VALIDATION_ERROR,
          canRetry: false,
          isCritical: false
        }
      case 401:
        return {
          title: 'Authentication Required',
          message: ERROR_MESSAGES.UNAUTHORIZED,
          canRetry: false,
          isCritical: true
        }
      case 403:
        return {
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          canRetry: false,
          isCritical: false
        }
      case 404:
        return {
          title: 'Not Found',
          message: ERROR_MESSAGES.NOT_FOUND,
          canRetry: false,
          isCritical: false
        }
      case 429:
        return {
          title: 'Rate Limited',
          message: ERROR_MESSAGES.RATE_LIMITED,
          canRetry: true,
          isCritical: false
        }
      case 500:
        return {
          title: 'Server Error',
          message: 'The server encountered an error. Our team has been notified.',
          canRetry: true,
          isCritical: false
        }
      default:
        return {
          title: 'Request Failed',
          message: error.response.data?.message || ERROR_MESSAGES.API_ERROR,
          canRetry: true,
          isCritical: false
        }
    }
  }

  // Network/fetch errors
  if (error?.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      title: 'Connection Error',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      canRetry: true,
      isCritical: false
    }
  }

  // Timeout errors
  if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long to complete. Please try again.',
      canRetry: true,
      isCritical: false
    }
  }

  // Market data specific errors
  if (error?.message?.includes('market data') || error?.message?.includes('price')) {
    return {
      title: 'Market Data Unavailable',
      message: ERROR_MESSAGES.MARKET_DATA_ERROR,
      canRetry: true,
      isCritical: false
    }
  }

  // Default fallback
  const message = error?.message || ERROR_MESSAGES.UNKNOWN_ERROR
  return {
    title: 'Error',
    message: message.length > 100 ? ERROR_MESSAGES.UNKNOWN_ERROR : message,
    canRetry: true,
    isCritical: false
  }
}

// Helper to log errors for debugging while showing user-friendly messages
export function logError(error: any, context?: string) {
  const errorInfo = {
    message: error?.message,
    stack: error?.stack,
    response: error?.response?.data,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  // In development, show detailed errors
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', errorInfo)
  } else {
    // In production, log to console with minimal info
    console.error('Error occurred:', { context, timestamp: errorInfo.timestamp })
  }
  
  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // errorTrackingService.logError(errorInfo)
}