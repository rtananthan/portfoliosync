import { useState, useEffect } from 'react'
import { Tag, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { TaggedAssetSummary, TAG_CATEGORIES } from '../types'
import TagService from '../services/tagService'
import { ComponentErrorBoundary } from './ErrorBoundary'

interface TagAnalyticsProps {
  assets: {
    stocks: any[]
    etfs: any[]
    properties: any[]
  }
  className?: string
}

export default function TagAnalytics({ assets, className = '' }: TagAnalyticsProps) {
  const [tagSummaries, setTagSummaries] = useState<TaggedAssetSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'value' | 'return' | 'count'>('value')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    loadTagAnalytics()
  }, [assets])

  const loadTagAnalytics = async () => {
    try {
      setLoading(true)
      const summaries = await TagService.getTaggedAssetSummaries(assets)
      setTagSummaries(summaries)
    } catch (error) {
      console.error('Failed to load tag analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getFilteredAndSortedSummaries = () => {
    let filtered = tagSummaries

    // Filter by category
    if (filterCategory !== 'all') {
      filtered = tagSummaries.filter(() => {
        // We need to get the tag to check its category
        // For now, we'll use a simple approach - in real implementation we'd look up the actual tag
        const categoryExists = TAG_CATEGORIES.find(cat => cat.id === filterCategory)
        return !!categoryExists // This is simplified
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'value':
          return b.totalValue - a.totalValue
        case 'return':
          return b.returnPercentage - a.returnPercentage
        case 'count':
          return b.totalAssetsCount - a.totalAssetsCount
        default:
          return 0
      }
    })

    return filtered
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString()}`
  }

  const getPerformanceIcon = (returnPercentage: number) => {
    if (returnPercentage > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />
    } else if (returnPercentage < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />
    }
    return <DollarSign className="h-4 w-4 text-gray-400" />
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const filteredSummaries = getFilteredAndSortedSummaries()

  return (
    <ComponentErrorBoundary componentName="Tag Analytics">
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Performance by Tags</h3>
            </div>
            
            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1"
              >
                <option value="all">All Categories</option>
                {TAG_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Sort Options */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-1"
              >
                <option value="value">Sort by Value</option>
                <option value="return">Sort by Return</option>
                <option value="count">Sort by Count</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tag Summaries */}
        <div className="p-6">
          {filteredSummaries.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-gray-900 font-medium mb-1">No Tagged Assets</h4>
              <p className="text-gray-500 text-sm">
                Start tagging your investments to see performance analytics by category
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSummaries.map((summary) => (
                <div
                  key={summary.tagId}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Tag Info */}
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: summary.tagColor }}
                    />
                    <div>
                      <div className="font-medium text-gray-900">{summary.tagName}</div>
                      <div className="text-sm text-gray-500">
                        {summary.totalAssetsCount} assets • 
                        {summary.stocksCount > 0 && ` ${summary.stocksCount} stocks`}
                        {summary.etfsCount > 0 && ` ${summary.etfsCount} ETFs`}
                        {summary.propertiesCount > 0 && ` ${summary.propertiesCount} properties`}
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="flex items-center space-x-6">
                    {/* Total Value */}
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(summary.totalValue)}
                      </div>
                      <div className="text-xs text-gray-500">Total Value</div>
                    </div>

                    {/* Return */}
                    <div className="flex items-center space-x-1">
                      {getPerformanceIcon(summary.returnPercentage)}
                      <div className="text-right">
                        <div className={`font-semibold ${
                          summary.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {summary.returnPercentage >= 0 ? '+' : ''}{summary.returnPercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Return</div>
                      </div>
                    </div>

                    {/* Best Performer */}
                    {summary.bestPerformer && (
                      <div className="text-right">
                        <div className="font-medium text-gray-900 text-sm">
                          {summary.bestPerformer.name}
                        </div>
                        <div className="text-xs text-green-600">
                          +{summary.bestPerformer.returnPercentage.toFixed(1)}% best
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {filteredSummaries.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {filteredSummaries.reduce((sum, s) => sum + s.totalAssetsCount, 0)}
                </div>
                <div className="text-sm text-gray-500">Tagged Assets</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(filteredSummaries.reduce((sum, s) => sum + s.totalValue, 0))}
                </div>
                <div className="text-sm text-gray-500">Total Value</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${
                  filteredSummaries.reduce((sum, s) => sum + s.returnPercentage, 0) >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  {(filteredSummaries.reduce((sum, s) => sum + s.returnPercentage, 0) / filteredSummaries.length).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">Avg Return</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ComponentErrorBoundary>
  )
}