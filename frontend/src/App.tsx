import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import StocksPage from './pages/StocksPage'
import ETFs from './pages/ETFs'
import PropertiesPage from './pages/PropertiesPage'

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stocks" element={<StocksPage />} />
        <Route path="/etfs" element={<ETFs />} />
        <Route path="/properties" element={<PropertiesPage />} />
      </Routes>
    </div>
  )
}

export default App