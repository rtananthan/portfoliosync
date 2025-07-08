import { Stock, ETF, Property } from '../types'

export type ExportFormat = 'csv' | 'json' | 'excel'
export type ExportType = 'all' | 'stocks' | 'etfs' | 'properties'

interface ExportData {
  stocks: Stock[]
  etfs: ETF[]
  properties: Property[]
  metadata: {
    exportDate: string
    totalValue: number
    totalReturn: number
    portfolioCount: {
      stocks: number
      etfs: number
      properties: number
    }
  }
}

// Generate filename with timestamp
function generateFilename(type: ExportType, format: ExportFormat): string {
  const timestamp = new Date().toISOString().split('T')[0]
  const typeStr = type === 'all' ? 'portfolio' : type
  return `portfoliosync-${typeStr}-${timestamp}.${format}`
}

// Convert data to CSV format
function convertToCSV(data: any[], headers: string[]): string {
  const csvHeaders = headers.join(',')
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value ?? ''
    }).join(',')
  )
  
  return [csvHeaders, ...csvRows].join('\n')
}

// Download file helper
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  
  // Cleanup
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export stocks to CSV
export function exportStocksCSV(stocks: Stock[]): void {
  const headers = [
    'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice', 
    'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
    'purchaseFees', 'currency', 'exchange', 'sector', 'daysHeld'
  ]
  
  const csvContent = convertToCSV(stocks, headers)
  const filename = generateFilename('stocks', 'csv')
  
  downloadFile(csvContent, filename, 'text/csv')
}

// Export ETFs to CSV
export function exportETFsCSV(etfs: ETF[]): void {
  const headers = [
    'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice',
    'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
    'purchaseFees', 'expenseRatio', 'currency', 'exchange', 'daysHeld'
  ]
  
  const csvContent = convertToCSV(etfs, headers)
  const filename = generateFilename('etfs', 'csv')
  
  downloadFile(csvContent, filename, 'text/csv')
}

// Export properties to CSV
export function exportPropertiesCSV(properties: Property[]): void {
  const headers = [
    'address', 'propertyType', 'purchasePrice', 'currentValue',
    'totalReturn', 'returnPercentage', 'purchaseDate', 'stampDuty',
    'legalFees', 'councilRates', 'waterRates', 'strataFees', 'landTax',
    'grossRentalYield', 'netRentalYield', 'capitalGrowth', 'annualCashFlow'
  ]
  
  const csvContent = convertToCSV(properties, headers)
  const filename = generateFilename('properties', 'csv')
  
  downloadFile(csvContent, filename, 'text/csv')
}

// Export all data to JSON
export function exportPortfolioJSON(stocks: Stock[], etfs: ETF[], properties: Property[]): void {
  const totalValue = 
    stocks.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0) +
    etfs.reduce((sum, e) => sum + (Number(e.totalValue) || 0), 0) +
    properties.reduce((sum, p) => sum + (Number(p.currentValue) || 0), 0)
  
  const totalReturn = 
    stocks.reduce((sum, s) => sum + (Number(s.totalReturn) || 0), 0) +
    etfs.reduce((sum, e) => sum + (Number(e.totalReturn) || 0), 0) +
    properties.reduce((sum, p) => sum + (Number(p.totalReturn) || 0), 0)

  const exportData: ExportData = {
    stocks,
    etfs,
    properties,
    metadata: {
      exportDate: new Date().toISOString(),
      totalValue,
      totalReturn,
      portfolioCount: {
        stocks: stocks.length,
        etfs: etfs.length,
        properties: properties.length
      }
    }
  }
  
  const jsonContent = JSON.stringify(exportData, null, 2)
  const filename = generateFilename('all', 'json')
  
  downloadFile(jsonContent, filename, 'application/json')
}

// Export to Excel-compatible CSV (with BOM for proper encoding)
export function exportToExcel(data: any[], headers: string[], type: ExportType): void {
  const csvContent = convertToCSV(data, headers)
  // Add BOM for Excel compatibility
  const bomContent = '\uFEFF' + csvContent
  const filename = generateFilename(type, 'csv')
  
  downloadFile(bomContent, filename, 'text/csv;charset=utf-8')
}

