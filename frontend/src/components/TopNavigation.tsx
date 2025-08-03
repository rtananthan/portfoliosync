import { useState } from 'react'
import { Bell, Search, User, LogOut, Settings, ChevronDown, X, TrendingUp } from 'lucide-react'
import { MobileMenuButton } from './Sidebar'
import ExportButton from './ExportButton'
import ThemeSelector from './ThemeSelector'
import { LoginModal } from './LoginModal'
import { UserProfile } from './UserProfile'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../config/theme'
import { Stock, ETF, Property } from '../types'

interface TopNavigationProps {
  onToggleSidebar: () => void
  stocks?: Stock[]
  etfs?: ETF[]
  properties?: Property[]
}

export default function TopNavigation({ 
  onToggleSidebar, 
  stocks = [], 
  etfs = [], 
  properties = [] 
}: TopNavigationProps) {
  const { isAuthenticated, user, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };
  return (
    <header className={`${currentTheme.topBar.background} border-b border-opacity-30 px-4 py-3 lg:px-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and brand */}
        <div className="flex items-center space-x-4">
          <MobileMenuButton onClick={onToggleSidebar} />
          
          {/* Brand logo and name */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center w-8 h-8 ${currentTheme.topBar.logo} rounded-lg`}>
              <TrendingUp className={`h-5 w-5 ${currentTheme.topBar.text}`} />
            </div>
            <div className="flex flex-col">
              <h1 className={`text-lg font-bold ${currentTheme.topBar.text}`}>
                PortfolioSync
              </h1>
              <p className={`text-xs ${currentTheme.topBar.text} opacity-75 hidden sm:block`}>
                Smart Investment Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* Theme selector */}
          <ThemeSelector />

          {/* Search button */}
          <button 
            className={`p-2 rounded-lg ${currentTheme.topBar.hover} transition-colors`}
            title="Search investments"
          >
            <Search className={`h-5 w-5 ${currentTheme.topBar.text}`} />
          </button>

          {/* Export button */}
          <div className="hidden md:block">
            <div className={`[&>button]:${currentTheme.topBar.logo} [&>button]:${currentTheme.topBar.text} [&>button]:border-white [&>button]:border-opacity-30 [&>button:hover]:bg-opacity-30`}>
              <ExportButton 
                stocks={stocks}
                etfs={etfs}
                properties={properties}
              />
            </div>
          </div>

          {/* Notifications */}
          <button 
            className={`p-2 rounded-lg ${currentTheme.topBar.hover} transition-colors relative`}
            title="Notifications"
          >
            <Bell className={`h-5 w-5 ${currentTheme.topBar.text}`} />
            {/* Notification dot */}
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-400 rounded-full"></div>
          </button>

          {/* User menu */}
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${currentTheme.topBar.hover} transition-colors`}
                  title="User menu"
                >
                  <div className={`w-8 h-8 ${currentTheme.topBar.logo} rounded-full flex items-center justify-center`}>
                    <User className={`h-4 w-4 ${currentTheme.topBar.text}`} />
                  </div>
                  <span className={`hidden md:block text-sm font-medium ${currentTheme.topBar.text}`}>
                    {user?.givenName || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 ${currentTheme.topBar.text}`} />
                </button>

                {/* User dropdown menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 text-sm text-gray-700 border-b">
                        <div className="font-medium">{user?.givenName} {user?.familyName}</div>
                        <div className="text-gray-500">{user?.email}</div>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button 
                onClick={() => setShowLoginModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 ${currentTheme.topBar.logo} ${currentTheme.topBar.text} rounded-lg ${currentTheme.topBar.hover} transition-colors border border-white border-opacity-30`}
              >
                <User className="h-4 w-4" />
                <span className="hidden md:block text-sm font-medium">
                  Sign In
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />

      {/* User Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <UserProfile />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}