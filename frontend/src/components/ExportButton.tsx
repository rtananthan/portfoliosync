import { useState } from 'react'
import { Download, FileText, Database, Grid } from 'lucide-react'
import { Stock, ETF, Property } from '../types'
import { exportPortfolioData, generateSummaryReport, ExportFormat, ExportType } from '../utils/dataExport'
import ErrorMessage from './ErrorMessage'
import SuccessMessage from './SuccessMessage'

interface ExportButtonProps {
  stocks: Stock[]
  etfs: ETF[]
  properties: Property[]
  className?: string
  variant?: 'button' | 'dropdown'
}

export default function ExportButton({ 
  stocks, 
  etfs, 
  properties, 
  className = '',
  variant = 'dropdown'
}: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const hasData = stocks.length > 0 || etfs.length > 0 || properties.length > 0

  const handleExport = async (type: ExportType, format: ExportFormat) => {
    if (!hasData) {
      setMessage({ type: 'error', text: 'No data to export. Add some investments first.' })
      return
    }

    try {
      setIsExporting(true)
      setMessage(null)
      
      await exportPortfolioData(stocks, etfs, properties, type, format)
      
      setMessage({ 
        type: 'success', 
        text: `Successfully exported ${type === 'all' ? 'portfolio' : type} data as ${format.toUpperCase()}` 
      })
      setIsOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error) {
      console.error('Export error:', error)
      setMessage({ 
        type: 'error', 
        text: 'Failed to export data. Please try again.' 
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleSummaryReport = () => {
    try {
      const report = generateSummaryReport(stocks, etfs, properties)
      const blob = new Blob([report], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `portfoliosync-summary-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setMessage({ type: 'success', text: 'Summary report downloaded successfully' })
      setIsOpen(false)
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000)
      
    } catch (error) {
      console.error('Summary report error:', error)
      setMessage({ type: 'error', text: 'Failed to generate summary report' })
    }
  }

  if (variant === 'button') {
    return (
      <div className="relative">
        {message && (
          <div className="absolute top-12 right-0 z-50 w-80">
            {message.type === 'success' ? (
              <SuccessMessage message={message.text} onClose={() => setMessage(null)} />
            ) : (
              <ErrorMessage message={message.text} onClose={() => setMessage(null)} />
            )}
          </div>
        )}
        
        <button
          onClick={() => handleExport('all', 'json')}
          disabled={!hasData || isExporting}
          className={`flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm transition duration-200 ${className}`}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {message && (
        <div className="absolute top-12 right-0 z-50 w-80">
          {message.type === 'success' ? (
            <SuccessMessage message={message.text} onClose={() => setMessage(null)} />
          ) : (
            <ErrorMessage message={message.text} onClose={() => setMessage(null)} />
          )}
        </div>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={!hasData || isExporting}
          className={`flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow-sm transition duration-200 ${className}`}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && hasData && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu">
              {/* Export All Data */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
                Export All Data
              </div>
              
              <button
                onClick={() => handleExport('all', 'json')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Database className="h-4 w-4 mr-3" />
                JSON Format
              </button>
              
              <button
                onClick={() => handleExport('all', 'csv')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <Grid className="h-4 w-4 mr-3" />
                CSV Files
              </button>
              
              <button
                onClick={() => handleExport('all', 'excel')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <FileText className="h-4 w-4 mr-3" />
                Excel Format
              </button>

              {/* Individual Exports */}
              {stocks.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-t">
                    Stocks Only
                  </div>
                  <button
                    onClick={() => handleExport('stocks', 'csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Grid className="h-4 w-4 mr-3" />
                    Stocks CSV
                  </button>
                </>
              )}

              {etfs.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-t">
                    ETFs Only
                  </div>
                  <button
                    onClick={() => handleExport('etfs', 'csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Grid className="h-4 w-4 mr-3" />
                    ETFs CSV
                  </button>
                </>
              )}

              {properties.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-t">
                    Properties Only
                  </div>
                  <button
                    onClick={() => handleExport('properties', 'csv')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    role="menuitem"
                  >
                    <Grid className="h-4 w-4 mr-3" />
                    Properties CSV
                  </button>
                </>
              )}

              {/* Summary Report */}
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-t">
                Reports
              </div>
              <button
                onClick={handleSummaryReport}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                <FileText className="h-4 w-4 mr-3" />
                Summary Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  )
}