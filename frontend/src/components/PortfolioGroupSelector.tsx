import { useState, useEffect } from 'react'
import { ChevronDown, Users, User, Plus, Settings } from 'lucide-react'
import { PortfolioGroup, GroupAggregation } from '../types'
import PortfolioGroupService from '../services/portfolioGroupService'

interface PortfolioGroupSelectorProps {
  selectedGroupId: string | null
  onGroupChange: (groupId: string | null, aggregation?: GroupAggregation) => void
  className?: string
}

export default function PortfolioGroupSelector({ 
  selectedGroupId, 
  onGroupChange, 
  className = '' 
}: PortfolioGroupSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [groups, setGroups] = useState<PortfolioGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [groupAggregations, setGroupAggregations] = useState<Record<string, GroupAggregation>>({})

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      const userGroups = await PortfolioGroupService.getUserGroups()
      setGroups(userGroups)

      // Load aggregation data for each group
      const aggregations: Record<string, GroupAggregation> = {}
      await Promise.all(
        userGroups.map(async (group) => {
          try {
            const aggregation = await PortfolioGroupService.getGroupAggregation(group.id)
            aggregations[group.id] = aggregation
          } catch (error) {
            console.error(`Failed to load aggregation for group ${group.id}:`, error)
          }
        })
      )
      setGroupAggregations(aggregations)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupSelect = async (groupId: string | null) => {
    setIsOpen(false)
    
    if (groupId) {
      // Load aggregation data for the selected group
      try {
        const aggregation = groupAggregations[groupId] || 
          await PortfolioGroupService.getGroupAggregation(groupId)
        onGroupChange(groupId, aggregation)
      } catch (error) {
        console.error('Failed to load group aggregation:', error)
        onGroupChange(groupId)
      }
    } else {
      // Individual portfolio view
      onGroupChange(null)
    }
  }

  const getSelectedDisplay = () => {
    if (!selectedGroupId) {
      return {
        name: 'Individual Portfolio',
        icon: User,
        description: 'Your personal investments',
        color: '#6B7280'
      }
    }

    const group = groups.find(g => g.id === selectedGroupId)
    const aggregation = groupAggregations[selectedGroupId]
    
    return {
      name: group?.name || 'Unknown Group',
      icon: Users,
      description: aggregation 
        ? `${aggregation.membersCount} members • $${aggregation.totalValue.toLocaleString()}`
        : group?.description || 'Group portfolio',
      color: group?.color || '#3B82F6'
    }
  }

  const selectedDisplay = getSelectedDisplay()
  const SelectedIcon = selectedDisplay.icon

  return (
    <div className={`relative ${className}`}>
      {/* Selected Group Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${selectedDisplay.color}20` }}
          >
            <SelectedIcon 
              className="h-5 w-5" 
              style={{ color: selectedDisplay.color }}
            />
          </div>
          <div className="text-left">
            <div className="font-medium text-gray-900">{selectedDisplay.name}</div>
            <div className="text-sm text-gray-500">{selectedDisplay.description}</div>
          </div>
        </div>
        <ChevronDown 
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Individual Portfolio Option */}
          <button
            onClick={() => handleGroupSelect(null)}
            className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors ${
              !selectedGroupId ? 'bg-blue-50 border-r-2 border-blue-600' : ''
            }`}
          >
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-left flex-1">
              <div className="font-medium text-gray-900">Individual Portfolio</div>
              <div className="text-sm text-gray-500">Your personal investments</div>
            </div>
            {!selectedGroupId && (
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </button>

          {/* Divider */}
          {groups.length > 0 && (
            <div className="border-t border-gray-200 my-1"></div>
          )}

          {/* Group Options */}
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm">Loading groups...</div>
            </div>
          ) : (
            groups.map((group) => {
              const aggregation = groupAggregations[group.id]
              const isSelected = selectedGroupId === group.id
              
              return (
                <button
                  key={group.id}
                  onClick={() => handleGroupSelect(group.id)}
                  className={`w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${group.color}20` }}
                  >
                    <Users className="h-5 w-5" style={{ color: group.color }} />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-900">{group.name}</div>
                    <div className="text-sm text-gray-500">
                      {aggregation 
                        ? `${aggregation.membersCount} members • $${aggregation.totalValue.toLocaleString()}`
                        : group.description || `${group.type} portfolio`
                      }
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </button>
              )
            })
          )}

          {/* Actions */}
          <div className="border-t border-gray-200 mt-1">
            <button
              onClick={() => {
                setIsOpen(false)
                // TODO: Open create group modal
                console.log('Create new group')
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-blue-600"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium">Create New Group</div>
                <div className="text-sm text-gray-500">Family, business, or investment club</div>
              </div>
            </button>

            {selectedGroupId && (
              <button
                onClick={() => {
                  setIsOpen(false)
                  // TODO: Open group settings
                  console.log('Manage group settings')
                }}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-gray-600"
              >
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                  <Settings className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium">Manage Group</div>
                  <div className="text-sm text-gray-500">Members, permissions, settings</div>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}