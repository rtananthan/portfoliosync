import { TrendingUp, DollarSign, Home, BarChart3 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const investments = {
    stocks: { value: 27977, count: 5, return: 12.1 },
    etfs: { value: 71335, count: 2, return: 14.4 },
    properties: { value: 2275000, count: 2, return: 17.2 }
  }

  const totalValue = investments.stocks.value + investments.etfs.value + investments.properties.value

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">PortfolioSync</h1>
        <p className="text-gray-600">Modern investment tracking platform for smart investors</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-900 font-medium">AAPL</span>
              <span className="text-gray-500 text-sm ml-2">50 shares</span>
            </div>
            <span className="text-green-600 font-medium">+8.5%</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div>
              <span className="text-gray-900 font-medium">VOO</span>
              <span className="text-gray-500 text-sm ml-2">100 shares</span>
            </div>
            <span className="text-green-600 font-medium">+10.2%</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <div>
              <span className="text-gray-900 font-medium">Seattle Property</span>
              <span className="text-gray-500 text-sm ml-2">Residential</span>
            </div>
            <span className="text-green-600 font-medium">+19.3%</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>
  )
}