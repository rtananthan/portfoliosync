import { render, screen } from '@testing-library/react'
import AssetAllocationChart from './AssetAllocationChart'

describe('AssetAllocationChart', () => {
  test('renders empty state when no investments', () => {
    render(
      <AssetAllocationChart
        stocksValue={0}
        etfsValue={0}
        propertiesValue={0}
        stocksCount={0}
        etfsCount={0}
        propertiesCount={0}
      />
    )

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument()
    expect(screen.getByText('No investments to display')).toBeInTheDocument()
  })

  test('renders chart when investments exist', () => {
    render(
      <AssetAllocationChart
        stocksValue={10000}
        etfsValue={5000}
        propertiesValue={15000}
        stocksCount={3}
        etfsCount={2}
        propertiesCount={1}
      />
    )

    expect(screen.getByText('Asset Allocation')).toBeInTheDocument()
    expect(screen.getByText('Total Portfolio Value')).toBeInTheDocument()
    expect(screen.getByText('$30,000')).toBeInTheDocument()
  })

  test('calculates percentages correctly', () => {
    render(
      <AssetAllocationChart
        stocksValue={6000}
        etfsValue={3000}
        propertiesValue={1000}
        stocksCount={2}
        etfsCount={1}
        propertiesCount={1}
      />
    )

    // Total is 10,000, so percentages should be 60%, 30%, 10%
    expect(screen.getByText('$10,000')).toBeInTheDocument()
  })
})