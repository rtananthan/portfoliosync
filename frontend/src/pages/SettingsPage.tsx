import { useState } from 'react'
import { Save, User, Bell, Shield, Database, Palette } from 'lucide-react'
import { DevTools } from '../services/dataService'
import config from '../config/env'

interface SettingSection {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  component: React.ComponentType<any>
}

// Account Settings Component
const AccountSettings = () => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Display Name
      </label>
      <input
        type="text"
        defaultValue="Demo User"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address
      </label>
      <input
        type="email"
        defaultValue="demo@portfoliosync.com"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Currency Preference
      </label>
      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
        <option value="AUD">Australian Dollar (AUD)</option>
        <option value="USD">US Dollar (USD)</option>
        <option value="EUR">Euro (EUR)</option>
        <option value="GBP">British Pound (GBP)</option>
      </select>
    </div>
  </div>
)

// Notifications Settings Component
const NotificationSettings = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">Price Alerts</h4>
        <p className="text-sm text-gray-500">Get notified when your investments hit target prices</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">Weekly Reports</h4>
        <p className="text-sm text-gray-500">Receive portfolio performance summaries</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>

    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-sm font-medium text-gray-900">Market News</h4>
        <p className="text-sm text-gray-500">Stay updated with relevant market developments</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  </div>
)

// Data & Privacy Settings Component
const DataSettings = () => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Data Mode</h4>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="radio" name="dataMode" value="real" className="text-blue-600" defaultChecked />
          <span className="ml-2 text-sm text-gray-700">Live API Data</span>
        </label>
        <label className="flex items-center">
          <input type="radio" name="dataMode" value="demo" className="text-blue-600" />
          <span className="ml-2 text-sm text-gray-700">Demo Data (for testing)</span>
        </label>
      </div>
    </div>

    <div className="pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-3">Data Export</h4>
      <p className="text-sm text-gray-500 mb-4">Download your portfolio data for backup or external analysis</p>
      <div className="space-y-2">
        <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm font-medium">Export All Data (JSON)</span>
        </button>
        <button className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <span className="text-sm font-medium">Export Portfolio Summary (CSV)</span>
        </button>
      </div>
    </div>
  </div>
)

// Appearance Settings Component
const AppearanceSettings = () => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Theme</h4>
      <div className="grid grid-cols-3 gap-3">
        <button className="p-3 border border-blue-500 bg-blue-50 rounded-lg text-center">
          <div className="text-sm font-medium text-gray-900">Light</div>
        </button>
        <button className="p-3 border border-gray-300 rounded-lg text-center hover:border-gray-400">
          <div className="text-sm font-medium text-gray-900">Dark</div>
        </button>
        <button className="p-3 border border-gray-300 rounded-lg text-center hover:border-gray-400">
          <div className="text-sm font-medium text-gray-900">Auto</div>
        </button>
      </div>
    </div>

    <div>
      <h4 className="text-sm font-medium text-gray-900 mb-3">Chart Display</h4>
      <div className="space-y-2">
        <label className="flex items-center">
          <input type="checkbox" defaultChecked className="text-blue-600" />
          <span className="ml-2 text-sm text-gray-700">Show percentage changes</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" defaultChecked className="text-blue-600" />
          <span className="ml-2 text-sm text-gray-700">Display benchmarks</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" className="text-blue-600" />
          <span className="ml-2 text-sm text-gray-700">Compact view</span>
        </label>
      </div>
    </div>
  </div>
)

// Development Settings (only shown in dev mode)
const DevelopmentSettings = () => {
  const [currentMode, setCurrentMode] = useState(DevTools.getMode())
  
  return (
    <div className="space-y-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
      <div className="flex items-center space-x-2">
        <Database className="h-5 w-5 text-orange-600" />
        <h4 className="text-sm font-medium text-orange-900">Development Mode</h4>
      </div>

      <div>
        <label className="block text-sm font-medium text-orange-800 mb-2">
          Data Source
        </label>
        <select 
          value={currentMode}
          onChange={(e) => {
            const mode = e.target.value as any
            DevTools.setMode(mode)
            setCurrentMode(mode)
          }}
          className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        >
          <option value="real">Real API Data</option>
          <option value="dummy">Full Dummy Portfolio</option>
          <option value="scenario">Test Scenarios</option>
        </select>
      </div>

      <div className="text-xs text-orange-700">
        Current Environment: {config.APP_ENV}<br />
        API Base URL: {config.API_BASE_URL}<br />
        Build Version: {config.APP_VERSION}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account')

  const sections: SettingSection[] = [
    {
      id: 'account',
      title: 'Account',
      description: 'Manage your profile and preferences',
      icon: User,
      component: AccountSettings
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure alerts and updates',
      icon: Bell,
      component: NotificationSettings
    },
    {
      id: 'appearance',
      title: 'Appearance',
      description: 'Theme and display options',
      icon: Palette,
      component: AppearanceSettings
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      description: 'Data management and privacy settings',
      icon: Shield,
      component: DataSettings
    }
  ]

  // Add development section if in development mode
  if (config.APP_ENV === 'development') {
    sections.push({
      id: 'development',
      title: 'Development',
      description: 'Developer tools and debugging',
      icon: Database,
      component: DevelopmentSettings
    })
  }

  const ActiveComponent = sections.find(s => s.id === activeSection)?.component || AccountSettings

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account preferences and application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${
                      activeSection === section.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <div className="font-medium">{section.title}</div>
                      <div className="text-xs text-gray-500">{section.description}</div>
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {sections.find(s => s.id === activeSection)?.title}
              </h2>
              <p className="text-gray-600 mt-1">
                {sections.find(s => s.id === activeSection)?.description}
              </p>
            </div>

            <ActiveComponent />

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Changes are saved automatically
                </p>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}