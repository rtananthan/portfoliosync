import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'
import { benchmarkService, BenchmarkPerformance, BENCHMARK_INDICES } from '../services/benchmarkService'

interface BenchmarkComparisonProps {
  portfolioValue: number
  portfolioCostBasis: number
  className?: string
}

export default function BenchmarkComparison({ 
  portfolioValue, 
  portfolioCostBasis, 
  className = '' 
}: BenchmarkComparisonProps) {
  const [selectedBenchmark, setSelectedBenchmark] = useState('^AXJO')
  const [comparisons, setComparisons] = useState<BenchmarkPerformance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBenchmarkComparisons()
  }, [portfolioValue, portfolioCostBasis, selectedBenchmark])

  const loadBenchmarkComparisons = async () => {
    if (portfolioCostBasis <= 0) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const comparisons = benchmarkService.getMultiPeriodComparison(
        portfolioValue,
        portfolioCostBasis,
        selectedBenchmark
      )
      setComparisons(comparisons)
    } catch (error) {
      console.error('Error loading benchmark comparisons:', error)
    } finally {
      setLoading(false)
    }
  }

  const portfolioReturn = portfolioCostBasis > 0 
    ? ((portfolioValue - portfolioCostBasis) / portfolioCostBasis) * 100 
    : 0

  const currentBenchmark = BENCHMARK_INDICES.find(b => b.symbol === selectedBenchmark)

  if (portfolioCostBasis <= 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            Benchmark Comparison
          </h3>
        </div>
        <div className="text-center py-8">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Add investments to see benchmark comparison</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-500" />
          Benchmark Comparison
        </h3>
        
        {/* Benchmark Selector */}
        <select
          value={selectedBenchmark}
          onChange={(e) => setSelectedBenchmark(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {BENCHMARK_INDICES.map((benchmark) => (
            <option key={benchmark.symbol} value={benchmark.symbol}>
              {benchmark.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading comparison...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current Portfolio vs Benchmark */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Your Portfolio</span>
              <span className="text-sm text-gray-500">vs {currentBenchmark?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-xl font-bold ${benchmarkService.getPerformanceColor(portfolioReturn)}`}>
                  {benchmarkService.formatPerformance(portfolioReturn)}
                </span>
                {portfolioReturn >= 0 ? (
                  <TrendingUp className="h-4 w-4 ml-1 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 ml-1 text-red-500" />
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Return</div>
                <div className="text-xs text-gray-500">${(portfolioValue - portfolioCostBasis).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Period Comparisons */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Performance Comparison</h4>
            {comparisons.map((comparison) => (
              <div key={comparison.period} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {comparison.period === '1m' ? '1 Month' :
                     comparison.period === '3m' ? '3 Months' :
                     comparison.period === '6m' ? '6 Months' :
                     comparison.period === '1y' ? '1 Year' : comparison.period}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Portfolio Return */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Portfolio</div>
                    <div className={`text-sm font-medium ${benchmarkService.getPerformanceColor(comparison.portfolioReturn)}`}>
                      {benchmarkService.formatPerformance(comparison.portfolioReturn)}
                    </div>
                  </div>
                  
                  {/* Benchmark Return */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Benchmark</div>
                    <div className={`text-sm font-medium ${benchmarkService.getPerformanceColor(comparison.benchmarkReturn)}`}>
                      {benchmarkService.formatPerformance(comparison.benchmarkReturn)}
                    </div>
                  </div>
                  
                  {/* Outperformance */}
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm text-gray-600">Difference</div>
                    <div className={`text-sm font-bold ${
                      comparison.outperformance > 0 ? 'text-green-600' : 
                      comparison.outperformance < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {benchmarkService.formatPerformance(comparison.outperformance)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Overall Assessment */}
          {comparisons.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <div className="flex items-start">
                <Activity className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-1">Performance Summary</h4>
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const yearComparison = comparisons.find(c => c.period === '1y')
                      if (!yearComparison) return 'Add more investment history for better analysis.'
                      
                      if (yearComparison.outperformance > 5) {
                        return `Excellent! Your portfolio is significantly outperforming ${currentBenchmark?.name} by ${benchmarkService.formatPerformance(yearComparison.outperformance)} over the past year.`
                      } else if (yearComparison.outperformance > 0) {
                        return `Good performance! Your portfolio is beating ${currentBenchmark?.name} by ${benchmarkService.formatPerformance(yearComparison.outperformance)} over the past year.`
                      } else if (yearComparison.outperformance > -5) {
                        return `Your portfolio is slightly underperforming ${currentBenchmark?.name} by ${benchmarkService.formatPerformance(Math.abs(yearComparison.outperformance))} over the past year.`
                      } else {
                        return `Consider reviewing your investment strategy. Your portfolio is underperforming ${currentBenchmark?.name} by ${benchmarkService.formatPerformance(Math.abs(yearComparison.outperformance))} over the past year.`
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}