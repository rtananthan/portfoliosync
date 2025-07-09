import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Target, TrendingUp } from 'lucide-react'
import { Stock, ETF, Property } from '../types'
import { stocksService, ensureDefaultPortfolio } from '../services/stocksService'
import { etfService } from '../services/etfService'
import { propertyService } from '../services/propertyService'
import BenchmarkComparison from '../components/BenchmarkComparison'
import ErrorMessage from '../components/ErrorMessage'
import { parseError, logError } from '../utils/errorHandler'

export default function BenchmarkPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{title: string, message: string, canRetry: boolean} | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [etfs, setETFs] = useState<ETF[]>([])
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const defaultPortfolioId = await ensureDefaultPortfolio()
      
      const results = await Promise.allSettled([
        stocksService.getStocks(defaultPortfolioId),
        etfService.getETFs(defaultPortfolioId),
        propertyService.getProperties(defaultPortfolioId)
      ])
      
      const stocksData = results[0].status === 'fulfilled' ? results[0].value : []
      const etfsData = results[1].status === 'fulfilled' ? results[1].value : []
      const propertiesData = results[2].status === 'fulfilled' ? results[2].value : []
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const serviceNames = ['stocks', 'ETFs', 'properties']
          logError(result.reason, `Loading ${serviceNames[index]} data for benchmark analysis`)
        }
      })
      
      setStocks(Array.isArray(stocksData) ? stocksData : [])
      setETFs(Array.isArray(etfsData) ? etfsData : [])
      setProperties(Array.isArray(propertiesData) ? propertiesData : [])
      
    } catch (error) {
      const errorDetails = parseError(error)
      setError(errorDetails)
      logError(error, 'Loading portfolio data for benchmark analysis')
    } finally {
      setLoading(false)
    }
  }

  // Calculate portfolio metrics
  const safeStocks = Array.isArray(stocks) ? stocks : []
  const safeETFs = Array.isArray(etfs) ? etfs : []
  const safeProperties = Array.isArray(properties) ? properties : []

  const stocksValue = safeStocks.reduce((sum, stock) => sum + (Number(stock.totalValue) || 0), 0)
  const etfsValue = safeETFs.reduce((sum, etf) => sum + (Number(etf.totalValue) || 0), 0)
  const propertiesValue = safeProperties.reduce((sum, property) => sum + (Number(property.currentValue) || 0), 0)
  const totalValue = stocksValue + etfsValue + propertiesValue

  const totalReturn = 
    safeStocks.reduce((sum, s) => sum + (Number(s.totalReturn) || 0), 0) +
    safeETFs.reduce((sum, e) => sum + (Number(e.totalReturn) || 0), 0) +
    safeProperties.reduce((sum, p) => sum + (Number(p.totalReturn) || 0), 0)

  const totalCostBasis = totalValue - totalReturn

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading benchmark analysis...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="-ml-1 mr-1 h-5 w-5" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Target className="h-8 w-8 text-blue-500 mr-3" />
            Benchmark Analysis
          </h1>
          <p className="text-gray-600 mt-1">Compare your portfolio performance against market indices</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          title={error.title}
          message={error.message}
          onClose={() => setError(null)}
          actionLabel={error.canRetry ? "Try Again" : undefined}
          onAction={error.canRetry ? loadPortfolioData : undefined}
        />
      )}

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Return</p>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-lg ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Return %</p>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalCostBasis > 0 ? 
                  `${totalReturn >= 0 ? '+' : ''}${((totalReturn / totalCostBasis) * 100).toFixed(1)}%` : 
                  '0.0%'
                }
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-lg ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Holdings</p>
              <p className="text-2xl font-bold text-gray-900">
                {safeStocks.length + safeETFs.length + safeProperties.length}
              </p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg text-blue-600">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <BenchmarkComparison
          portfolioValue={totalValue}
          portfolioCostBasis={totalCostBasis}
        />
      </div>

      {/* Portfolio Composition for Context */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Composition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{safeStocks.length}</div>
            <div className="text-sm text-gray-600">Stocks</div>
            <div className="text-xs text-gray-500">${stocksValue.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{safeETFs.length}</div>
            <div className="text-sm text-gray-600">ETFs</div>
            <div className="text-xs text-gray-500">${etfsValue.toLocaleString()}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{safeProperties.length}</div>
            <div className="text-sm text-gray-600">Properties</div>
            <div className="text-xs text-gray-500">${propertiesValue.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  )
}