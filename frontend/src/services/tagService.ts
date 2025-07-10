import { AssetTag, TaggedAssetSummary, DEFAULT_TAGS, TAG_CATEGORIES, Stock, ETF, Property } from '../types'

class TagService {
  private tags: AssetTag[] = []
  private initialized = false

  // Initialize with default tags
  async initializeDefaultTags(): Promise<void> {
    if (this.initialized) return

    this.tags = DEFAULT_TAGS.map((tag, index) => ({
      ...tag,
      id: `tag_${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: undefined // System tags
    }))

    this.initialized = true
  }

  // ============ TAG MANAGEMENT ============

  async getAllTags(): Promise<AssetTag[]> {
    await this.initializeDefaultTags()
    return this.tags.filter(tag => !tag.isArchived)
  }

  async getTagsByCategory(category?: AssetTag['category']): Promise<AssetTag[]> {
    const allTags = await this.getAllTags()
    if (!category) return allTags
    return allTags.filter(tag => tag.category === category)
  }

  async getTagById(id: string): Promise<AssetTag | null> {
    await this.initializeDefaultTags()
    return this.tags.find(tag => tag.id === id && !tag.isArchived) || null
  }

  async getTagsByIds(ids: string[]): Promise<AssetTag[]> {
    await this.initializeDefaultTags()
    return this.tags.filter(tag => ids.includes(tag.id) && !tag.isArchived)
  }

  async createTag(tagData: {
    name: string
    description?: string
    color: string
    category: AssetTag['category']
  }): Promise<AssetTag> {
    await this.initializeDefaultTags()

    const newTag: AssetTag = {
      id: `tag_custom_${Date.now()}`,
      name: tagData.name,
      description: tagData.description,
      color: tagData.color,
      category: tagData.category,
      isDefault: false,
      isArchived: false,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user_id'
    }

    this.tags.push(newTag)
    return newTag
  }

  async updateTag(id: string, updates: Partial<AssetTag>): Promise<AssetTag> {
    await this.initializeDefaultTags()
    const tagIndex = this.tags.findIndex(tag => tag.id === id)
    
    if (tagIndex === -1) {
      throw new Error('Tag not found')
    }

    // Don't allow updating default tags (except usage count)
    const tag = this.tags[tagIndex]
    if (tag.isDefault && Object.keys(updates).some(key => key !== 'usageCount')) {
      throw new Error('Cannot modify default tags')
    }

    this.tags[tagIndex] = {
      ...tag,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return this.tags[tagIndex]
  }

  async deleteTag(id: string): Promise<void> {
    await this.initializeDefaultTags()
    const tag = this.tags.find(tag => tag.id === id)
    
    if (!tag) {
      throw new Error('Tag not found')
    }

    if (tag.isDefault) {
      throw new Error('Cannot delete default tags')
    }

    // Soft delete by archiving
    await this.updateTag(id, { isArchived: true })
  }

  // ============ TAG ANALYTICS ============

  async getTagUsageStats(): Promise<Record<string, number>> {
    // This would normally query the database for actual usage
    // For now, return mock data
    const stats: Record<string, number> = {}
    
    // Mock some usage data
    const mockUsage = {
      'tag_1': 5,   // Growth
      'tag_2': 3,   // Income
      'tag_6': 8,   // Short-term
      'tag_7': 12,  // Medium-term
      'tag_10': 7,  // Retirement
      'tag_17': 4,  // Conservative
      'tag_22': 9,  // ASX 200
      'tag_25': 6   // US Markets
    }

    this.tags.forEach(tag => {
      stats[tag.id] = (mockUsage as Record<string, number>)[tag.id] || 0
    })

    return stats
  }

  async getTaggedAssetSummaries(assets: {
    stocks: Stock[]
    etfs: ETF[]
    properties: Property[]
  }): Promise<TaggedAssetSummary[]> {
    await this.initializeDefaultTags()
    const allTags = await this.getAllTags()
    const summaries: TaggedAssetSummary[] = []

    for (const tag of allTags) {
      // Find assets with this tag
      const taggedStocks = assets.stocks.filter(stock => stock.tags?.includes(tag.id))
      const taggedETFs = assets.etfs.filter(etf => etf.tags?.includes(tag.id))
      const taggedProperties = assets.properties.filter(property => property.tags?.includes(tag.id))

      const totalAssetsCount = taggedStocks.length + taggedETFs.length + taggedProperties.length
      
      if (totalAssetsCount === 0) continue

      // Calculate financial metrics
      const totalValue = 
        taggedStocks.reduce((sum, stock) => sum + (stock.totalValue || 0), 0) +
        taggedETFs.reduce((sum, etf) => sum + (etf.totalValue || 0), 0) +
        taggedProperties.reduce((sum, property) => sum + (property.currentValue || 0), 0)

      const totalReturn = 
        taggedStocks.reduce((sum, stock) => sum + (stock.totalReturn || 0), 0) +
        taggedETFs.reduce((sum, etf) => sum + (etf.totalReturn || 0), 0) +
        taggedProperties.reduce((sum, property) => sum + (property.totalReturn || 0), 0)

      const returnPercentage = totalValue > 0 ? (totalReturn / (totalValue - totalReturn)) * 100 : 0

      // Find best and worst performers
      const allTaggedAssets = [
        ...taggedStocks.map(s => ({ id: s.id, name: s.symbol, type: 'stock' as const, returnPercentage: s.returnPercentage || 0 })),
        ...taggedETFs.map(e => ({ id: e.id, name: e.symbol, type: 'etf' as const, returnPercentage: e.returnPercentage || 0 })),
        ...taggedProperties.map(p => ({ id: p.id, name: p.address.split(',')[0], type: 'property' as const, returnPercentage: p.returnPercentage || 0 }))
      ]

      const sortedByPerformance = allTaggedAssets.sort((a, b) => b.returnPercentage - a.returnPercentage)

      summaries.push({
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        stocksCount: taggedStocks.length,
        etfsCount: taggedETFs.length,
        propertiesCount: taggedProperties.length,
        totalAssetsCount,
        totalValue,
        totalReturn,
        returnPercentage,
        bestPerformer: sortedByPerformance[0] || null,
        worstPerformer: sortedByPerformance[sortedByPerformance.length - 1] || null
      })
    }

    // Sort by total value descending
    return summaries.sort((a, b) => b.totalValue - a.totalValue)
  }

  // ============ TAG SUGGESTIONS ============

  async suggestTagsForAsset(assetData: {
    type: 'stock' | 'etf' | 'property'
    symbol?: string
    sector?: string
    category?: string
    purchaseDate?: string
    value?: number
  }): Promise<AssetTag[]> {
    await this.initializeDefaultTags()
    const suggestions: AssetTag[] = []
    const allTags = await this.getAllTags()

    // Time-based suggestions
    if (assetData.purchaseDate) {
      const purchaseDate = new Date(assetData.purchaseDate)
      const daysSincePurchase = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysSincePurchase > 365) {
        const cgtTag = allTags.find(tag => tag.name === 'CGT Discount Eligible')
        if (cgtTag) suggestions.push(cgtTag)
      }
    }

    // Asset type based suggestions
    if (assetData.type === 'property') {
      const propertyTags = allTags.filter(tag => 
        ['Negative Gearing', 'Long-term (5yr+)', 'Conservative'].includes(tag.name)
      )
      suggestions.push(...propertyTags)
    }

    // Sector/category based suggestions
    if (assetData.sector) {
      const sector = assetData.sector.toLowerCase()
      if (sector.includes('tech') || sector.includes('technology')) {
        const growthTag = allTags.find(tag => tag.name === 'Growth')
        const aggressiveTag = allTags.find(tag => tag.name === 'Aggressive')
        if (growthTag) suggestions.push(growthTag)
        if (aggressiveTag) suggestions.push(aggressiveTag)
      }
      
      if (sector.includes('utilities') || sector.includes('reit')) {
        const incomeTag = allTags.find(tag => tag.name === 'Income')
        const conservativeTag = allTags.find(tag => tag.name === 'Conservative')
        if (incomeTag) suggestions.push(incomeTag)
        if (conservativeTag) suggestions.push(conservativeTag)
      }
    }

    // Symbol-based suggestions (Australian vs International)
    if (assetData.symbol) {
      if (assetData.symbol.includes('.AX') || /^[A-Z]{3,4}$/.test(assetData.symbol)) {
        const asxTag = allTags.find(tag => tag.name === 'ASX 200')
        const frankingTag = allTags.find(tag => tag.name === 'Franking Credits')
        if (asxTag) suggestions.push(asxTag)
        if (frankingTag) suggestions.push(frankingTag)
      } else {
        const intlTag = allTags.find(tag => tag.name === 'International')
        if (intlTag) suggestions.push(intlTag)
      }
    }

    // Remove duplicates
    const uniqueSuggestions = suggestions.filter((tag, index, self) => 
      index === self.findIndex(t => t.id === tag.id)
    )

    return uniqueSuggestions.slice(0, 5) // Limit to 5 suggestions
  }

  // ============ FILTER HELPERS ============

  filterAssetsByTags<T extends { tags?: string[] }>(
    assets: T[], 
    tagIds: string[], 
    matchAll: boolean = false
  ): T[] {
    if (tagIds.length === 0) return assets

    return assets.filter(asset => {
      if (!asset.tags || asset.tags.length === 0) return false
      
      if (matchAll) {
        // Asset must have ALL specified tags
        return tagIds.every(tagId => asset.tags!.includes(tagId))
      } else {
        // Asset must have ANY of the specified tags
        return tagIds.some(tagId => asset.tags!.includes(tagId))
      }
    })
  }

  getTagCategories() {
    return TAG_CATEGORIES
  }
}

export default new TagService()