import { useState, useEffect } from 'react'
import { TrendingUp, Plus, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Stock, CreateStockRequest } from '../types'
import { stocksService, ensureDefaultPortfolio } from '../services/stocksService'
import { marketDataService } from '../services/marketDataService'
import AddStockModalEnhanced from '../components/AddStockModalEnhanced'
import EditStockModal from '../components/EditStockModal'

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [portfolioId, setPortfolioId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false)
  const [lastPriceUpdate, setLastPriceUpdate] = useState<string>('')
  const [priceUpdateInfo, setPriceUpdateInfo] = useState<{cached: number, fresh: number, sources: string[]}>({cached: 0, fresh: 0, sources: []})
  const [error, setError] = useState<string>('')

  // Load stocks on component mount
  useEffect(() => {
    loadStocks()
  }, [])

  const loadStocks = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      // Ensure we have a portfolio to work with
      const defaultPortfolioId = await ensureDefaultPortfolio()
      setPortfolioId(defaultPortfolioId)
      
      // Load stocks for this portfolio
      const stocksData = await stocksService.getStocks(defaultPortfolioId)
      // Ensure stocksData is always an array
      const safeStocksData = Array.isArray(stocksData) ? stocksData : []
      setStocks(safeStocksData)
    } catch (err) {
      console.error('Error loading stocks:', err)
      setError('Failed to load stocks. Please try again.')
      setStocks([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStock = async (stockData: CreateStockRequest) => {
    try {
      setIsAdding(true)
      const newStock = await stocksService.addStock(portfolioId, stockData)
      
      // Add the new stock to the list
      setStocks(prevStocks => [...prevStocks, newStock])
      
      // Also refresh the list to ensure consistency
      setTimeout(() => {
        loadStocks()
      }, 500)
      
    } catch (err) {
      console.error('Error adding stock:', err)
      throw new Error('Failed to add stock')
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock)
    setIsEditModalOpen(true)
  }

  const handleUpdateStock = async (updateData: Partial<CreateStockRequest>) => {
    if (!editingStock) return
    
    try {
      setIsUpdating(true)
      const updatedStock = await stocksService.updateStock(editingStock.id, updateData)
      
      // Update the stock in the list
      setStocks(prevStocks => 
        prevStocks.map(stock => 
          stock.id === editingStock.id ? updatedStock : stock
        )
      )
      setIsEditModalOpen(false)
      setEditingStock(null)
    } catch (err) {
      console.error('Error updating stock:', err)
      throw new Error('Failed to update stock')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteStock = async (stockId: string) => {
    if (!confirm('Are you sure you want to delete this stock?')) {
      return
    }
    
    try {
      await stocksService.deleteStock(stockId)
      setStocks(prevStocks => prevStocks.filter(stock => stock.id !== stockId))
    } catch (err) {
      console.error('Error deleting stock:', err)
      alert('Failed to delete stock. Please try again.')
    }
  }

  const handleRefreshPrices = async (forceRefresh: boolean = false) => {
    if (!portfolioId || safeStocks.length === 0) {
      return
    }

    try {
      setIsRefreshingPrices(true)
      setError('')
      
      // Update prices for all stocks in the portfolio
      const result = await marketDataService.updatePortfolioPrices(portfolioId, forceRefresh)
      
      // Reload stocks to get updated prices
      await loadStocks()
      
      // Update last refresh time
      setLastPriceUpdate(new Date().toLocaleTimeString())
      
      // Analyze cache vs fresh data
      const cachedCount = result.updated_stocks.filter(stock => stock.cached).length
      const freshCount = result.updated_stocks.filter(stock => !stock.cached).length
      
      setPriceUpdateInfo({
        cached: cachedCount,
        fresh: freshCount,
        sources: result.market_data_sources
      })
      
      // Show success message if any stocks were updated
      if (result.updated_count > 0) {
        const sources = result.market_data_sources.join(', ')
        console.log(`Updated ${result.updated_count} stocks (${freshCount} fresh, ${cachedCount} cached) using ${sources}`)
      }
      
    } catch (err) {
      console.error('Error refreshing prices:', err)
      setError('Failed to refresh prices. Please try again.')
    } finally {
      setIsRefreshingPrices(false)
    }
  }

  // Calculate totals from API data (with safety checks and enhanced P&L)
  const safeStocks = Array.isArray(stocks) ? stocks : []
  const totalValue = safeStocks.reduce((sum, stock) => sum + (Number(stock.totalValue) || 0), 0)
  const totalCostBasis = safeStocks.reduce((sum, stock) => 
    sum + (Number(stock.totalCostBasis) || (Number(stock.quantity) * Number(stock.purchasePrice || stock.averagePrice)) || 0), 0)
  const totalReturn = safeStocks.reduce((sum, stock) => sum + (Number(stock.totalReturn) || 0), 0)
  const totalReturnPercent = totalCostBasis > 0 ? ((totalReturn / totalCostBasis) * 100) : 0

  // Auto-refresh prices when stocks are loaded (optional)
  useEffect(() => {
    if (portfolioId && safeStocks.length > 0 && !lastPriceUpdate) {
      // Only auto-refresh once when page loads and has stocks
      const timer = setTimeout(() => {
        handleRefreshPrices()
      }, 2000) // Wait 2 seconds after stocks load
      
      return () => clearTimeout(timer)
    }
  }, [portfolioId, safeStocks.length, lastPriceUpdate])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading stocks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              Stock Investments
            </h1>
            <p className="text-gray-600 mt-1">Manage your individual stock holdings</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {/* Smart Refresh Button */}
          <button 
            onClick={() => handleRefreshPrices(false)}
            disabled={isRefreshingPrices || safeStocks.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshingPrices ? 'animate-spin' : ''}`} />
            {isRefreshingPrices ? 'Updating...' : 'Smart Refresh'}
          </button>

          {/* Force Refresh Button */}
          <button 
            onClick={() => handleRefreshPrices(true)}
            disabled={isRefreshingPrices || safeStocks.length === 0}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshingPrices ? 'animate-spin' : ''}`} />
            Force Refresh
          </button>
          
          {/* Add Stock Button */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button 
              onClick={loadStocks}
              className="text-sm text-red-600 hover:text-red-500 mt-2 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Price Update Status */}
      {lastPriceUpdate && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">
                ✅ Prices last updated at {lastPriceUpdate}
              </p>
              {priceUpdateInfo.fresh > 0 || priceUpdateInfo.cached > 0 ? (
                <p className="text-xs text-green-600 mt-1">
                  {priceUpdateInfo.fresh} fresh • {priceUpdateInfo.cached} cached
                  {priceUpdateInfo.sources.length > 0 && ` • Sources: ${priceUpdateInfo.sources.join(', ')}`}
                </p>
              ) : null}
            </div>
            <div className="text-xs text-green-600">
              <p><strong>Smart Refresh:</strong> Uses cache if &lt; 3hrs old</p>
              <p><strong>Force Refresh:</strong> Always fetches live data</p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
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
              <p className={`text-2xl font-bold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(1)}%
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalReturnPercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-lg ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Holdings</p>
              <p className="text-2xl font-bold text-gray-900">{safeStocks.length}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-lg text-blue-600">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Stock Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Held
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {safeStocks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks yet</h3>
                      <p className="text-gray-500 mb-4">Start building your portfolio by adding your first stock.</p>
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Stock
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                safeStocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.name || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{Number(stock.quantity) || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(Number(stock.purchasePrice) || Number(stock.averagePrice) || 0).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stock.purchaseDate ? new Date(stock.purchaseDate).toLocaleDateString() : 'N/A'}
                      </div>
                      {stock.purchaseFees && Number(stock.purchaseFees) > 0 && (
                        <div className="text-xs text-gray-400">
                          Fees: ${Number(stock.purchaseFees).toFixed(2)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${(Number(stock.currentPrice) || Number(stock.purchasePrice) || Number(stock.averagePrice) || 0).toFixed(2)}
                      </div>
                      {stock.currency && stock.currency !== 'USD' && (
                        <div className="text-xs text-gray-500">{stock.currency}</div>
                      )}
                      {(stock as any).priceSource && (
                        <div className="text-xs text-green-600">
                          📊 {(stock as any).priceSource}
                        </div>
                      )}
                      {(stock as any).lastPriceUpdate && (
                        <div className="text-xs text-gray-400">
                          Updated: {new Date((stock as any).lastPriceUpdate).toLocaleTimeString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${(Number(stock.totalValue) || 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        Cost: ${(Number(stock.totalCostBasis) || Number(stock.quantity) * Number(stock.purchasePrice || stock.averagePrice) || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${(Number(stock.returnPercentage) || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(Number(stock.returnPercentage) || 0) >= 0 ? '+' : ''}{(Number(stock.returnPercentage) || 0).toFixed(1)}%
                      </div>
                      <div className={`text-xs ${(Number(stock.totalReturn) || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${(Number(stock.totalReturn) || 0) >= 0 ? '+' : ''}${(Number(stock.totalReturn) || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {stock.daysHeld !== undefined ? `${Number(stock.daysHeld)} days` : 'N/A'}
                      </div>
                      {stock.sector && (
                        <div className="text-xs text-gray-500">{stock.sector}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEditStock(stock)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteStock(stock.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      <AddStockModalEnhanced
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStock}
        isLoading={isAdding}
      />

      {/* Edit Stock Modal */}
      <EditStockModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingStock(null)
        }}
        onSubmit={handleUpdateStock}
        stock={editingStock}
        isLoading={isUpdating}
      />
    </div>
  )
}