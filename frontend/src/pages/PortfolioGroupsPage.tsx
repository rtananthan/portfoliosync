import { useState, useEffect } from 'react'
import { Plus, Users, Settings, UserPlus, MoreVertical, Edit } from 'lucide-react'
import { PortfolioGroup, GroupAggregation } from '../types'
import PortfolioGroupService from '../services/portfolioGroupService'
import ErrorMessage from '../components/ErrorMessage'

export default function PortfolioGroupsPage() {
  const [groups, setGroups] = useState<PortfolioGroup[]>([])
  const [groupAggregations, setGroupAggregations] = useState<Record<string, GroupAggregation>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
      setError('Failed to load portfolio groups')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (groupData: {
    name: string
    description?: string
    type: PortfolioGroup['type']
    color?: string
  }) => {
    try {
      const newGroup = await PortfolioGroupService.createGroup(groupData)
      setGroups(prev => [...prev, newGroup])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create group:', error)
      setError('Failed to create group')
    }
  }

  const getGroupTypeColor = (type: PortfolioGroup['type']) => {
    const colors = {
      family: 'bg-green-100 text-green-800',
      business: 'bg-blue-100 text-blue-800',
      investment_club: 'bg-purple-100 text-purple-800',
      partnership: 'bg-orange-100 text-orange-800',
      trust: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || colors.other
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-500">Loading portfolio groups...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio Groups</h1>
            <p className="text-gray-600 mt-2">
              Manage family, business, and investment club portfolios
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Portfolio Groups</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Create your first portfolio group to share investments with family members, 
            business partners, or investment club members.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const aggregation = groupAggregations[group.id]
            
            return (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${group.color}20` }}
                    >
                      <Users className="h-6 w-6" style={{ color: group.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{group.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getGroupTypeColor(group.type)}`}>
                        {group.type.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                {/* Group Description */}
                {group.description && (
                  <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                )}

                {/* Group Stats */}
                {aggregation ? (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Total Value</span>
                      <span className="font-semibold text-gray-900">
                        ${aggregation.totalValue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Return</span>
                      <span className={`font-semibold ${
                        aggregation.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {aggregation.returnPercentage >= 0 ? '+' : ''}{aggregation.returnPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Members</span>
                      <span className="text-sm text-gray-900">
                        {aggregation.membersCount} active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Portfolios</span>
                      <span className="text-sm text-gray-900">
                        {aggregation.portfoliosCount} total
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => console.log('Invite member to', group.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Invite</span>
                  </button>
                  <button
                    onClick={() => console.log('Edit group', group.id)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => console.log('Group settings', group.id)}
                    className="flex items-center justify-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Group Modal (placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Portfolio Group</h2>
            <p className="text-gray-600 mb-4">
              This feature is coming soon! You'll be able to create and manage 
              portfolio groups for families, businesses, and investment clubs.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Demo: Create a sample group
                  handleCreateGroup({
                    name: 'Sample Family Group',
                    description: 'Demo family portfolio group',
                    type: 'family',
                    color: '#10B981'
                  })
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Create Demo Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}