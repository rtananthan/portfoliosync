import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { DollarSign } from 'lucide-react'

interface AssetAllocationChartProps {
  stocksValue: number
  etfsValue: number
  propertiesValue: number
  stocksCount: number
  etfsCount: number
  propertiesCount: number
}

const COLORS = {
  stocks: '#3B82F6',
  etfs: '#8B5CF6', 
  properties: '#F97316'
}

export default function AssetAllocationChart({ 
  stocksValue, 
  etfsValue, 
  propertiesValue,
  stocksCount,
  etfsCount,
  propertiesCount
}: AssetAllocationChartProps) {
  const totalValue = stocksValue + etfsValue + propertiesValue
  
  if (totalValue === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Allocation</h2>
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No investments to display</p>
          </div>
        </div>
      </div>
    )
  }

  const data = [
    {
      name: 'Stocks',
      value: stocksValue,
      percentage: ((stocksValue / totalValue) * 100).toFixed(1),
      count: stocksCount,
      color: COLORS.stocks
    },
    {
      name: 'ETFs',
      value: etfsValue,
      percentage: ((etfsValue / totalValue) * 100).toFixed(1),
      count: etfsCount,
      color: COLORS.etfs
    },
    {
      name: 'Properties',
      value: propertiesValue,
      percentage: ((propertiesValue / totalValue) * 100).toFixed(1),
      count: propertiesCount,
      color: COLORS.properties
    }
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toLocaleString()} ({data.percentage}%)
          </p>
          <p className="text-sm text-gray-600">
            {data.count} holding{data.count !== 1 ? 's' : ''}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props: any) => {
    const { payload } = props
    return (
      <div className="flex justify-center mt-4">
        <div className="grid grid-cols-1 gap-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">
                {entry.value}: ${entry.payload.value.toLocaleString()} ({entry.payload.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Allocation</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-900">Total Portfolio Value</span>
          <span className="text-lg font-bold text-gray-900">${totalValue.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}