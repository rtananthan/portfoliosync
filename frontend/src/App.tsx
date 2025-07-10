import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense, useState, useEffect } from 'react'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import DataService from './services/dataService'
import { Stock, ETF, Property } from './types'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const StocksPage = lazy(() => import('./pages/StocksPage'))
const ETFs = lazy(() => import('./pages/ETFs'))
const Properties = lazy(() => import('./pages/Properties'))
const BenchmarkPage = lazy(() => import('./pages/BenchmarkPage'))
const PortfolioGroupsPage = lazy(() => import('./pages/PortfolioGroupsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [etfs, setETFs] = useState<ETF[]>([])
  const [properties, setProperties] = useState<Property[]>([])

  // Load portfolio data for navigation context
  const loadPortfolioData = async () => {
    try {
      const [stocksData, etfsData, propertiesData] = await Promise.allSettled([
        DataService.getStocks(),
        DataService.getETFs(),
        DataService.getProperties()
      ])

      setStocks(stocksData.status === 'fulfilled' ? stocksData.value : [])
      setETFs(etfsData.status === 'fulfilled' ? etfsData.value : [])
      setProperties(propertiesData.status === 'fulfilled' ? propertiesData.value : [])
    } catch (error) {
      console.error('Failed to load portfolio data for navigation:', error)
    }
  }

  useEffect(() => {
    loadPortfolioData()
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProtectedRoute requireAuth={(import.meta as any).env.VITE_AUTH_ENABLED !== 'false'}>
          <Layout 
            stocks={stocks}
            etfs={etfs}
            properties={properties}
            onDataChange={loadPortfolioData}
          >
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/stocks" element={<StocksPage />} />
                <Route path="/etfs" element={<ETFs />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/benchmark" element={<BenchmarkPage />} />
                <Route path="/groups" element={<PortfolioGroupsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </ProtectedRoute>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App