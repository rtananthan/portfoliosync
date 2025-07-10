import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Menu, 
  X, 
  Home, 
  TrendingUp, 
  BarChart3, 
  Building, 
  PieChart,
  Settings,
  FileDown,
  HelpCircle,
  User,
  ChevronRight,
  DollarSign,
  Users
} from 'lucide-react'
import config from '../config/env'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

const navigationItems = [
  {
    category: 'Overview',
    items: [
      { name: 'Dashboard', path: '/', icon: Home, description: 'Portfolio overview' },
      { name: 'Portfolio Groups', path: '/groups', icon: Users, description: 'Family & team portfolios' },
      { name: 'Analytics', path: '/benchmark', icon: PieChart, description: 'Performance analysis' }
    ]
  },
  {
    category: 'Investments',
    items: [
      { name: 'Stocks', path: '/stocks', icon: TrendingUp, description: 'Stock portfolio' },
      { name: 'ETFs', path: '/etfs', icon: BarChart3, description: 'ETF holdings' },
      { name: 'Properties', path: '/properties', icon: Building, description: 'Real estate' }
    ]
  },
  {
    category: 'Tools',
    items: [
      { name: 'Export Data', path: '/export', icon: FileDown, description: 'Download reports' },
      { name: 'Tax Reports', path: '/tax', icon: DollarSign, description: 'Tax calculations' }
    ]
  },
  {
    category: 'Account',
    items: [
      { name: 'Settings', path: '/settings', icon: Settings, description: 'App preferences' },
      { name: 'Profile', path: '/profile', icon: User, description: 'Account details' },
      { name: 'Help', path: '/help', icon: HelpCircle, description: 'Support & guides' }
    ]
  }
]

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const isActiveRoute = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
        style={{ width: '280px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">PortfolioSync</h1>
              <p className="text-xs text-gray-500">v{config.APP_VERSION}</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6">
          <nav className="px-4 space-y-8">
            {navigationItems.map((category) => (
              <div key={category.category}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {category.category}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => {
                    const isActive = isActiveRoute(item.path)
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`group flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                        onMouseEnter={() => setHoveredItem(item.path)}
                        onMouseLeave={() => setHoveredItem(null)}
                        onClick={() => {
                          // Close sidebar on mobile after navigation
                          if (window.innerWidth < 1024) {
                            onToggle()
                          }
                        }}
                      >
                        <Icon 
                          className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors ${
                            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                          }`} 
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate">{item.name}</span>
                            {(isActive || hoveredItem === item.path) && (
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            )}
                          </div>
                          {hoveredItem === item.path && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Environment: {config.APP_ENV}</div>
            {config.APP_ENV === 'development' && (
              <div className="text-orange-600">
                Dev Tools: Open console for portfolioDevTools
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Mobile burger button component
interface MobileMenuButtonProps {
  onClick: () => void
}

export function MobileMenuButton({ onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Open navigation menu"
    >
      <Menu className="h-6 w-6 text-gray-700" />
    </button>
  )
}