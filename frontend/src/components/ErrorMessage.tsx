import { AlertCircle, X } from 'lucide-react'

interface ErrorMessageProps {
  title?: string
  message: string
  onClose?: () => void
  actionLabel?: string
  onAction?: () => void
}

export default function ErrorMessage({ 
  title = "Error", 
  message, 
  onClose, 
  actionLabel, 
  onAction 
}: ErrorMessageProps) {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
          {actionLabel && onAction && (
            <button 
              onClick={onAction}
              className="text-sm text-red-600 hover:text-red-500 mt-2 underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}