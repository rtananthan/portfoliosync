import { 
  PortfolioGroup, 
  GroupMember, 
  Portfolio, 
  GroupAggregation, 
  GroupInvitation, 
  GroupActivity,
  GroupPermissions,
  DEFAULT_PERMISSIONS
} from '../types'

class PortfolioGroupService {
  // private readonly baseUrl = 'https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com'

  // ============ PORTFOLIO GROUPS ============

  async createGroup(groupData: {
    name: string
    description?: string
    type: PortfolioGroup['type']
    color?: string
  }): Promise<PortfolioGroup> {
    // For demo purposes, create a mock group
    const group: PortfolioGroup = {
      id: `group_${Date.now()}`,
      name: groupData.name,
      description: groupData.description,
      type: groupData.type,
      color: groupData.color || '#3B82F6',
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user_id'
    }

    // TODO: Implement real API call
    // const response = await fetch(`${this.baseUrl}/groups`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(groupData)
    // })
    // return response.json()

    return group
  }

  async getUserGroups(): Promise<PortfolioGroup[]> {
    // For demo purposes, return mock groups
    const mockGroups: PortfolioGroup[] = [
      {
        id: 'group_1',
        name: 'Smith Family',
        description: 'Family investment portfolio',
        type: 'family',
        color: '#10B981',
        isDefault: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        createdBy: 'user_1'
      },
      {
        id: 'group_2',
        name: 'Investment Club',
        description: 'Monthly investment group with friends',
        type: 'investment_club',
        color: '#8B5CF6',
        isDefault: false,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        createdBy: 'user_1'
      }
    ]

    // TODO: Implement real API call
    // const response = await fetch(`${this.baseUrl}/groups`)
    // return response.json()

    return mockGroups
  }

  async getGroup(groupId: string): Promise<PortfolioGroup> {
    const groups = await this.getUserGroups()
    const group = groups.find(g => g.id === groupId)
    if (!group) throw new Error('Group not found')
    return group
  }

  async updateGroup(groupId: string, updates: Partial<PortfolioGroup>): Promise<PortfolioGroup> {
    // TODO: Implement real API call
    const group = await this.getGroup(groupId)
    return { ...group, ...updates, updatedAt: new Date().toISOString() }
  }

  async deleteGroup(groupId: string): Promise<void> {
    // TODO: Implement real API call
    console.log(`Deleting group ${groupId}`)
  }

  // ============ GROUP MEMBERS ============

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    // Mock members for demo
    const mockMembers: GroupMember[] = [
      {
        id: 'member_1',
        userId: 'user_1',
        groupId: groupId,
        role: 'owner',
        permissions: DEFAULT_PERMISSIONS.owner,
        displayName: 'John Smith',
        joinedAt: '2024-01-15T10:00:00Z',
        invitedBy: 'user_1',
        status: 'active'
      },
      {
        id: 'member_2',
        userId: 'user_2',
        groupId: groupId,
        role: 'admin',
        permissions: DEFAULT_PERMISSIONS.admin,
        displayName: 'Sarah Smith',
        joinedAt: '2024-01-16T10:00:00Z',
        invitedBy: 'user_1',
        status: 'active'
      }
    ]