// Comprehensive export function
export async function exportPortfolioData(
  stocks: Stock[], 
  etfs: ETF[], 
  properties: Property[], 
  type: ExportType, 
  format: ExportFormat
): Promise<void> {
  try {
    switch (format) {
      case 'csv':
        switch (type) {
          case 'stocks':
            exportStocksCSV(stocks)
            break
          case 'etfs':
            exportETFsCSV(etfs)
            break
          case 'properties':
            exportPropertiesCSV(properties)
            break
          case 'all':
            // Export separate CSV files for each type
            if (stocks.length > 0) exportStocksCSV(stocks)
            if (etfs.length > 0) exportETFsCSV(etfs)
            if (properties.length > 0) exportPropertiesCSV(properties)
            break
        }
        break
        
      case 'json':
        exportPortfolioJSON(stocks, etfs, properties)
        break
        
      case 'excel':
        switch (type) {
          case 'stocks':
            exportToExcel(stocks, [
              'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice', 
              'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
              'purchaseFees', 'currency', 'exchange', 'sector', 'daysHeld'
            ], 'stocks')
            break
          case 'etfs':
            exportToExcel(etfs, [
              'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice',
              'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
              'purchaseFees', 'expenseRatio', 'currency', 'exchange', 'daysHeld'
            ], 'etfs')
            break
          case 'properties':
            exportToExcel(properties, [
              'address', 'propertyType', 'purchasePrice', 'currentValue',
              'totalReturn', 'returnPercentage', 'purchaseDate', 'stampDuty',
              'legalFees', 'councilRates', 'waterRates', 'strataFees', 'landTax',
              'grossRentalYield', 'netRentalYield', 'capitalGrowth', 'annualCashFlow'
            ], 'properties')
            break
          case 'all':
            // Export separate Excel files for each type
            if (stocks.length > 0) exportToExcel(stocks, [
              'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice', 
              'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
              'purchaseFees', 'currency', 'exchange', 'sector', 'daysHeld'
            ], 'stocks')
            if (etfs.length > 0) exportToExcel(etfs, [
              'symbol', 'name', 'quantity', 'purchasePrice', 'currentPrice',
              'totalValue', 'totalReturn', 'returnPercentage', 'purchaseDate',
              'purchaseFees', 'expenseRatio', 'currency', 'exchange', 'daysHeld'
            ], 'etfs')
            if (properties.length > 0) exportToExcel(properties, [
              'address', 'propertyType', 'purchasePrice', 'currentValue',
              'totalReturn', 'returnPercentage', 'purchaseDate', 'stampDuty',
              'legalFees', 'councilRates', 'waterRates', 'strataFees', 'landTax',
              'grossRentalYield', 'netRentalYield', 'capitalGrowth', 'annualCashFlow'
            ], 'properties')
            break
        }
        break
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    throw new Error('Failed to export data. Please try again.')
  }
}

// Generate summary report
export function generateSummaryReport(stocks: Stock[], etfs: ETF[], properties: Property[]): string {
  const totalValue = 
    stocks.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0) +
    etfs.reduce((sum, e) => sum + (Number(e.totalValue) || 0), 0) +
    properties.reduce((sum, p) => sum + (Number(p.currentValue) || 0), 0)
  
  const totalReturn = 
    stocks.reduce((sum, s) => sum + (Number(s.totalReturn) || 0), 0) +
    etfs.reduce((sum, e) => sum + (Number(e.totalReturn) || 0), 0) +
    properties.reduce((sum, p) => sum + (Number(p.totalReturn) || 0), 0)

  const totalReturnPercent = totalValue > 0 ? (totalReturn / (totalValue - totalReturn)) * 100 : 0

  return `
PORTFOLIOSYNC INVESTMENT SUMMARY
Generated: ${new Date().toLocaleString()}

PORTFOLIO OVERVIEW
Total Portfolio Value: $${totalValue.toLocaleString()}
Total Return: $${totalReturn.toLocaleString()}
Total Return %: ${totalReturnPercent.toFixed(2)}%

ASSET BREAKDOWN
Stocks: ${stocks.length} holdings, $${stocks.reduce((sum, s) => sum + (Number(s.totalValue) || 0), 0).toLocaleString()}
ETFs: ${etfs.length} holdings, $${etfs.reduce((sum, e) => sum + (Number(e.totalValue) || 0), 0).toLocaleString()}
Properties: ${properties.length} holdings, $${properties.reduce((sum, p) => sum + (Number(p.currentValue) || 0), 0).toLocaleString()}

TOP PERFORMERS
${stocks.length > 0 ? `Best Stock: ${stocks.sort((a, b) => (Number(b.returnPercentage) || 0) - (Number(a.returnPercentage) || 0))[0]?.symbol || 'N/A'} (${(Number(stocks[0]?.returnPercentage) || 0).toFixed(1)}%)` : 'No stocks'}
${etfs.length > 0 ? `Best ETF: ${etfs.sort((a, b) => (Number(b.returnPercentage) || 0) - (Number(a.returnPercentage) || 0))[0]?.symbol || 'N/A'} (${(Number(etfs[0]?.returnPercentage) || 0).toFixed(1)}%)` : 'No ETFs'}
${properties.length > 0 ? `Best Property: ${properties.sort((a, b) => (Number(b.returnPercentage) || 0) - (Number(a.returnPercentage) || 0))[0]?.address.split(',')[0] || 'N/A'} (${(Number(properties[0]?.returnPercentage) || 0).toFixed(1)}%)` : 'No properties'}
  `.trim()
}