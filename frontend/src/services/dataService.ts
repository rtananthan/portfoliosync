// Data service to manage real vs dummy data for testing
import { Stock, ETF, Property } from '../types'
import { stocksService, ensureDefaultPortfolio } from './stocksService'
import { etfService } from './etfService'
import { propertyService } from './propertyService'
import { 
  DUMMY_STOCKS, 
  DUMMY_ETFS, 
  DUMMY_PROPERTIES, 
  SCENARIO_DATA,
  calculatePortfolioTotals 
} from '../data/dummyData'
import config from '../config/env'

export type DataMode = 'real' | 'dummy' | 'scenario'
export type ScenarioType = keyof typeof SCENARIO_DATA

// Data mode configuration
let currentDataMode: DataMode = config.APP_ENV === 'development' ? 'dummy' : 'real'
let currentScenario: ScenarioType = 'balanced'

// Data mode management
export const setDataMode = (mode: DataMode, scenario?: ScenarioType) => {
  currentDataMode = mode
  if (scenario && mode === 'scenario') {
    currentScenario = scenario
  }
  console.log(`Data mode set to: ${mode}${scenario ? ` (${scenario})` : ''}`)
}

export const getDataMode = () => currentDataMode
export const getCurrentScenario = () => currentScenario

// Enhanced data service that can return real or dummy data
export class DataService {
  // Stocks
  static async getStocks(portfolioId?: string): Promise<Stock[]> {
    switch (currentDataMode) {
      case 'real':
        const defaultPortfolioId = portfolioId || await ensureDefaultPortfolio()
        return await stocksService.getStocks(defaultPortfolioId)
      
      case 'dummy':
        return DUMMY_STOCKS
      
      case 'scenario':
        const scenarioData = SCENARIO_DATA[currentScenario]
        if ('stocks' in scenarioData) {
          return scenarioData.stocks
        }
        return Array.isArray(scenarioData) 
          ? scenarioData.filter(item => 'symbol' in item && 'dividendYield' in item) as Stock[]
          : []
      
      default:
        return []
    }
  }