    return mockMembers
  }

  async inviteMember(groupId: string, inviteData: {
    email: string
    role: GroupMember['role']
    displayName?: string
    message?: string
    customPermissions?: Partial<GroupPermissions>
  }): Promise<GroupInvitation> {
    // Map owner role to admin for invitation (since GroupInvitation only allows admin|editor|viewer)
    const inviteRole = inviteData.role === 'owner' ? 'admin' : inviteData.role
    
    const invitation: GroupInvitation = {
      id: `invite_${Date.now()}`,
      groupId,
      inviterUserId: 'current_user_id',
      inviterName: 'Current User',
      inviteEmail: inviteData.email,
      role: inviteRole,
      permissions: inviteData.customPermissions 
        ? { ...DEFAULT_PERMISSIONS[inviteData.role], ...inviteData.customPermissions }
        : DEFAULT_PERMISSIONS[inviteData.role],
      status: 'pending',
      message: inviteData.message,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }

    // TODO: Implement real API call and email sending
    return invitation
  }

  async updateMemberPermissions(
    groupId: string, 
    memberId: string, 
    permissions: Partial<GroupPermissions>
  ): Promise<GroupMember> {
    // TODO: Implement real API call
    const members = await this.getGroupMembers(groupId)
    const member = members.find(m => m.id === memberId)
    if (!member) throw new Error('Member not found')
    
    return {
      ...member,
      permissions: { ...member.permissions, ...permissions }
    }
  }

  async removeMember(groupId: string, memberId: string): Promise<void> {
    // TODO: Implement real API call
    console.log(`Removing member ${memberId} from group ${groupId}`)
  }

  // ============ PORTFOLIOS ============

  async getGroupPortfolios(groupId: string): Promise<Portfolio[]> {
    // Mock portfolios for demo
    const mockPortfolios: Portfolio[] = [
      {
        id: 'portfolio_1',
        name: "John's Individual Portfolio",
        groupId,
        ownerId: 'user_1',
        type: 'individual',
        isActive: true,
        baseCurrency: 'AUD',
        riskProfile: 'moderate',
        isPrivate: false,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        description: 'Personal stock and ETF investments'
      },
      {
        id: 'portfolio_2',
        name: 'Joint Investment Account',
        groupId,
        ownerId: 'user_1',
        type: 'joint',
        isActive: true,
        baseCurrency: 'AUD',
        riskProfile: 'conservative',
        isPrivate: false,
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
        description: 'Shared investments for family goals'
      },
      {
        id: 'portfolio_3',
        name: 'Property Portfolio',
        groupId,
        ownerId: 'user_2',
        type: 'joint',
        isActive: true,
        baseCurrency: 'AUD',
        riskProfile: 'moderate',
        isPrivate: false,
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2024-02-01T10:00:00Z',
        description: 'Family real estate investments'
      }
    ]

    return mockPortfolios
  }

  async createPortfolio(groupId: string, portfolioData: {
    name: string
    type: Portfolio['type']
    description?: string
    baseCurrency?: string
    riskProfile?: Portfolio['riskProfile']
    isPrivate?: boolean
  }): Promise<Portfolio> {
    const portfolio: Portfolio = {
      id: `portfolio_${Date.now()}`,
      name: portfolioData.name,
      groupId,
      ownerId: 'current_user_id',
      type: portfolioData.type,
      isActive: true,
      baseCurrency: portfolioData.baseCurrency || 'AUD',
      riskProfile: portfolioData.riskProfile,
      isPrivate: portfolioData.isPrivate || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: portfolioData.description
    }

    // TODO: Implement real API call
    return portfolio
  }

  // ============ AGGREGATION & ANALYTICS ============

  async getGroupAggregation(groupId: string): Promise<GroupAggregation> {
    // Mock aggregated data for demo
    const mockAggregation: GroupAggregation = {
      groupId,
      totalValue: 850000,
      totalReturn: 125000,
      returnPercentage: 17.2,
      stocksValue: 320000,
      etfsValue: 180000,
      propertiesValue: 350000,
      stocksCount: 12,
      etfsCount: 6,
      propertiesCount: 2,
      portfoliosCount: 3,
      activePortfoliosCount: 3,
      membersCount: 2,
      activeMembersCount: 2,
      portfolioPerformance: [
        {
          portfolioId: 'portfolio_1',
          portfolioName: "John's Individual Portfolio",
          ownerName: 'John Smith',
          value: 280000,
          return: 45000,
          returnPercentage: 19.1
        },
        {
          portfolioId: 'portfolio_2',
          portfolioName: 'Joint Investment Account',
          ownerName: 'Joint',
          value: 220000,
          return: 28000,
          returnPercentage: 14.6
        },
        {
          portfolioId: 'portfolio_3',
          portfolioName: 'Property Portfolio',
          ownerName: 'Sarah Smith',
          value: 350000,
          return: 52000,
          returnPercentage: 17.4
        }
      ],
      assetAllocation: {
        stocks: { value: 320000, percentage: 37.6 },
        etfs: { value: 180000, percentage: 21.2 },
        properties: { value: 350000, percentage: 41.2 }
      }
    }

    return mockAggregation
  }

  // ============ ACTIVITY TRACKING ============

  async getGroupActivity(groupId: string, limit: number = 20): Promise<GroupActivity[]> {
    // Mock activity data for demo
    const mockActivity: GroupActivity[] = [
      {
        id: 'activity_1',
        groupId,
        portfolioId: 'portfolio_1',
        userId: 'user_1',
        userName: 'John Smith',
        action: 'added_stock',
        entityType: 'stock',
        entityId: 'stock_1',
        entityName: 'CBA',
        details: 'Added 50 shares of Commonwealth Bank',
        createdAt: '2024-03-15T14:30:00Z'
      },
      {
        id: 'activity_2',
        groupId,
        portfolioId: 'portfolio_3',
        userId: 'user_2',
        userName: 'Sarah Smith',
        action: 'added_property',
        entityType: 'property',
        entityId: 'prop_1',
        entityName: '123 Main St, Melbourne',
        details: 'Added investment property in Melbourne',
        createdAt: '2024-03-14T10:15:00Z'
      },
      {
        id: 'activity_3',
        groupId,
        userId: 'user_1',
        userName: 'John Smith',
        action: 'invited_member',
        entityType: 'member',
        details: 'Invited sarah@example.com to join the group',
        createdAt: '2024-03-10T09:00:00Z'
      }
    ]

    return mockActivity.slice(0, limit)
  }

  async logActivity(groupId: string, activity: Omit<GroupActivity, 'id' | 'createdAt'>): Promise<void> {
    // TODO: Implement real API call for activity logging
    console.log(`Logging activity for group ${groupId}:`, activity)
  }

  // ============ INVITATIONS ============

  async getPendingInvitations(): Promise<GroupInvitation[]> {
    // Mock invitations for demo
    return []
  }

  async respondToInvitation(invitationId: string, response: 'accept' | 'decline'): Promise<void> {
    // TODO: Implement real API call
    console.log(`Responding to invitation ${invitationId}: ${response}`)
  }
}

export default new PortfolioGroupService()