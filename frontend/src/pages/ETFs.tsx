import React, { useState, useEffect } from 'react';
import { ETF, CreateETFRequest } from '../types';
import { etfService } from '../services/etfService';
import { ensureDefaultPortfolio } from '../services/stocksService';
import ETFList from '../components/ETFList';
import ETFForm from '../components/ETFForm';

const ETFs: React.FC = () => {
  const [etfs, setETFs] = useState<ETF[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [portfolioId, setPortfolioId] = useState<string>('');

  useEffect(() => {
    fetchETFs();
  }, []);

  const fetchETFs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a portfolio to work with
      const defaultPortfolioId = await ensureDefaultPortfolio();
      setPortfolioId(defaultPortfolioId);
      
      // Load ETFs for this portfolio
      const etfData = await etfService.getETFs(defaultPortfolioId);
      setETFs(etfData);
    } catch (err) {
      setError('Failed to load ETFs. Please try again.');
      console.error('Error fetching ETFs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddETF = async (etfData: CreateETFRequest) => {
    try {
      setSubmitting(true);
      await etfService.createETF(portfolioId, etfData);
      setShowForm(false);
      await fetchETFs(); // Refresh the list
    } catch (err) {
      console.error('Error adding ETF:', err);
      alert('Failed to add ETF. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteETF = (etfId: string) => {
    setETFs(prev => prev.filter(etf => etf.id !== etfId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ETFs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading ETFs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchETFs}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              ETFs
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your Exchange Traded Fund investments with expense ratios and distributions
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <button
              onClick={() => setShowForm(true)}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add ETF
            </button>
          </div>
        </div>

        {/* ETF Statistics */}
        {etfs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total ETFs</dt>
                      <dd className="text-lg font-medium text-gray-900">{etfs.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Value</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ${etfs.reduce((sum, etf) => sum + etf.totalValue, 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${
                      etfs.reduce((sum, etf) => sum + etf.totalReturn, 0) >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Return</dt>
                      <dd className={`text-lg font-medium ${
                        etfs.reduce((sum, etf) => sum + etf.totalReturn, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        ${etfs.reduce((sum, etf) => sum + etf.totalReturn, 0).toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Expense Ratio</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {etfs.filter(etf => etf.expenseRatio).length > 0 ? 
                          `${(etfs.filter(etf => etf.expenseRatio).reduce((sum, etf) => sum + (etf.expenseRatio || 0), 0) / etfs.filter(etf => etf.expenseRatio).length).toFixed(2)}%`
                          : 'N/A'
                        }
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ETF List */}
        <ETFList
          etfs={etfs}
          onRefresh={fetchETFs}
          onDelete={handleDeleteETF}
        />

        {/* Add ETF Form Modal */}
        {showForm && (
          <ETFForm
            onSubmit={handleAddETF}
            onCancel={() => setShowForm(false)}
            isSubmitting={submitting}
          />
        )}
      </div>
    </div>
  );
};

export default ETFs;