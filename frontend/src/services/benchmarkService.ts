// Benchmark indices data and performance comparison
export interface BenchmarkIndex {
  symbol: string
  name: string
  country: string
  description: string
  currentValue?: number
  lastUpdate?: string
}

export interface BenchmarkPerformance {
  symbol: string
  name: string
  period: string
  benchmarkReturn: number
  portfolioReturn: number
  outperformance: number
  alpha: number
}

export interface PerformancePeriod {
  label: string
  days: number
  value: string
}

// Major benchmark indices we'll track
export const BENCHMARK_INDICES: BenchmarkIndex[] = [
  {
    symbol: '^AXJO',
    name: 'ASX 200',
    country: 'AU',
    description: 'S&P/ASX 200 Index - Top 200 Australian companies'
  },
  {
    symbol: '^AORD',
    name: 'All Ordinaries',
    country: 'AU', 
    description: 'All Ordinaries Index - Broader Australian market'
  },
  {
    symbol: '^GSPC',
    name: 'S&P 500',
    country: 'US',
    description: 'S&P 500 Index - Top 500 US companies'
  },
  {
    symbol: '^IXIC',
    name: 'NASDAQ',
    country: 'US',
    description: 'NASDAQ Composite Index - US technology focus'
  },
  {
    symbol: '^DJI',
    name: 'Dow Jones',
    country: 'US',
    description: 'Dow Jones Industrial Average - 30 major US companies'
  },
  {
    symbol: '^FTSE',
    name: 'FTSE 100',
    country: 'UK',
    description: 'FTSE 100 Index - Top 100 UK companies'
  }
]

// Performance periods for comparison
export const PERFORMANCE_PERIODS: PerformancePeriod[] = [
  { label: '1 Week', days: 7, value: '1w' },
  { label: '1 Month', days: 30, value: '1m' },
  { label: '3 Months', days: 90, value: '3m' },
  { label: '6 Months', days: 180, value: '6m' },
  { label: '1 Year', days: 365, value: '1y' },
  { label: '2 Years', days: 730, value: '2y' },
  { label: '3 Years', days: 1095, value: '3y' },
  { label: '5 Years', days: 1825, value: '5y' }
]

// Mock historical data for development (in production, would fetch from API)
// This data structure is ready for future API integration
export const MOCK_BENCHMARK_DATA: Record<string, Array<{date: string, value: number}>> = {
  '^AXJO': [
    { date: '2024-01-01', value: 7500 },
    { date: '2024-02-01', value: 7650 },
    { date: '2024-03-01', value: 7580 },
    { date: '2024-04-01', value: 7720 },
    { date: '2024-05-01', value: 7680 },
    { date: '2024-06-01', value: 7820 },
    { date: '2024-07-01', value: 7950 },
    { date: '2024-12-31', value: 8200 }
  ],
  '^GSPC': [
    { date: '2024-01-01', value: 4750 },
    { date: '2024-02-01', value: 4850 },
    { date: '2024-03-01', value: 4920 },
    { date: '2024-04-01', value: 5100 },
    { date: '2024-05-01', value: 5050 },
    { date: '2024-06-01', value: 5200 },
    { date: '2024-07-01', value: 5400 },
    { date: '2024-12-31', value: 5600 }
  ]
}

