import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import TopNavigation from './TopNavigation'
import DataModeToggle from './DataModeToggle'
import { Stock, ETF, Property } from '../types'

interface LayoutProps {
  children: React.ReactNode
  stocks?: Stock[]
  etfs?: ETF[]
  properties?: Property[]
  onDataChange?: () => void
}

export default function Layout({ 
  children, 
  stocks = [], 
  etfs = [], 
  properties = [],
  onDataChange 
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [])

  // Handle window resize - keep sidebar state consistent
  useEffect(() => {
    const handleResize = () => {
      // Optional: could add responsive behavior here if needed
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
      />

      {/* Main content area - full width since sidebar is fixed */}
      <div className="flex flex-col h-full">
        {/* Top Navigation */}
        <TopNavigation 
          onToggleSidebar={toggleSidebar}
          stocks={stocks}
          etfs={etfs}
          properties={properties}
        />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>

        {/* Data Mode Toggle (Development Only) */}
        <DataModeToggle onDataChange={onDataChange} />
      </div>
    </div>
  )
}