import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PerformanceTrendChartProps {
  portfolioValue: number
  portfolioReturn: number
}

export default function PerformanceTrendChart({ 
  portfolioValue, 
  portfolioReturn 
}: PerformanceTrendChartProps) {
  // Generate mock historical data for demonstration
  // In a real app, this would come from stored historical data
  const generateMockData = () => {
    const data = []
    const currentDate = new Date()
    const startValue = portfolioValue / (1 + portfolioReturn / 100)
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const progress = (11 - i) / 11
      const value = startValue * (1 + (portfolioReturn / 100) * progress)
      
      data.push({
        date: date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' }),
        fullDate: date.toLocaleDateString('en-AU'),
        value: Math.round(value),
        return: ((value - startValue) / startValue * 100).toFixed(1)
      })
    }
    
    return data
  }

  const data = generateMockData()
  const isPositive = portfolioReturn >= 0

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.fullDate}</p>
          <p className="text-sm text-gray-600">
            Value: ${data.value.toLocaleString()}
          </p>
          <p className={`text-sm ${parseFloat(data.return) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Return: {data.return}%
          </p>
        </div>
      )
    }
    return null
  }

  if (portfolioValue === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Trend</h2>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No performance data to display</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Performance Trend</h2>
        <div className="flex items-center space-x-2">
          {isPositive ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{portfolioReturn.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={isPositive ? "#10B981" : "#EF4444"}
              strokeWidth={2}
              dot={{ r: 4, fill: isPositive ? "#10B981" : "#EF4444" }}
              activeDot={{ r: 6, fill: isPositive ? "#10B981" : "#EF4444" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Current Value</p>
            <p className="text-lg font-semibold text-gray-900">${portfolioValue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Return</p>
            <p className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{portfolioReturn.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}