class BenchmarkService {
  // Get current benchmark data
  async getBenchmarkData(): Promise<BenchmarkIndex[]> {
    try {
      // In production, this would fetch from a financial data API
      // For now, return static data with simulated current values
      return BENCHMARK_INDICES.map(index => ({
        ...index,
        currentValue: this.getMockCurrentValue(index.symbol),
        lastUpdate: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Error fetching benchmark data:', error)
      return BENCHMARK_INDICES
    }
  }

  // Calculate portfolio performance vs benchmark
  calculatePerformanceComparison(
    portfolioValue: number,
    portfolioCostBasis: number,
    benchmarkSymbol: string,
    period: string
  ): BenchmarkPerformance | null {
    try {
      const benchmark = BENCHMARK_INDICES.find(b => b.symbol === benchmarkSymbol)
      if (!benchmark) return null

      // Calculate portfolio return
      const portfolioReturn = portfolioCostBasis > 0 
        ? ((portfolioValue - portfolioCostBasis) / portfolioCostBasis) * 100 
        : 0

      // Get benchmark return for period (mock data for now)
      const benchmarkReturn = this.getMockBenchmarkReturn(benchmarkSymbol, period)
      
      // Calculate outperformance (alpha)
      const outperformance = portfolioReturn - benchmarkReturn
      
      return {
        symbol: benchmarkSymbol,
        name: benchmark.name,
        period,
        benchmarkReturn,
        portfolioReturn,
        outperformance,
        alpha: outperformance // Simplified alpha calculation
      }
    } catch (error) {
      console.error('Error calculating performance comparison:', error)
      return null
    }
  }

  // Get multiple period comparisons
  getMultiPeriodComparison(
    portfolioValue: number,
    portfolioCostBasis: number,
    benchmarkSymbol: string
  ): BenchmarkPerformance[] {
    const comparisons: BenchmarkPerformance[] = []
    
    // Calculate for key periods
    const keyPeriods = ['1m', '3m', '6m', '1y']
    
    keyPeriods.forEach(period => {
      const comparison = this.calculatePerformanceComparison(
        portfolioValue,
        portfolioCostBasis,
        benchmarkSymbol,
        period
      )
      if (comparison) {
        comparisons.push(comparison)
      }
    })
    
    return comparisons
  }

  // Get best performing benchmark for comparison
  getBestBenchmarkMatch(portfolioComposition: {
    stocks: number,
    etfs: number, 
    properties: number,
    australianPercentage: number
  }): string {
    // Logic to suggest most relevant benchmark based on portfolio composition
    if (portfolioComposition.australianPercentage > 70) {
      return '^AXJO' // ASX 200 for Australian-heavy portfolios
    } else if (portfolioComposition.stocks + portfolioComposition.etfs > 80) {
      return '^GSPC' // S&P 500 for equity-heavy portfolios
    } else {
      return '^AXJO' // Default to ASX 200 for mixed portfolios
    }
  }

  // Helper methods for mock data
  private getMockCurrentValue(symbol: string): number {
    const mockValues: Record<string, number> = {
      '^AXJO': 8200,
      '^AORD': 8100,
      '^GSPC': 5600,
      '^IXIC': 17800,
      '^DJI': 39000,
      '^FTSE': 8100
    }
    return mockValues[symbol] || 1000
  }

  private getMockBenchmarkReturn(symbol: string, period: string): number {
    // Mock historical returns for different periods
    const mockReturns: Record<string, Record<string, number>> = {
      '^AXJO': {
        '1w': 0.5,
        '1m': 2.1,
        '3m': 4.8,
        '6m': 8.2,
        '1y': 12.5,
        '2y': 18.7,
        '3y': 24.2
      },
      '^GSPC': {
        '1w': 0.8,
        '1m': 2.8,
        '3m': 6.2,
        '6m': 11.4,
        '1y': 15.8,
        '2y': 22.3,
        '3y': 28.9
      }
    }
    
    return mockReturns[symbol]?.[period] || 0
  }

  // Calculate Sharpe ratio (risk-adjusted return)
  calculateSharpeRatio(portfolioReturn: number, benchmarkReturn: number): number {
    // Simplified Sharpe ratio calculation
    // In production, would need volatility data
    const riskFreeRate = 2.5 // Assume 2.5% risk-free rate
    const excessReturn = portfolioReturn - riskFreeRate
    
    // Simple risk adjustment based on outperformance volatility
    const volatilityAdjustment = Math.abs(portfolioReturn - benchmarkReturn) / 10
    
    return excessReturn / (volatilityAdjustment || 1)
  }

  // Format performance for display
  formatPerformance(value: number, isPercentage: boolean = true): string {
    const formatted = Math.abs(value).toFixed(2)
    const sign = value >= 0 ? '+' : '-'
    const suffix = isPercentage ? '%' : ''
    
    return `${sign}${formatted}${suffix}`
  }

  // Get performance color class for UI
  getPerformanceColor(value: number): string {
    if (value > 5) return 'text-green-600'
    if (value > 0) return 'text-green-500'
    if (value > -5) return 'text-red-500'
    return 'text-red-600'
  }
}

export const benchmarkService = new BenchmarkService()
export default benchmarkService