  static async addStock(stock: Omit<Stock, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stock> {
    if (currentDataMode === 'real') {
      // Use the correct service method with portfolio ID
      const portfolioId = await ensureDefaultPortfolio()
      return await stocksService.addStock(portfolioId, stock as any)
    }
    
    // For dummy/scenario mode, just return with mock ID
    const newStock: Stock = {
      ...stock,
      id: `dummy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('Dummy mode: Stock added (not persisted)', newStock)
    return newStock
  }

  static async updateStock(id: string, updates: Partial<Stock>): Promise<Stock> {
    if (currentDataMode === 'real') {
      return await stocksService.updateStock(id, updates)
    }
    
    // For dummy mode, find and update in memory
    const stock = DUMMY_STOCKS.find(s => s.id === id)
    if (!stock) throw new Error('Stock not found')
    
    const updatedStock = { ...stock, ...updates, updatedAt: new Date().toISOString() }
    console.log('Dummy mode: Stock updated (not persisted)', updatedStock)
    return updatedStock
  }

  static async deleteStock(id: string): Promise<void> {
    if (currentDataMode === 'real') {
      return await stocksService.deleteStock(id)
    }
    
    console.log('Dummy mode: Stock deleted (not persisted)', id)
  }

  // ETFs
  static async getETFs(portfolioId?: string): Promise<ETF[]> {
    switch (currentDataMode) {
      case 'real':
        const defaultPortfolioId = portfolioId || await ensureDefaultPortfolio()
        return await etfService.getETFs(defaultPortfolioId)
      
      case 'dummy':
        return DUMMY_ETFS
      
      case 'scenario':
        const scenarioData = SCENARIO_DATA[currentScenario]
        if ('etfs' in scenarioData) {
          return scenarioData.etfs
        }
        return Array.isArray(scenarioData) 
          ? scenarioData.filter(item => 'symbol' in item && 'expenseRatio' in item) as ETF[]
          : []
      
      default:
        return []
    }
  }

  static async addETF(etf: Omit<ETF, 'id' | 'createdAt' | 'updatedAt'>): Promise<ETF> {
    if (currentDataMode === 'real') {
      const portfolioId = await ensureDefaultPortfolio()
      return await etfService.createETF(portfolioId, etf as any)
    }
    
    const newETF: ETF = {
      ...etf,
      id: `dummy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('Dummy mode: ETF added (not persisted)', newETF)
    return newETF
  }

  static async updateETF(id: string, updates: Partial<ETF>): Promise<ETF> {
    if (currentDataMode === 'real') {
      return await etfService.updateETF(id, updates)
    }
    
    const etf = DUMMY_ETFS.find(e => e.id === id)
    if (!etf) throw new Error('ETF not found')
    
    const updatedETF = { ...etf, ...updates, updatedAt: new Date().toISOString() }
    console.log('Dummy mode: ETF updated (not persisted)', updatedETF)
    return updatedETF
  }

  static async deleteETF(id: string): Promise<void> {
    if (currentDataMode === 'real') {
      return await etfService.deleteETF(id)
    }
    
    console.log('Dummy mode: ETF deleted (not persisted)', id)
  }

  // Properties
  static async getProperties(portfolioId?: string): Promise<Property[]> {
    switch (currentDataMode) {
      case 'real':
        const defaultPortfolioId = portfolioId || await ensureDefaultPortfolio()
        return await propertyService.getProperties(defaultPortfolioId)
      
      case 'dummy':
        return DUMMY_PROPERTIES
      
      case 'scenario':
        const scenarioData = SCENARIO_DATA[currentScenario]
        if ('properties' in scenarioData) {
          return scenarioData.properties
        }
        return []
      
      default:
        return []
    }
  }

  static async addProperty(property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
    if (currentDataMode === 'real') {
      const portfolioId = await ensureDefaultPortfolio()
      return await propertyService.createProperty(portfolioId, property as any)
    }
    
    const newProperty: Property = {
      ...property,
      id: `dummy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('Dummy mode: Property added (not persisted)', newProperty)
    return newProperty
  }

  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    if (currentDataMode === 'real') {
      return await propertyService.updateProperty(id, updates)
    }
    
    const property = DUMMY_PROPERTIES.find(p => p.id === id)
    if (!property) throw new Error('Property not found')
    
    const updatedProperty = { ...property, ...updates, updatedAt: new Date().toISOString() }
    console.log('Dummy mode: Property updated (not persisted)', updatedProperty)
    return updatedProperty
  }

  static async deleteProperty(id: string): Promise<void> {
    if (currentDataMode === 'real') {
      return await propertyService.deleteProperty(id)
    }
    
    console.log('Dummy mode: Property deleted (not persisted)', id)
  }

  // Utility methods
  static getPortfolioSummary() {
    if (currentDataMode === 'dummy' || currentDataMode === 'scenario') {
      const totals = calculatePortfolioTotals()
      return {
        totalValue: totals.portfolio.total,
        totalReturn: totals.portfolio.return,
        totalReturnPercentage: totals.portfolio.returnPercentage,
        assetBreakdown: {
          stocks: totals.stocks,
          etfs: totals.etfs,
          properties: totals.properties
        },
        dataMode: currentDataMode,
        scenario: currentDataMode === 'scenario' ? currentScenario : undefined
      }
    }
    
    return {
      dataMode: currentDataMode,
      message: 'Real data mode - summary not available'
    }
  }

  static getAvailableScenarios() {
    return Object.keys(SCENARIO_DATA).map(key => ({
      key: key as ScenarioType,
      description: getScenarioDescription(key as ScenarioType)
    }))
  }
}

// Helper function to describe scenarios
function getScenarioDescription(scenario: ScenarioType): string {
  const descriptions: Record<ScenarioType, string> = {
    empty: 'Empty portfolio - no investments',
    singleStock: 'Single stock holding only',
    majorLosses: 'Portfolio with significant losses',
    majorGains: 'Portfolio with major gains',
    balanced: 'Balanced diversified portfolio'
  }
  
  return descriptions[scenario] || 'Unknown scenario'
}

// Dev tools for easy testing
export const DevTools = {
  setMode: setDataMode,
  getMode: getDataMode,
  getScenario: getCurrentScenario,
  getSummary: () => DataService.getPortfolioSummary(),
  getScenarios: () => DataService.getAvailableScenarios(),
  
  // Quick switches
  useReal: () => setDataMode('real'),
  useDummy: () => setDataMode('dummy'),
  useEmpty: () => setDataMode('scenario', 'empty'),
  useBalanced: () => setDataMode('scenario', 'balanced'),
  useLosses: () => setDataMode('scenario', 'majorLosses'),
  useGains: () => setDataMode('scenario', 'majorGains'),
  
  // Portfolio analytics
  analyze: () => {
    const summary = DataService.getPortfolioSummary()
    console.log('Portfolio Analysis:', summary)
    return summary
  }
}

// Make DevTools available globally in development
if (config.APP_ENV === 'development') {
  (window as any).portfolioDevTools = DevTools
  console.log('Portfolio Dev Tools available at: window.portfolioDevTools')
  console.log('Try: portfolioDevTools.useBalanced(), portfolioDevTools.analyze()')
}

export default DataService