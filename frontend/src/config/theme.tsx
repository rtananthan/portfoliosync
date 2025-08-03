// Theme configuration for customizable UI colors
import { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  name: string;
  topBar: {
    background: string;
    text: string;
    logo: string;
    hover: string;
  };
  sidebar: {
    background: string;
    text: string;
    border: string;
  };
  accent: string;
  success: string;
  warning: string;
  danger: string;
}

export const themes: Record<string, Theme> = {
  default: {
    name: 'Default Blue',
    topBar: {
      background: 'bg-gradient-to-r from-blue-600 to-blue-700',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200'
    },
    accent: 'blue',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },
  
  dark: {
    name: 'Dark Mode',
    topBar: {
      background: 'bg-gradient-to-r from-gray-800 to-gray-900',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-gray-800',
      text: 'text-gray-100',
      border: 'border-gray-700'
    },
    accent: 'gray',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },

  green: {
    name: 'Growth Green',
    topBar: {
      background: 'bg-gradient-to-r from-green-600 to-emerald-700',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200'
    },
    accent: 'green',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },

  purple: {
    name: 'Premium Purple',
    topBar: {
      background: 'bg-gradient-to-r from-purple-600 to-indigo-700',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200'
    },
    accent: 'purple',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },

  orange: {
    name: 'Energy Orange',
    topBar: {
      background: 'bg-gradient-to-r from-orange-500 to-red-600',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200'
    },
    accent: 'orange',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  },

  slate: {
    name: 'Professional Slate',
    topBar: {
      background: 'bg-gradient-to-r from-slate-700 to-slate-800',
      text: 'text-white',
      logo: 'bg-white bg-opacity-20',
      hover: 'hover:bg-white hover:bg-opacity-20'
    },
    sidebar: {
      background: 'bg-white',
      text: 'text-gray-900',
      border: 'border-gray-200'
    },
    accent: 'slate',
    success: 'green',
    warning: 'yellow',
    danger: 'red'
  }
};

export const defaultTheme = themes.default;

// Theme context and hooks

interface ThemeContextType {
  currentTheme: Theme;
  themeName: string;
  setTheme: (themeName: string) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<string>(() => {
    return localStorage.getItem('portfoliosync-theme') || 'default';
  });

  const currentTheme = themes[themeName] || themes.default;

  const setTheme = (newThemeName: string) => {
    if (themes[newThemeName]) {
      setThemeName(newThemeName);
      localStorage.setItem('portfoliosync-theme', newThemeName);
    }
  };

  useEffect(() => {
    // Apply theme to body for global styles if needed
    document.body.setAttribute('data-theme', themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      themeName,
      setTheme,
      availableThemes: themes
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}