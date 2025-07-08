import { useState, useEffect } from 'react'
import { Search, Filter, X, SortAsc, SortDesc } from 'lucide-react'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface SortOption {
  value: string
  label: string
  direction: 'asc' | 'desc'
}

interface SearchFilterProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filterOptions?: {
    label: string
    key: string
    options: FilterOption[]
    selectedValues: string[]
    onFilterChange: (key: string, values: string[]) => void
  }[]
  sortOptions?: SortOption[]
  selectedSort?: string
  onSortChange?: (value: string) => void
  placeholder?: string
  showResultCount?: boolean
  resultCount?: number
  className?: string
}

export default function SearchFilter({
  searchValue,
  onSearchChange,
  filterOptions = [],
  sortOptions = [],
  selectedSort,
  onSortChange,
  placeholder = "Search...",
  showResultCount = false,
  resultCount = 0,
  className = ""
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.filter-dropdown')) {
        setIsFilterOpen(false)
      }
      if (!target.closest('.sort-dropdown')) {
        setIsSortOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const hasActiveFilters = filterOptions.some(filter => filter.selectedValues.length > 0)
  const activeFilterCount = filterOptions.reduce((sum, filter) => sum + filter.selectedValues.length, 0)

  const handleFilterToggle = (filterKey: string, value: string) => {
    const filter = filterOptions.find(f => f.key === filterKey)
    if (!filter) return

    const currentValues = filter.selectedValues
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    
    filter.onFilterChange(filterKey, newValues)
  }

  const clearAllFilters = () => {
    filterOptions.forEach(filter => {
      filter.onFilterChange(filter.key, [])
    })
  }

  const clearSearch = () => {
    onSearchChange('')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Action Bar */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchValue && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button */}
        {filterOptions.length > 0 && (
          <div className="relative filter-dropdown">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center px-3 py-2 border rounded-lg transition-colors ${
                hasActiveFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {filterOptions.map((filter) => (
                    <div key={filter.key} className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">{filter.label}</h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {filter.options.map((option) => (
                          <label key={option.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filter.selectedValues.includes(option.value)}
                              onChange={() => handleFilterToggle(filter.key, option.value)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              {option.label}
                              {typeof option.count === 'number' && (
                                <span className="text-gray-400 ml-1">({option.count})</span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort Button */}
        {sortOptions.length > 0 && (
          <div className="relative sort-dropdown">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {selectedSort ? (
                sortOptions.find(opt => opt.value === selectedSort)?.direction === 'desc' ? (
                  <SortDesc className="h-4 w-4 mr-2" />
                ) : (
                  <SortAsc className="h-4 w-4 mr-2" />
                )
              ) : (
                <SortAsc className="h-4 w-4 mr-2" />
              )}
              Sort
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange?.(option.value)
                        setIsSortOpen(false)
                      }}
                      className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                        selectedSort === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      {option.direction === 'desc' ? (
                        <SortDesc className="h-4 w-4 mr-2" />
                      ) : (
                        <SortAsc className="h-4 w-4 mr-2" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Result Count and Active Filters */}
      {(showResultCount || hasActiveFilters || searchValue) && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {showResultCount && (
              <span>{resultCount} result{resultCount !== 1 ? 's' : ''}</span>
            )}
            
            {searchValue && (
              <span className="flex items-center">
                Searching for: <span className="ml-1 font-medium">"{searchValue}"</span>
                <button onClick={clearSearch} className="ml-1 text-gray-400 hover:text-gray-600">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span>Filtered by:</span>
              {filterOptions.map((filter) =>
                filter.selectedValues.map((value) => {
                  const option = filter.options.find(opt => opt.value === value)
                  return (
                    <span
                      key={`${filter.key}-${value}`}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {option?.label || value}
                      <button
                        onClick={() => handleFilterToggle(filter.key, value)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}