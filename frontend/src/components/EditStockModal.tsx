import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Stock, CreateStockRequest } from '../types';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (stockData: Partial<CreateStockRequest>) => Promise<void>;
  stock: Stock | null;
  isLoading?: boolean;
}

export default function EditStockModal({ isOpen, onClose, onSubmit, stock, isLoading = false }: EditStockModalProps) {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    averagePrice: '',
    currentPrice: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when stock changes
  useEffect(() => {
    if (stock) {
      setFormData({
        symbol: stock.symbol || '',
        name: stock.name || '',
        quantity: String(Number(stock.quantity) || 0),
        averagePrice: String(Number(stock.averagePrice) || 0),
        currentPrice: String(Number(stock.currentPrice) || Number(stock.averagePrice) || 0)
      });
    }
  }, [stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Stock symbol is required';
    }
    
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    
    if (!formData.averagePrice || Number(formData.averagePrice) <= 0) {
      newErrors.averagePrice = 'Average price must be greater than 0';
    }

    if (!formData.currentPrice || Number(formData.currentPrice) <= 0) {
      newErrors.currentPrice = 'Current price must be greater than 0';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // Only send changed fields
      const updateData: Partial<CreateStockRequest> = {};
      
      if (formData.symbol !== stock?.symbol) {
        updateData.symbol = formData.symbol.trim().toUpperCase();
      }
      if (formData.name !== stock?.name) {
        updateData.name = formData.name.trim();
      }
      if (Number(formData.quantity) !== Number(stock?.quantity)) {
        updateData.quantity = Number(formData.quantity);
      }
      if (Number(formData.averagePrice) !== Number(stock?.averagePrice)) {
        updateData.averagePrice = Number(formData.averagePrice);
      }
      if (Number(formData.currentPrice) !== Number(stock?.currentPrice)) {
        updateData.currentPrice = Number(formData.currentPrice);
      }
      
      await onSubmit(updateData);
      onClose();
      
      // Reset form
      setFormData({
        symbol: '',
        name: '',
        quantity: '',
        averagePrice: '',
        currentPrice: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error updating stock:', error);
      setErrors({ submit: 'Failed to update stock. Please try again.' });
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Symbol *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => handleChange('symbol', e.target.value.toUpperCase())}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.symbol ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., AAPL"
              maxLength={10}
            />
            {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Apple Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 100"
              min="0.000001"
              step="0.000001"
            />
            {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Average Price ($) *
            </label>
            <input
              type="number"
              value={formData.averagePrice}
              onChange={(e) => handleChange('averagePrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.averagePrice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 150.00"
              min="0.01"
              step="0.01"
            />
            {errors.averagePrice && <p className="text-red-500 text-sm mt-1">{errors.averagePrice}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price ($) *
            </label>
            <input
              type="number"
              value={formData.currentPrice}
              onChange={(e) => handleChange('currentPrice', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.currentPrice ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 165.00"
              min="0.01"
              step="0.01"
            />
            {errors.currentPrice && <p className="text-red-500 text-sm mt-1">{errors.currentPrice}</p>}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
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
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}