import React, { useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '../config/theme';

const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

  const handleThemeChange = (newThemeName: string) => {
    setTheme(newThemeName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors ${currentTheme.topBar.hover}`}
        title="Change theme"
      >
        <Palette className={`h-5 w-5 ${currentTheme.topBar.text}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          {/* Theme selection dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40">
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Choose Theme</h3>
              <p className="text-xs text-gray-500">Customize your app appearance</p>
            </div>

            <div className="p-2 max-h-80 overflow-y-auto">
              {Object.entries(availableThemes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50 ${
                    themeName === key ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Theme preview */}
                    <div className="flex space-x-1">
                      <div 
                        className={`w-4 h-4 rounded-full ${theme.topBar.background.replace('bg-gradient-to-r from-', 'bg-').split(' ')[0]}`}
                      />
                      <div className={`w-4 h-4 rounded-full ${theme.sidebar.background}`} />
                    </div>
                    
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {theme.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {key === 'default' && 'Classic blue theme'}
                        {key === 'dark' && 'Dark mode'}
                        {key === 'green' && 'Growth focused'}
                        {key === 'purple' && 'Premium look'}
                        {key === 'orange' && 'High energy'}
                        {key === 'slate' && 'Professional'}
                      </div>
                    </div>
                  </div>

                  {themeName === key && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-lg">
              <p className="text-xs text-gray-600 text-center">
                Theme preference is saved locally
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;