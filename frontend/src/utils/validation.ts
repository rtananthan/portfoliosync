export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => string | null
}

export interface ValidationError {
  field: string
  message: string
}

export class FormValidator {
  private errors: ValidationError[] = []

  validate(value: any, fieldName: string, rules: ValidationRule): string | null {
    // Required validation
    if (rules.required && (value === null || value === undefined || value === '')) {
      return `${fieldName} is required`
    }

    // Skip other validations if field is empty and not required
    if (!rules.required && (value === null || value === undefined || value === '')) {
      return null
    }

    // Numeric validations
    if (typeof value === 'number' || !isNaN(parseFloat(value))) {
      const numValue = typeof value === 'number' ? value : parseFloat(value)
      
      if (rules.min !== undefined && numValue < rules.min) {
        return `${fieldName} must be at least ${rules.min}`
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        return `${fieldName} must not exceed ${rules.max}`
      }
    }

    // String length validations
    if (typeof value === 'string') {
      if (rules.minLength !== undefined && value.length < rules.minLength) {
        return `${fieldName} must be at least ${rules.minLength} characters long`
      }
      
      if (rules.maxLength !== undefined && value.length > rules.maxLength) {
        return `${fieldName} must not exceed ${rules.maxLength} characters`
      }
      
      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        return `${fieldName} format is invalid`
      }
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value)
      if (customError) {
        return customError
      }
    }

    return null
  }

  validateField(value: any, fieldName: string, rules: ValidationRule): boolean {
    const error = this.validate(value, fieldName, rules)
    
    // Remove existing error for this field
    this.errors = this.errors.filter(e => e.field !== fieldName)
    
    // Add new error if validation failed
    if (error) {
      this.errors.push({ field: fieldName, message: error })
      return false
    }
    
    return true
  }

  validateForm(formData: Record<string, any>, validationRules: Record<string, ValidationRule>): boolean {
    this.errors = []
    
    for (const [fieldName, rules] of Object.entries(validationRules)) {
      const value = formData[fieldName]
      this.validateField(value, fieldName, rules)
    }
    
    return this.errors.length === 0
  }

  getErrors(): ValidationError[] {
    return this.errors
  }

  getFieldError(fieldName: string): string | null {
    const error = this.errors.find(e => e.field === fieldName)
    return error ? error.message : null
  }

  hasErrors(): boolean {
    return this.errors.length > 0
  }

  clearErrors(): void {
    this.errors = []
  }

  clearFieldError(fieldName: string): void {
    this.errors = this.errors.filter(e => e.field !== fieldName)
  }
}

// Common validation rules
export const commonValidations = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  stockSymbol: {
    pattern: /^[A-Z]{1,10}$/,
    message: 'Stock symbol must be 1-10 uppercase letters'
  },
  
  positiveNumber: {
    min: 0,
    custom: (value: any) => {
      const num = parseFloat(value)
      if (isNaN(num)) return 'Must be a valid number'
      if (num < 0) return 'Must be a positive number'
      return null
    }
  },
  
  positiveInteger: {
    min: 1,
    custom: (value: any) => {
      const num = parseInt(value)
      if (isNaN(num)) return 'Must be a valid number'
      if (num <= 0) return 'Must be a positive whole number'
      if (num !== parseFloat(value)) return 'Must be a whole number'
      return null
    }
  },
  
  currency: {
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Enter a valid currency amount (e.g., 100.50)'
  },
  
  percentage: {
    min: -100,
    max: 1000,
    custom: (value: any) => {
      const num = parseFloat(value)
      if (isNaN(num)) return 'Must be a valid percentage'
      return null
    }
  },
  
  date: {
    custom: (value: any) => {
      if (!value) return null
      const date = new Date(value)
      if (isNaN(date.getTime())) return 'Please enter a valid date'
      if (date > new Date()) return 'Date cannot be in the future'
      return null
    }
  },
  
  address: {
    minLength: 5,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s,.-]+$/,
    message: 'Please enter a valid address'
  }
}

// Helper function to sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential XSS characters
    .replace(/\s+/g, ' ') // Collapse multiple spaces
}

// Helper function to validate and sanitize form data
export function validateAndSanitize(
  formData: Record<string, any>, 
  validationRules: Record<string, ValidationRule>
): { isValid: boolean; errors: ValidationError[]; sanitizedData: Record<string, any> } {
  const validator = new FormValidator()
  const sanitizedData: Record<string, any> = {}
  
  // Sanitize string inputs
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitizedData[key] = sanitizeInput(value)
    } else {
      sanitizedData[key] = value
    }
  }
  
  // Validate sanitized data
  const isValid = validator.validateForm(sanitizedData, validationRules)
  
  return {
    isValid,
    errors: validator.getErrors(),
    sanitizedData
  }
}