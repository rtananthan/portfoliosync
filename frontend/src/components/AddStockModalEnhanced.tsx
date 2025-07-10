import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { CreateStockRequest } from '../types';
import ValidatedInput from './ValidatedInput';
import TagSelector from './TagSelector';
import { commonValidations, validateAndSanitize } from '../utils/validation';
import ErrorMessage from './ErrorMessage';
import TagService from '../services/tagService';

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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<import('../types').AssetTag[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validationRules = {
    symbol: { 
      required: true, 
      ...commonValidations.stockSymbol,
      maxLength: 10
    },
    name: { 
      maxLength: 100 
    },
    quantity: { 
      required: true, 
      ...commonValidations.positiveInteger 
    },
    purchasePrice: { 
      required: true, 
      ...commonValidations.positiveNumber 
    },
    purchaseDate: { 
      required: true, 
      ...commonValidations.date 
    },
    currentPrice: { 
      ...commonValidations.positiveNumber 
    },
    purchaseFees: { 
      min: 0 
    },
    currency: { 
      required: true, 
      pattern: /^[A-Z]{3}$/,
      maxLength: 3 
    },
    exchange: { 
      maxLength: 50 
    },
    sector: { 
      maxLength: 50 
    }
  };

  // Get tag suggestions based on form data
  useEffect(() => {
    const getSuggestions = async () => {
      if (formData.symbol || formData.sector) {
        try {
          const suggestions = await TagService.suggestTagsForAsset({
            type: 'stock',
            symbol: formData.symbol,
            sector: formData.sector,
            purchaseDate: formData.purchaseDate
          });
          setSuggestedTags(suggestions);
        } catch (error) {
          console.error('Failed to get tag suggestions:', error);
        }
      }
    };

    getSuggestions();
  }, [formData.symbol, formData.sector, formData.purchaseDate]);

  const handleFieldValidation = (fieldName: string, isValid: boolean, error?: string) => {
    // Can be used for real-time validation feedback if needed
    console.log(`Field ${fieldName} validation:`, { isValid, error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate and sanitize all form data
    const { isValid, errors, sanitizedData } = validateAndSanitize(formData, validationRules);
    
    if (!isValid) {
      setValidationErrors(errors.map(e => e.message));
      return;
    }
    
    setValidationErrors([]);
    
    try {
      // Set current price to purchase price if not provided
      const submitData = {
        ...sanitizedData,
        symbol: sanitizedData.symbol.toUpperCase(),
        currentPrice: sanitizedData.currentPrice || sanitizedData.purchasePrice,
        tags: selectedTags
      };
      
      await onSubmit(submitData as CreateStockRequest);
      
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
      setSelectedTags([]);
      setSuggestedTags([]);
      setValidationErrors([]);
      
      // Add a small delay to ensure the API call completes
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error('Error adding stock:', error);
      setValidationErrors(['Failed to add stock. Please try again.']);
    }
  };

  const handleInputChange = (field: keyof CreateStockRequest, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
          {validationErrors.length > 0 && (
            <ErrorMessage
              title="Validation Errors"
              message={validationErrors.join('. ')}
              onClose={() => setValidationErrors([])}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Stock Symbol */}
            <ValidatedInput
              label="Stock Symbol"
              name="symbol"
              type="text"
              value={formData.symbol}
              onChange={(value) => handleInputChange('symbol', typeof value === 'string' ? value.toUpperCase() : value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.symbol}
              placeholder="e.g., AAPL, GOOGL"
              required
            />

            {/* Company Name */}
            <ValidatedInput
              label="Company Name"
              name="name"
              type="text"
              value={formData.name || ''}
              onChange={(value) => handleInputChange('name', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.name}
              placeholder="e.g., Apple Inc."
            />

            {/* Quantity */}
            <ValidatedInput
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={(value) => handleInputChange('quantity', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.quantity}
              placeholder="Number of shares"
              required
            />

            {/* Purchase Price */}
            <ValidatedInput
              label="Purchase Price ($)"
              name="purchasePrice"
              type="number"
              value={formData.purchasePrice}
              onChange={(value) => handleInputChange('purchasePrice', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.purchasePrice}
              placeholder="150.00"
              required
            />

            {/* Purchase Date */}
            <ValidatedInput
              label="Purchase Date"
              name="purchaseDate"
              type="date"
              value={formData.purchaseDate}
              onChange={(value) => handleInputChange('purchaseDate', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.purchaseDate}
              required
            />

            {/* Purchase Fees */}
            <ValidatedInput
              label="Purchase Fees ($)"
              name="purchaseFees"
              type="number"
              value={formData.purchaseFees || 0}
              onChange={(value) => handleInputChange('purchaseFees', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.purchaseFees}
              placeholder="9.95"
              helpText="Brokerage fees, commissions, etc."
            />

            {/* Current Price */}
            <ValidatedInput
              label="Current Price ($)"
              name="currentPrice"
              type="number"
              value={formData.currentPrice || 0}
              onChange={(value) => handleInputChange('currentPrice', value)}
              onValidation={handleFieldValidation}
              validationRules={validationRules.currentPrice}
              placeholder="165.00"
              helpText="Leave empty to use purchase price"
            />

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

            {/* Tags */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Tags
              </label>
              <TagSelector
                selectedTagIds={selectedTags}
                onTagsChange={setSelectedTags}
                suggestions={suggestedTags}
                placeholder="Tag this investment (e.g., Growth, Long-term, ASX 200)..."
                maxTags={8}
                allowCustomTags={true}
              />
              <p className="text-xs text-gray-500 mt-1">
                Tags help categorize and analyze your investment performance by strategy, time horizon, and purpose.
              </p>
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