import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Target } from 'lucide-react'
import { benchmarkService } from '../services/benchmarkService'

interface BenchmarkWidgetProps {
  portfolioValue: number
  portfolioCostBasis: number
  className?: string
}

export default function BenchmarkWidget({ 
  portfolioValue, 
  portfolioCostBasis, 
  className = '' 
}: BenchmarkWidgetProps) {
  const [benchmarkReturn, setBenchmarkReturn] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBenchmarkData()
  }, [portfolioValue, portfolioCostBasis])

  const loadBenchmarkData = async () => {
    if (portfolioCostBasis <= 0) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      // Use ASX 200 as default benchmark
      const comparison = benchmarkService.calculatePerformanceComparison(
        portfolioValue,
        portfolioCostBasis,
        '^AXJO',
        '1y'
      )
      
      if (comparison) {
        setBenchmarkReturn(comparison.benchmarkReturn)
      }
    } catch (error) {
      console.error('Error loading benchmark data:', error)
    } finally {
      setLoading(false)
    }
  }

  const portfolioReturn = portfolioCostBasis > 0 
    ? ((portfolioValue - portfolioCostBasis) / portfolioCostBasis) * 100 
    : 0

  const outperformance = portfolioReturn - benchmarkReturn
  const isOutperforming = outperformance > 0

  if (portfolioCostBasis <= 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">vs ASX 200</p>
            <p className="text-2xl font-bold text-gray-400">--</p>
          </div>
          <Target className="h-8 w-8 text-gray-300" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">vs ASX 200</p>
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-lg text-gray-500">Loading...</span>
            </div>
          ) : (
            <div className="flex items-center">
              <p className={`text-2xl font-bold ${
                isOutperforming ? 'text-green-600' : 'text-red-600'
              }`}>
                {benchmarkService.formatPerformance(outperformance)}
              </p>
              {isOutperforming ? (
                <TrendingUp className="h-5 w-5 ml-2 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 ml-2 text-red-600" />
              )}
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {isOutperforming ? 'Outperforming' : 'Underperforming'} • 1 Year
          </p>
        </div>
        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
          isOutperforming ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <Target className={`h-5 w-5 ${
            isOutperforming ? 'text-green-600' : 'text-red-600'
          }`} />
        </div>
      </div>

      {/* Additional benchmark context */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Your Portfolio: {benchmarkService.formatPerformance(portfolioReturn)}</span>
          <span>ASX 200: {benchmarkService.formatPerformance(benchmarkReturn)}</span>
        </div>
      </div>
    </div>
  )
}