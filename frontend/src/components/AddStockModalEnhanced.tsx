import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { CreateStockRequest } from '../types';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stockData: CreateStockRequest) => Promise<void>;
  isLoading?: boolean;
}

export default function AddStockModalEnhanced({ isOpen, onClose, onSubmit, isLoading = false }: AddStockModalProps) {
  const [formData, setFormData] = useState<CreateStockRequest>({
    symbol: '',
    name: '',
    quantity: 0,
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseFees: 0,
    currentPrice: 0,
    currency: 'USD',
    exchange: '',
    sector: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Stock symbol is required';
    }
    
    if (formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    
    if (!formData.purchaseDate) {
      newErrors.purchaseDate = 'Purchase date is required';
    }
    
    if (formData.currentPrice && formData.currentPrice <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Set current price to purchase price if not provided
      const submitData = {
        ...formData,
        symbol: formData.symbol.toUpperCase(),
        currentPrice: formData.currentPrice || formData.purchasePrice
      };
      
      await onSubmit(submitData);
      
      // Reset form and close modal on success
      setFormData({
        symbol: '',
        name: '',
        quantity: 0,
        purchasePrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseFees: 0,
        currentPrice: 0,
        currency: 'USD',
        exchange: '',
        sector: ''
      });
      setErrors({});
      
      // Add a small delay to ensure the API call completes
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error adding stock:', error);
      setErrors({ submit: 'Failed to add stock. Please try again.' });
    }
  };

  const handleInputChange = (field: keyof CreateStockRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Plus className="h-5 w-5 text-blue-500 mr-2" />
            Add Stock Investment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock Symbol */}
            <div>
              <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-1">
                Stock Symbol *
              </label>
              <input
                type="text"
                id="symbol"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, GOOGL"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.symbol ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Apple Inc."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity || ''}
                onChange={(e) => handleInputChange('quantity', Number(e.target.value))}
                placeholder="100"
                min="0.000001"
                step="0.000001"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            {/* Purchase Price */}
            <div>
              <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Price ($) *
              </label>
              <input
                type="number"
                id="purchasePrice"
                value={formData.purchasePrice || ''}
                onChange={(e) => handleInputChange('purchasePrice', Number(e.target.value))}
                placeholder="150.00"
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.purchasePrice ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.purchasePrice && <p className="text-red-500 text-sm mt-1">{errors.purchasePrice}</p>}
            </div>

            {/* Purchase Date */}
            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date *
              </label>
              <input
                type="date"
                id="purchaseDate"
                value={formData.purchaseDate}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.purchaseDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.purchaseDate && <p className="text-red-500 text-sm mt-1">{errors.purchaseDate}</p>}
            </div>

            {/* Purchase Fees */}
            <div>
              <label htmlFor="purchaseFees" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Fees ($)
              </label>
              <input
                type="number"
                id="purchaseFees"
                value={formData.purchaseFees || ''}
                onChange={(e) => handleInputChange('purchaseFees', Number(e.target.value))}
                placeholder="9.95"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">Brokerage fees, commissions, etc.</p>
            </div>

            {/* Current Price */}
            <div>
              <label htmlFor="currentPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Current Price ($)
              </label>
              <input
                type="number"
                id="currentPrice"
                value={formData.currentPrice || ''}
                onChange={(e) => handleInputChange('currentPrice', Number(e.target.value))}
                placeholder="165.00"
                min="0.01"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.currentPrice ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.currentPrice && <p className="text-red-500 text-sm mt-1">{errors.currentPrice}</p>}
              <p className="text-gray-500 text-xs mt-1">Leave empty to use purchase price</p>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            {/* Exchange */}
            <div>
              <label htmlFor="exchange" className="block text-sm font-medium text-gray-700 mb-1">
                Exchange
              </label>
              <select
                id="exchange"
                value={formData.exchange}
                onChange={(e) => handleInputChange('exchange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Exchange</option>
                <option value="NASDAQ">NASDAQ</option>
                <option value="NYSE">NYSE</option>
                <option value="ASX">ASX</option>
                <option value="LSE">LSE</option>
                <option value="TSX">TSX</option>
                <option value="FRA">Frankfurt</option>
              </select>
            </div>

            {/* Sector */}
            <div className="md:col-span-2">
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                Sector
              </label>
              <select
                id="sector"
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Consumer Discretionary">Consumer Discretionary</option>
                <option value="Consumer Staples">Consumer Staples</option>
                <option value="Energy">Energy</option>
                <option value="Industrials">Industrials</option>
                <option value="Materials">Materials</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Utilities">Utilities</option>
                <option value="Communication Services">Communication Services</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding Stock...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stock
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}