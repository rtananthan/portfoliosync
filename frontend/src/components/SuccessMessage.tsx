import { CheckCircle, X } from 'lucide-react'

interface SuccessMessageProps {
  title?: string
  message: string
  onClose?: () => void
}

export default function SuccessMessage({ 
  title = "Success", 
  message, 
  onClose 
}: SuccessMessageProps) {
  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
      <div className="flex items-start">
        <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <p className="text-sm text-green-700 mt-1">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-3 text-green-400 hover:text-green-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}