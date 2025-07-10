import { useState } from 'react'
import { Bell, Search, User, LogOut, Settings, ChevronDown, X } from 'lucide-react'
import { MobileMenuButton } from './Sidebar'
import ExportButton from './ExportButton'
import { LoginModal } from './LoginModal'
import { UserProfile } from './UserProfile'
import { useAuth } from '../contexts/AuthContext'
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
    <header className="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and breadcrumb */}
        <div className="flex items-center space-x-4">
          <MobileMenuButton onClick={onToggleSidebar} />
          
          {/* Breadcrumb or page title on larger screens */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-900">
              Investment Dashboard
            </h1>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center space-x-3">
          {/* Search button */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Search investments"
          >
            <Search className="h-5 w-5 text-gray-500" />
          </button>

          {/* Export button */}
          <div className="hidden md:block">
            <ExportButton 
              stocks={stocks}
              etfs={etfs}
              properties={properties}
            />
          </div>

          {/* Notifications */}
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {/* Notification dot */}
            <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></div>
          </button>

          {/* User menu */}
          <div className="relative">
            {isAuthenticated ? (
              <>
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="User menu"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.givenName || 'User'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
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
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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