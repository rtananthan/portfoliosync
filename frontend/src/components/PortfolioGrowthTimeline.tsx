import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Calendar, TrendingUp, Target } from 'lucide-react'
import { Stock, ETF, Property } from '../types'

interface PortfolioGrowthTimelineProps {
  stocks: Stock[]
  etfs: ETF[]
  properties: Property[]
  totalValue: number
}

export default function PortfolioGrowthTimeline({ 
  stocks, 
  etfs, 
  properties, 
  totalValue 
}: PortfolioGrowthTimelineProps) {
  const generateTimelineData = () => {
    // Calculate total cost basis
    const totalCostBasis = 
      stocks.reduce((sum, s) => sum + (Number(s.purchasePrice) * Number(s.quantity) || 0), 0) +
      etfs.reduce((sum, e) => sum + (Number(e.purchasePrice) * Number(e.quantity) || 0), 0) +
      properties.reduce((sum, p) => sum + (Number(p.purchasePrice) || 0), 0)
    
    // Generate mock historical data based on current portfolio
    const data = []
    const currentDate = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const progress = (11 - i) / 11
      
      // Simulate portfolio growth over time
      const value = totalCostBasis * (1 + progress * ((totalValue - totalCostBasis) / totalCostBasis))
      const costBasis = totalCostBasis * (0.3 + progress * 0.7) // Simulate gradual investment
      
      data.push({
        date: date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
        fullDate: date.toLocaleDateString('en-AU'),
        value: Math.round(value),
        costBasis: Math.round(costBasis),
        gain: Math.round(value - costBasis),
        return: ((value - costBasis) / costBasis * 100).toFixed(1)
      })
    }
    
    return data
  }

  const data = generateTimelineData()
  const isPositive = totalValue > data[0]?.costBasis

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.fullDate}</p>
          <p className="text-sm text-blue-600">
            Portfolio Value: ${data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Cost Basis: ${data.costBasis.toLocaleString()}
          </p>
          <p className={`text-sm ${data.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Gain/Loss: ${data.gain.toLocaleString()} ({data.return}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (totalValue === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Growth Timeline</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No growth data to display</p>
          </div>
        </div>
      </div>
    )
  }

  const currentData = data[data.length - 1]
  const totalGain = currentData.value - currentData.costBasis
  const totalReturn = ((currentData.value - currentData.costBasis) / currentData.costBasis * 100)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Portfolio Growth Timeline</h2>
        <div className="flex items-center space-x-2">
          <TrendingUp className={`h-5 w-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}${totalGain.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorValue)"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="costBasis" 
              stroke="#6B7280"
              strokeWidth={1}
              fill="url(#colorCostBasis)"
              fillOpacity={0.3}
            />
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorCostBasis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6B7280" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6B7280" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="text-lg font-semibold text-blue-600">${currentData.value.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Invested</p>
            <p className="text-lg font-semibold text-gray-900">${currentData.costBasis.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Return</p>
            <p className={`text-lg font-semibold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>Portfolio Value</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
            <span>Cost Basis</span>
          </div>
          <div className="flex items-center">
            <Target className="h-4 w-4 mr-1" />
            <span>12-Month View</span>
          </div>
        </div>
      </div>
    </div>
  )
}