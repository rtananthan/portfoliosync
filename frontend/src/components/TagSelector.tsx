import { useState, useEffect, useRef } from 'react'
import { Plus, X, Tag, Search } from 'lucide-react'
import { AssetTag, TAG_CATEGORIES } from '../types'
import TagService from '../services/tagService'

interface TagSelectorProps {
  selectedTagIds: string[]
  onTagsChange: (tagIds: string[]) => void
  suggestions?: AssetTag[]
  placeholder?: string
  maxTags?: number
  allowCustomTags?: boolean
  className?: string
}

export default function TagSelector({
  selectedTagIds,
  onTagsChange,
  suggestions = [],
  placeholder = 'Add tags to categorize this investment...',
  maxTags = 10,
  allowCustomTags = true,
  className = ''
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allTags, setAllTags] = useState<AssetTag[]>([])
  const [selectedTags, setSelectedTags] = useState<AssetTag[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagCategory, setNewTagCategory] = useState<AssetTag['category']>('custom')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    // Update selected tags when selectedTagIds changes
    const updateSelectedTags = async () => {
      if (selectedTagIds.length > 0) {
        const tags = await TagService.getTagsByIds(selectedTagIds)
        setSelectedTags(tags)
      } else {
        setSelectedTags([])
      }
    }
    updateSelectedTags()
  }, [selectedTagIds])

  const loadTags = async () => {
    try {
      setLoading(true)
      const tags = await TagService.getAllTags()
      setAllTags(tags)
    } catch (error) {
      console.error('Failed to load tags:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTag = (tag: AssetTag) => {
    if (selectedTagIds.includes(tag.id) || selectedTagIds.length >= maxTags) return
    
    const newTagIds = [...selectedTagIds, tag.id]
    onTagsChange(newTagIds)
    setSearchQuery('')
  }

  const handleRemoveTag = (tagId: string) => {
    const newTagIds = selectedTagIds.filter(id => id !== tagId)
    onTagsChange(newTagIds)
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !allowCustomTags) return

    try {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1']
      const randomColor = colors[Math.floor(Math.random() * colors.length)]

      const newTag = await TagService.createTag({
        name: newTagName.trim(),
        color: randomColor,
        category: newTagCategory
      })

      setAllTags(prev => [...prev, newTag])
      handleAddTag(newTag)
      setNewTagName('')
      setNewTagCategory('custom')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  const getFilteredTags = () => {
    let filtered = allTags.filter(tag => !selectedTagIds.includes(tag.id))

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(tag => tag.category === activeCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const getCategoryColor = (category: string) => {
    const categoryData = TAG_CATEGORIES.find(cat => cat.id === category)
    return categoryData?.color || '#6B7280'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Tags Display */}
      <div className="min-h-[42px] p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          
          {/* Input field */}
          <input
            type="text"
            placeholder={selectedTags.length === 0 ? placeholder : 'Add more tags...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
            disabled={selectedTagIds.length >= maxTags}
          />
        </div>
      </div>

      {/* Suggestions (when not focused) */}
      {!isOpen && suggestions.length > 0 && selectedTagIds.length === 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Suggested tags:</p>
          <div className="flex flex-wrap gap-1">
            {suggestions.slice(0, 4).map(tag => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag)}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                style={{ color: tag.color, borderColor: tag.color + '40' }}
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search and Categories */}
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 text-sm outline-none"
                autoFocus
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2 py-1 text-xs rounded-full transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {TAG_CATEGORIES.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-2 py-1 text-xs rounded-full transition-colors ${
                    activeCategory === category.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: activeCategory === category.id ? category.color : undefined
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Tags List */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-3 text-center text-gray-500">Loading tags...</div>
            ) : (
              <>
                {getFilteredTags().map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => handleAddTag(tag)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{tag.name}</div>
                      {tag.description && (
                        <div className="text-xs text-gray-500">{tag.description}</div>
                      )}
                    </div>
                    <div
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: getCategoryColor(tag.category) + '20',
                        color: getCategoryColor(tag.category)
                      }}
                    >
                      {TAG_CATEGORIES.find(cat => cat.id === tag.category)?.name || tag.category}
                    </div>
                  </button>
                ))}

                {getFilteredTags().length === 0 && searchQuery && allowCustomTags && (
                  <div className="p-3">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center gap-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create tag "{searchQuery}"
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Create Tag Form */}
          {showCreateForm && allowCustomTags && (
            <div className="border-t border-gray-200 p-3">
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <select
                  value={newTagCategory}
                  onChange={(e) => setNewTagCategory(e.target.value as AssetTag['category'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="custom">Custom</option>
                  {TAG_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewTagName('')
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}