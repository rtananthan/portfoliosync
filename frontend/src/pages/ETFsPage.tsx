import { useState } from 'react'
import { BarChart3, Plus, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ETFsPage() {
  const [etfs] = useState([
    { id: 1, symbol: 'VOO', name: 'Vanguard S&P 500 ETF', quantity: 100, averagePrice: 380.25, currentPrice: 421.45, totalValue: 42145, return: 10.8, returnDollar: 4120 },
    { id: 2, symbol: 'QQQ', name: 'Invesco QQQ Trust', quantity: 75, averagePrice: 328.90, currentPrice: 389.20, totalValue: 29190, return: 18.3, returnDollar: 4522.50 },
    { id: 3, symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', quantity: 80, averagePrice: 215.30, currentPrice: 245.85, totalValue: 19668, return: 14.2, returnDollar: 2444 },
    { id: 4, symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', quantity: 120, averagePrice: 68.45, currentPrice: 75.20, totalValue: 9024, return: 9.9, returnDollar: 810 },
  ])

  const totalValue = etfs.reduce((sum, etf) => sum + etf.totalValue, 0)
  const totalReturn = etfs.reduce((sum, etf) => sum + etf.returnDollar, 0)
  const totalReturnPercent = (totalReturn / (totalValue - totalReturn)) * 100

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
              <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
              ETF Investments
            </h1>
            <p className="text-gray-600 mt-1">Manage your exchange-traded fund holdings</p>
          </div>
        </div>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add ETF
        </button>
      </div>

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
            <BarChart3 className="h-8 w-8 text-purple-500" />
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
              <p className="text-2xl font-bold text-gray-900">{etfs.length}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-lg text-purple-600">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* ETFs Table */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">ETF Holdings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ETF
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shares
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {etfs.map((etf) => (
                <tr key={etf.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{etf.symbol}</div>
                      <div className="text-sm text-gray-500">{etf.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{etf.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${etf.averagePrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${etf.currentPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${etf.totalValue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${etf.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {etf.return >= 0 ? '+' : ''}{etf.return}%
                    </div>
                    <div className={`text-xs ${etf.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${etf.returnDollar >= 0 ? '+' : ''}${etf.returnDollar.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}