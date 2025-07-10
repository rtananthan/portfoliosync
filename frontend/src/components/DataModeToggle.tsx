import { useState } from 'react'
import { Settings, Database, TestTube } from 'lucide-react'
import { DataMode, ScenarioType, DevTools } from '../services/dataService'
import config from '../config/env'

interface DataModeToggleProps {
  onDataChange?: () => void
}

export default function DataModeToggle({ onDataChange }: DataModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMode, setCurrentMode] = useState<DataMode>(DevTools.getMode())
  const [currentScenario, setCurrentScenario] = useState<ScenarioType>(DevTools.getScenario())

  // Only show in development
  if (config.APP_ENV !== 'development') {
    return null
  }

  const handleModeChange = (mode: DataMode, scenario?: ScenarioType) => {
    DevTools.setMode(mode, scenario)
    setCurrentMode(mode)
    if (scenario) setCurrentScenario(scenario)
    
    // Trigger data refresh in parent component
    if (onDataChange) {
      onDataChange()
    }
    
    setIsOpen(false)
  }

  const scenarios = DevTools.getScenarios()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-colors"
        title="Data Mode Toggle (Development Only)"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Mode</h3>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              DEV ONLY
            </span>
          </div>

          <div className="space-y-3">
            {/* Real Data Mode */}
            <button
              onClick={() => handleModeChange('real')}
              className={`w-full flex items-center p-3 rounded-lg border-2 transition-colors ${
                currentMode === 'real'
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Database className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Real Data</div>
                <div className="text-sm text-gray-600">Live API data</div>
              </div>
            </button>

            {/* Dummy Data Mode */}
            <button
              onClick={() => handleModeChange('dummy')}
              className={`w-full flex items-center p-3 rounded-lg border-2 transition-colors ${
                currentMode === 'dummy'
                  ? 'border-green-500 bg-green-50 text-green-900'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <TestTube className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Dummy Data</div>
                <div className="text-sm text-gray-600">Full test portfolio</div>
              </div>
            </button>

            {/* Scenarios */}
            <div className="border-t pt-3">
              <div className="text-sm font-medium text-gray-700 mb-2">Test Scenarios</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {scenarios.map(({ key, description }) => (
                  <button
                    key={key}
                    onClick={() => handleModeChange('scenario', key)}
                    className={`w-full text-left p-2 rounded border transition-colors text-sm ${
                      currentMode === 'scenario' && currentScenario === key
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="text-xs text-gray-600">{description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="border-t pt-3">
              <div className="text-xs text-gray-600 space-y-1">
                <div><strong>Mode:</strong> {currentMode}</div>
                {currentMode === 'scenario' && (
                  <div><strong>Scenario:</strong> {currentScenario}</div>
                )}
                <div className="mt-2">
                  <button
                    onClick={() => {
                      const summary = DevTools.analyze()
                      console.log('Portfolio Summary:', summary)
                    }}
                    className="text-purple-600 hover:text-purple-800 text-xs underline"
                  >
                    Analyze Portfolio →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleModeChange('scenario', 'balanced')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                Balanced
              </button>
              <button
                onClick={() => handleModeChange('scenario', 'empty')}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                Empty
              </button>
              <button
                onClick={() => handleModeChange('scenario', 'majorGains')}
                className="text-xs bg-green-100 hover:bg-green-200 px-2 py-1 rounded transition-colors text-green-800"
              >
                Major Gains
              </button>
              <button
                onClick={() => handleModeChange('scenario', 'majorLosses')}
                className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors text-red-800"
              >
                Major Losses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}