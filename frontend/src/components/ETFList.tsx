import React, { useState } from 'react';
import { ETF } from '../types';
import { etfService } from '../services/etfService';

interface ETFListProps {
  etfs: ETF[];
  onRefresh: () => void;
  onDelete: (etfId: string) => void;
}

const ETFList: React.FC<ETFListProps> = ({ etfs, onRefresh, onDelete }) => {
  const [refreshingPrices, setRefreshingPrices] = useState<Set<string>>(new Set());
  const [deletingETFs, setDeletingETFs] = useState<Set<string>>(new Set());

  const handleRefreshPrice = async (etfId: string, forceRefresh: boolean = false) => {
    setRefreshingPrices(prev => new Set(prev).add(etfId));
    
    try {
      await etfService.refreshETFPrice(etfId, forceRefresh);
      onRefresh(); // Refresh the entire list
    } catch (error) {
      console.error('Failed to refresh ETF price:', error);
      alert('Failed to refresh ETF price. Please try again.');
    } finally {
      setRefreshingPrices(prev => {
        const newSet = new Set(prev);
        newSet.delete(etfId);
        return newSet;
      });
    }
  };

  const handleDelete = async (etfId: string, symbol: string) => {
    if (!window.confirm(`Are you sure you want to delete ${symbol}?`)) {
      return;
    }

    setDeletingETFs(prev => new Set(prev).add(etfId));
    
    try {
      await etfService.deleteETF(etfId);
      onDelete(etfId);
    } catch (error) {
      console.error('Failed to delete ETF:', error);
      alert('Failed to delete ETF. Please try again.');
    } finally {
      setDeletingETFs(prev => {
        const newSet = new Set(prev);
        newSet.delete(etfId);
        return newSet;
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    const isPositive = percentage >= 0;
    const color = isPositive ? 'text-green-600' : 'text-red-600';
    const sign = isPositive ? '+' : '';
    
    return (
      <span className={color}>
        {sign}{percentage.toFixed(2)}%
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (etfs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ETFs found. Add your first ETF to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">ETFs</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ETF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Holdings
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purchase
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expense Ratio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {etfs.map((etf) => (
              <tr key={etf.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{etf.symbol}</div>
                    <div className="text-sm text-gray-500">{etf.name}</div>
                    {etf.category && (
                      <div className="text-xs text-gray-400">{etf.category}</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{etf.quantity} shares</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(etf.purchaseDate)}
                  </div>
                  {etf.daysHeld && (
                    <div className="text-xs text-gray-400">{etf.daysHeld} days</div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(etf.purchasePrice, etf.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: {formatCurrency(etf.totalCostBasis, etf.currency)}
                  </div>
                  {etf.purchaseFees && etf.purchaseFees > 0 && (
                    <div className="text-xs text-gray-400">
                      Fees: {formatCurrency(etf.purchaseFees, etf.currency)}
                    </div>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(etf.currentPrice, etf.currency)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Total: {formatCurrency(etf.totalValue, etf.currency)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium">
                    {formatPercentage(etf.returnPercentage)}
                  </div>
                  <div className={`text-sm ${etf.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {etf.totalReturn >= 0 ? '+' : ''}
                    {formatCurrency(etf.totalReturn, etf.currency)}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  {etf.expenseRatio ? (
                    <div>
                      <div className="text-sm text-gray-900">{etf.expenseRatio}%</div>
                      {etf.annualExpenseCost && (
                        <div className="text-sm text-gray-500">
                          Cost: {formatCurrency(etf.annualExpenseCost, etf.currency)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">N/A</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleRefreshPrice(etf.id, true)}
                      disabled={refreshingPrices.has(etf.id)}
                      className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                      title="Refresh price"
                    >
                      {refreshingPrices.has(etf.id) ? '⟳' : '↻'}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(etf.id, etf.symbol)}
                      disabled={deletingETFs.has(etf.id)}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                      title="Delete ETF"
                    >
                      {deletingETFs.has(etf.id) ? '...' : '×'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Section */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-900">Total Value: </span>
            <span className="text-gray-600">
              {formatCurrency(etfs.reduce((sum, etf) => sum + etf.totalValue, 0))}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Total Cost: </span>
            <span className="text-gray-600">
              {formatCurrency(etfs.reduce((sum, etf) => sum + etf.totalCostBasis, 0))}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Total Return: </span>
            <span className={etfs.reduce((sum, etf) => sum + etf.totalReturn, 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(etfs.reduce((sum, etf) => sum + etf.totalReturn, 0))}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-900">Avg Return: </span>
            <span className="text-gray-600">
              {formatPercentage(
                etfs.length > 0 
                  ? etfs.reduce((sum, etf) => sum + etf.returnPercentage, 0) / etfs.length
                  : 0
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETFList;