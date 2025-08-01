import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Home, BarChart3, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import DataService from '../services/dataService'
import { Stock, ETF, Property, GroupAggregation } from '../types'
import ErrorMessage from '../components/ErrorMessage'
import BenchmarkWidget from '../components/BenchmarkWidget'
import AssetAllocationChart from '../components/AssetAllocationChart'
import PerformanceTrendChart from '../components/PerformanceTrendChart'
import TopPerformers from '../components/TopPerformers'
import PortfolioGrowthTimeline from '../components/PortfolioGrowthTimeline'
import PortfolioGroupSelector from '../components/PortfolioGroupSelector'
import GroupDashboard from '../components/GroupDashboard'
import TagAnalytics from '../components/TagAnalytics'
import { ComponentErrorBoundary } from '../components/ErrorBoundary'
import { parseError, logError } from '../utils/errorHandler'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{title: string, message: string, canRetry: boolean} | null>(null)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [etfs, setETFs] = useState<ETF[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string
    name: string
    type: 'stock' | 'etf' | 'property'
    details: string
    return: number
    date: string
  }>>([])
  
  // Portfolio Group State
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [groupAggregation, setGroupAggregation] = useState<GroupAggregation | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load all investment data in parallel with individual error handling
      const results = await Promise.allSettled([
        DataService.getStocks(),
        DataService.getETFs(),
        DataService.getProperties()
      ])
      
      // Process results and handle partial failures
      const stocksData = results[0].status === 'fulfilled' ? results[0].value : []
      const etfsData = results[1].status === 'fulfilled' ? results[1].value : []
      const propertiesData = results[2].status === 'fulfilled' ? results[2].value : []
      
      // Log any failures for debugging
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          const serviceNames = ['stocks', 'ETFs', 'properties']
          logError(result.reason, `Loading ${serviceNames[index]} data`)
        }
      })
      
      setStocks(Array.isArray(stocksData) ? stocksData : [])
      setETFs(Array.isArray(etfsData) ? etfsData : [])
      setProperties(Array.isArray(propertiesData) ? propertiesData : [])
      
      // Generate recent activity from all investments
      generateRecentActivity(stocksData || [], etfsData || [], propertiesData || [])
      
    } catch (error) {
      const errorDetails = parseError(error)
      setError(errorDetails)
      logError(error, 'Loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleGroupChange = (groupId: string | null, aggregation?: GroupAggregation) => {
    setSelectedGroupId(groupId)
    setGroupAggregation(aggregation || null)
  }

  const generateRecentActivity = (stocksData: Stock[], etfsData: ETF[], propertiesData: Property[]) => {
    const activity: Array<{
      id: string
      name: string
      type: 'stock' | 'etf' | 'property'
      details: string
      return: number
      date: string
    }> = []

    // Add recent stocks
    stocksData.slice(0, 2).forEach(stock => {
      activity.push({
        id: stock.id,
        name: stock.symbol,
        type: 'stock',
        details: `${Number(stock.quantity) || 0} shares`,
        return: Number(stock.returnPercentage) || 0,
        date: stock.purchaseDate || ''
      })
    })

    // Add recent ETFs
    etfsData.slice(0, 2).forEach(etf => {
      activity.push({
        id: etf.id,
        name: etf.symbol,
        type: 'etf',
        details: `${Number(etf.quantity) || 0} shares`,
        return: Number(etf.returnPercentage) || 0,
        date: etf.purchaseDate || ''
      })
    })

    // Add recent properties
    propertiesData.slice(0, 1).forEach(property => {
      activity.push({
        id: property.id,
        name: property.address.split(',')[0] || 'Property',
        type: 'property',
        details: property.propertyType,
        return: Number(property.returnPercentage) || 0,
        date: property.purchaseDate || ''
      })
    })

    // Sort by date (most recent first) and take top 5
    activity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setRecentActivity(activity.slice(0, 5))
  }

  // Calculate portfolio statistics
  const safeStocks = Array.isArray(stocks) ? stocks : []
  const safeETFs = Array.isArray(etfs) ? etfs : []
  const safeProperties = Array.isArray(properties) ? properties : []

  const stocksValue = safeStocks.reduce((sum, stock) => sum + (Number(stock.totalValue) || 0), 0)
  const stocksReturn = safeStocks.length > 0 ? 
    safeStocks.reduce((sum, stock) => sum + (Number(stock.returnPercentage) || 0), 0) / safeStocks.length : 0

  const etfsValue = safeETFs.reduce((sum, etf) => sum + (Number(etf.totalValue) || 0), 0)
  const etfsReturn = safeETFs.length > 0 ? 
    safeETFs.reduce((sum, etf) => sum + (Number(etf.returnPercentage) || 0), 0) / safeETFs.length : 0

  const propertiesValue = safeProperties.reduce((sum, property) => sum + (Number(property.currentValue) || 0), 0)
  const propertiesReturn = safeProperties.length > 0 ? 
    safeProperties.reduce((sum, property) => sum + (Number(property.returnPercentage) || 0), 0) / safeProperties.length : 0

  const totalValue = stocksValue + etfsValue + propertiesValue
  const totalReturn = totalValue > 0 ? 
    ((stocksValue * stocksReturn) + (etfsValue * etfsReturn) + (propertiesValue * propertiesReturn)) / totalValue : 0

  const investments = {
    stocks: { value: stocksValue, count: safeStocks.length, return: stocksReturn },
    etfs: { value: etfsValue, count: safeETFs.length, return: etfsReturn },
    properties: { value: propertiesValue, count: safeProperties.length, return: propertiesReturn }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Portfolio Group Selector */}
      <div className="mb-6">
        <PortfolioGroupSelector
          selectedGroupId={selectedGroupId}
          onGroupChange={handleGroupChange}
          className="max-w-md"
        />
      </div>

      {/* Conditional Dashboard Rendering */}
      {selectedGroupId && groupAggregation ? (
        /* Group Dashboard View */
        <ComponentErrorBoundary componentName="Group Dashboard">
          <GroupDashboard 
            groupId={selectedGroupId} 
            aggregation={groupAggregation} 
          />
        </ComponentErrorBoundary>
      ) : (
        /* Individual Portfolio Dashboard */
        <div className="space-y-6">{/* Original individual portfolio content */}

      {/* Error Display */}
      {error && (
        <ErrorMessage
          title={error.title}
          message={error.message}
          onClose={() => setError(null)}
          actionLabel={error.canRetry ? "Try Again" : undefined}
          onAction={error.canRetry ? loadDashboardData : undefined}
        />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Portfolio</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        {/* Benchmark Widget */}
        <BenchmarkWidget
          portfolioValue={totalValue}
          portfolioCostBasis={totalValue - (
            safeStocks.reduce((sum, s) => sum + (Number(s.totalReturn) || 0), 0) +
            safeETFs.reduce((sum, e) => sum + (Number(e.totalReturn) || 0), 0) +
            safeProperties.reduce((sum, p) => sum + (Number(p.totalReturn) || 0), 0)
          )}
        />

        <Link to="/stocks" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stocks</p>
              <p className="text-2xl font-bold text-blue-600">
                ${investments.stocks.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{investments.stocks.count} holdings • Avg: {investments.stocks.return}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </Link>

        <Link to="/etfs" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ETFs</p>
              <p className="text-2xl font-bold text-purple-600">
                ${investments.etfs.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{investments.etfs.count} holdings • Avg: {investments.etfs.return}%</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </Link>

        <Link to="/properties" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-orange-600">
                ${investments.properties.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">{investments.properties.count} properties • Avg: {investments.properties.return}%</p>
            </div>
            <Home className="h-8 w-8 text-orange-500" />
          </div>
        </Link>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ComponentErrorBoundary componentName="Asset Allocation Chart">
          <AssetAllocationChart 
            stocksValue={stocksValue}
            etfsValue={etfsValue}
            propertiesValue={propertiesValue}
            stocksCount={safeStocks.length}
            etfsCount={safeETFs.length}
            propertiesCount={safeProperties.length}
          />
        </ComponentErrorBoundary>
        <ComponentErrorBoundary componentName="Performance Trend Chart">
          <PerformanceTrendChart 
            portfolioValue={totalValue}
            portfolioReturn={totalReturn}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Performance Analysis */}
      <div className="mb-8">
        <ComponentErrorBoundary componentName="Top Performers">
          <TopPerformers 
            stocks={safeStocks}
            etfs={safeETFs}
            properties={safeProperties}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Portfolio Growth Timeline */}
      <div className="mb-8">
        <ComponentErrorBoundary componentName="Portfolio Growth Timeline">
          <PortfolioGrowthTimeline 
            stocks={safeStocks}
            etfs={safeETFs}
            properties={safeProperties}
            totalValue={totalValue}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Tag Analytics */}
      <div className="mb-8">
        <ComponentErrorBoundary componentName="Tag Analytics">
          <TagAnalytics 
            assets={{
              stocks: safeStocks,
              etfs: safeETFs,
              properties: safeProperties
            }}
          />
        </ComponentErrorBoundary>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <button 
            onClick={loadDashboardData}
            disabled={loading}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-500">Loading portfolio data...</span>
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((item, index) => (
              <div key={item.id} className={`flex justify-between items-center py-3 ${index < recentActivity.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <span className="text-gray-900 font-medium">{item.name}</span>
                  <span className="text-gray-500 text-sm ml-2">{item.details}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    ({item.type === 'stock' ? 'Stock' : item.type === 'etf' ? 'ETF' : 'Property'})
                  </span>
                </div>
                <span className={`font-medium ${item.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.return >= 0 ? '+' : ''}{item.return.toFixed(1)}%
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-gray-900 font-medium mb-1">No investments yet</h3>
              <p className="text-gray-500 text-sm">Start by adding your first stock, ETF, or property</p>
            </div>
          )}
        </div>
      </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link to="/stocks" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Add Stock
            </Link>
            <Link to="/etfs" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Add ETF
            </Link>
            <Link to="/properties" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center">
              <Home className="h-5 w-5 mr-2" />
              Add Property
            </Link>
            <Link to="/benchmark" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition duration-200 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}