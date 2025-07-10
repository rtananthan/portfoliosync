import { useState, useEffect } from 'react'
import { Users, TrendingUp, DollarSign, BarChart3, Activity, UserPlus, Settings as SettingsIcon } from 'lucide-react'
import { PortfolioGroup, GroupAggregation, GroupMember, GroupActivity } from '../types'
import PortfolioGroupService from '../services/portfolioGroupService'
import AssetAllocationChart from './AssetAllocationChart'
import { ComponentErrorBoundary } from './ErrorBoundary'

interface GroupDashboardProps {
  groupId: string
  aggregation: GroupAggregation
}

export default function GroupDashboard({ groupId, aggregation }: GroupDashboardProps) {
  const [group, setGroup] = useState<PortfolioGroup | null>(null)
  const [members, setMembers] = useState<GroupMember[]>([])
  const [activity, setActivity] = useState<GroupActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGroupData()
  }, [groupId])

  const loadGroupData = async () => {
    try {
      setLoading(true)
      const [groupData, membersData, activityData] = await Promise.all([
        PortfolioGroupService.getGroup(groupId),
        PortfolioGroupService.getGroupMembers(groupId),
        PortfolioGroupService.getGroupActivity(groupId, 10)
      ])
      
      setGroup(groupData)
      setMembers(membersData)
      setActivity(activityData)
    } catch (error) {
      console.error('Failed to load group data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-500">Loading group dashboard...</span>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">Group not found</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Group Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${group.color}20` }}
            >
              <Users className="h-8 w-8" style={{ color: group.color }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
              <p className="text-gray-600">{group.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">
                  {aggregation.membersCount} members
                </span>
                <span className="text-sm text-gray-500">
                  {aggregation.portfoliosCount} portfolios
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {group.type.replace('_', ' ')} group
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => console.log('Invite member')}
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Member</span>
            </button>
            <button 
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => console.log('Group settings')}
            >
              <SettingsIcon className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Group Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${aggregation.totalValue.toLocaleString()}
              </p>
              <p className={`text-sm ${aggregation.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {aggregation.returnPercentage >= 0 ? '+' : ''}{aggregation.returnPercentage.toFixed(1)}% return
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stocks</p>
              <p className="text-2xl font-bold text-blue-600">
                ${aggregation.stocksValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{aggregation.stocksCount} holdings</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ETFs</p>
              <p className="text-2xl font-bold text-purple-600">
                ${aggregation.etfsValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{aggregation.etfsCount} holdings</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-orange-600">
                ${aggregation.propertiesValue.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{aggregation.propertiesCount} properties</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Analytics and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <ComponentErrorBoundary componentName="Group Asset Allocation">
          <AssetAllocationChart 
            stocksValue={aggregation.stocksValue}
            etfsValue={aggregation.etfsValue}
            propertiesValue={aggregation.propertiesValue}
            stocksCount={aggregation.stocksCount}
            etfsCount={aggregation.etfsCount}
            propertiesCount={aggregation.propertiesCount}
          />
        </ComponentErrorBoundary>

        {/* Portfolio Performance Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
          <div className="space-y-4">
            {aggregation.portfolioPerformance.map((portfolio) => (
              <div key={portfolio.portfolioId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{portfolio.portfolioName}</div>
                  <div className="text-sm text-gray-500">Managed by {portfolio.ownerName}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${portfolio.value.toLocaleString()}</div>
                  <div className={`text-sm ${portfolio.returnPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.returnPercentage >= 0 ? '+' : ''}{portfolio.returnPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Members */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Group Members</h3>
            <button 
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => console.log('Manage members')}
            >
              Manage
            </button>
          </div>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {member.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{member.displayName}</div>
                    <div className="text-sm text-gray-500 capitalize">{member.role}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {activity.length > 0 ? (
              activity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-blue-600">
                      {item.userName.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{item.details}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()} by {item.userName}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}