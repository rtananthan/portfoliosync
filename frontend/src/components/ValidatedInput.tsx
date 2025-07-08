import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { ValidationRule, FormValidator } from '../utils/validation'

interface ValidatedInputProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'email' | 'date' | 'password'
  value: string | number
  onChange: (value: string | number) => void
  onValidation?: (fieldName: string, isValid: boolean, error?: string) => void
  validationRules?: ValidationRule
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  helpText?: string
}

export default function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onValidation,
  validationRules,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  helpText
}: ValidatedInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const validator = new FormValidator()

  const validateValue = (val: string | number) => {
    if (!validationRules && !required) return null

    const rules = {
      required,
      ...validationRules
    }

    return validator.validate(val, label, rules)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    onChange(newValue)

    // Validate on change if field has been touched
    if (touched) {
      const validationError = validateValue(newValue)
      setError(validationError)
      
      if (onValidation) {
        onValidation(name, !validationError, validationError || undefined)
      }
    }
  }

  const handleBlur = () => {
    setTouched(true)
    const validationError = validateValue(value)
    setError(validationError)
    
    if (onValidation) {
      onValidation(name, !validationError, validationError || undefined)
    }
  }

  // Clear error when value becomes valid
  useEffect(() => {
    if (touched && error) {
      const validationError = validateValue(value)
      if (!validationError) {
        setError(null)
        if (onValidation) {
          onValidation(name, true)
        }
      }
    }
  }, [value, touched, error])

  const hasError = touched && error
  const inputClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm 
    focus:outline-none focus:ring-2 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${hasError 
      ? 'border-red-300 focus:ring-red-500' 
      : 'border-gray-300 focus:ring-blue-500'
    }
    ${className}
  `.trim()

  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          step={type === 'number' ? 'any' : undefined}
        />
        
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-sm text-red-600 flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}

      {helpText && !hasError && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  )
}