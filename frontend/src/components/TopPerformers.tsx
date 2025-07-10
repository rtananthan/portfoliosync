import { TrendingUp, Award, AlertTriangle } from 'lucide-react'
import { Stock, ETF, Property } from '../types'

interface TopPerformersProps {
  stocks: Stock[]
  etfs: ETF[]
  properties: Property[]
}

interface PerformanceItem {
  id: string
  name: string
  type: 'stock' | 'etf' | 'property'
  return: number
  value: number
  symbol?: string
}

export default function TopPerformers({ stocks, etfs, properties }: TopPerformersProps) {
  const getAllInvestments = (): PerformanceItem[] => {
    const investments: PerformanceItem[] = []
    
    // Add stocks
    stocks.forEach(stock => {
      investments.push({
        id: stock.id,
        name: stock.symbol,
        symbol: stock.symbol,
        type: 'stock',
        return: Number(stock.returnPercentage) || 0,
        value: Number(stock.totalValue) || 0
      })
    })
    
    // Add ETFs
    etfs.forEach(etf => {
      investments.push({
        id: etf.id,
        name: etf.name || etf.symbol,
        symbol: etf.symbol,
        type: 'etf',
        return: Number(etf.returnPercentage) || 0,
        value: Number(etf.totalValue) || 0
      })
    })
    
    // Add properties
    properties.forEach(property => {
      investments.push({
        id: property.id,
        name: property.address.split(',')[0] || 'Property',
        type: 'property',
        return: Number(property.returnPercentage) || 0,
        value: Number(property.currentValue) || 0
      })
    })
    
    return investments
  }

  const investments = getAllInvestments()
  
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performers</h2>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No investments to analyze</p>
          </div>
        </div>
      </div>
    )
  }

  const sortedInvestments = [...investments].sort((a, b) => b.return - a.return)
  const topPerformers = sortedInvestments.slice(0, 3)
  const worstPerformers = sortedInvestments.slice(-3).reverse()

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock':
        return 'bg-blue-100 text-blue-800'
      case 'etf':
        return 'bg-purple-100 text-purple-800'
      case 'property':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <TrendingUp className="h-4 w-4" />
      case 'etf':
        return <TrendingUp className="h-4 w-4" />
      case 'property':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <TrendingUp className="h-4 w-4" />
    }
  }

  const PerformanceList = ({ 
    title, 
    items, 
    icon
  }: { 
    title: string
    items: PerformanceItem[]
    icon: React.ReactNode
  }) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center mb-3">
        {icon}
        <h3 className="text-lg font-medium text-gray-900 ml-2">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                  {getTypeIcon(item.type)}
                  <span className="ml-1 capitalize">{item.type}</span>
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                {item.symbol && (
                  <p className="text-xs text-gray-500">{item.symbol}</p>
                )}
                <p className="text-xs text-gray-500">${item.value.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-medium ${
                item.return >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {item.return >= 0 ? '+' : ''}{item.return.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">
                #{index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analysis</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PerformanceList
            title="Top Performers"
            items={topPerformers}
            icon={<Award className="h-5 w-5 text-green-500" />}
          />
        </div>
        
        <div>
          <PerformanceList
            title="Needs Attention"
            items={worstPerformers}
            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
          />
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Best Performer</p>
            <p className="text-lg font-semibold text-green-600">
              +{topPerformers[0]?.return.toFixed(1) || '0.0'}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Average Return</p>
            <p className="text-lg font-semibold text-gray-900">
              {investments.length > 0 
                ? (investments.reduce((sum, inv) => sum + inv.return, 0) / investments.length).toFixed(1)
                : '0.0'
              }%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Worst Performer</p>
            <p className="text-lg font-semibold text-red-600">
              {worstPerformers[0]?.return.toFixed(1) || '0.0'}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}