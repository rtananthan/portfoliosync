import React, { useState } from 'react';
import { CreatePropertyRequest } from '../types';

interface PropertyFormProps {
  onSubmit: (property: CreatePropertyRequest) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState<CreatePropertyRequest>({
    address: '',
    propertyType: 'house',
    purchasePrice: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    currentValue: 0,
    bedrooms: 0,
    bathrooms: 0,
    carSpaces: 0,
    landSize: 0,
    floorArea: 0,
    yearBuilt: new Date().getFullYear(),
    councilArea: '',
    stampDuty: 0,
    legalFees: 0,
    otherPurchaseCosts: 0,
    weeklyRent: 0,
    tenantName: '',
    leaseStartDate: '',
    leaseEndDate: '',
    bondAmount: 0,
    propertyManager: '',
    managementFeePercentage: 0,
    councilRates: 0,
    waterRates: 0,
    insurance: 0,
    propertyManagementFees: 0,
    maintenanceRepairs: 0,
    strataFees: 0,
    landTax: 0,
    valuationDate: new Date().toISOString().split('T')[0],
    valuationMethod: 'estimate',
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'purchase' | 'rental' | 'expenses'>('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const TabButton = ({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
      } border-b-2`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/5 xl:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Property</h3>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <TabButton label="Basic Info" isActive={activeTab === 'basic'} onClick={() => setActiveTab('basic')} />
            <TabButton label="Purchase Details" isActive={activeTab === 'purchase'} onClick={() => setActiveTab('purchase')} />
            <TabButton label="Rental Info" isActive={activeTab === 'rental'} onClick={() => setActiveTab('rental')} />
            <TabButton label="Expenses" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main Street, Suburb, State, Postcode"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Type *
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="house">House</option>
                      <option value="unit">Unit/Apartment</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="duplex">Duplex</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Vacant Land</option>
                      <option value="rural">Rural/Agricultural</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Council Area
                    </label>
                    <input
                      type="text"
                      name="councilArea"
                      value={formData.councilArea}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., City of Sydney"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      name="bedrooms"
                      value={formData.bedrooms}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      name="bathrooms"
                      value={formData.bathrooms}
                      onChange={handleNumberChange}
                      min="0"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Car Spaces
                    </label>
                    <input
                      type="number"
                      name="carSpaces"
                      value={formData.carSpaces}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Land Size (sqm)
                    </label>
                    <input
                      type="number"
                      name="landSize"
                      value={formData.landSize}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor Area (sqm)
                    </label>
                    <input
                      type="number"
                      name="floorArea"
                      value={formData.floorArea}
                      onChange={handleNumberChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Year Built
                    </label>
                    <input
                      type="number"
                      name="yearBuilt"
                      value={formData.yearBuilt}
                      onChange={handleNumberChange}
                      min="1800"
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Purchase Details Tab */}
            {activeTab === 'purchase' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Price *
                    </label>
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleNumberChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date *
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Value *
                    </label>
                    <input
                      type="number"
                      name="currentValue"
                      value={formData.currentValue}
                      onChange={handleNumberChange}
                      required
                      min="0"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valuation Date
                    </label>
                    <input
                      type="date"
                      name="valuationDate"
                      value={formData.valuationDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stamp Duty
                    </label>
                    <input
                      type="number"
                      name="stampDuty"
                      value={formData.stampDuty}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Legal Fees
                    </label>
                    <input
                      type="number"
                      name="legalFees"
                      value={formData.legalFees}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Purchase Costs
                    </label>
                    <input
                      type="number"
                      name="otherPurchaseCosts"
                      value={formData.otherPurchaseCosts}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valuation Method
                  </label>
                  <select
                    name="valuationMethod"
                    value={formData.valuationMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="estimate">Estimate</option>
                    <option value="online">Online Valuation</option>
                    <option value="council">Council Valuation</option>
                    <option value="professional">Professional Valuation</option>
                  </select>
                </div>
              </div>
            )}

            {/* Rental Information Tab */}
            {activeTab === 'rental' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weekly Rent
                    </label>
                    <input
                      type="number"
                      name="weeklyRent"
                      value={formData.weeklyRent}
                      onChange={handleNumberChange}
                      min="0"
                      step="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bond Amount
                    </label>
                    <input
                      type="number"
                      name="bondAmount"
                      value={formData.bondAmount}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant Name
                  </label>
                  <input
                    type="text"
                    name="tenantName"
                    value={formData.tenantName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Current tenant name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Start Date
                    </label>
                    <input
                      type="date"
                      name="leaseStartDate"
                      value={formData.leaseStartDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lease End Date
                    </label>
                    <input
                      type="date"
                      name="leaseEndDate"
                      value={formData.leaseEndDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Manager
                    </label>
                    <input
                      type="text"
                      name="propertyManager"
                      value={formData.propertyManager}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Property management company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Management Fee (%)
                    </label>
                    <input
                      type="number"
                      name="managementFeePercentage"
                      value={formData.managementFeePercentage}
                      onChange={handleNumberChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Annual Expenses Tab */}
            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Council Rates (Annual)
                    </label>
                    <input
                      type="number"
                      name="councilRates"
                      value={formData.councilRates}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Water Rates (Annual)
                    </label>
                    <input
                      type="number"
                      name="waterRates"
                      value={formData.waterRates}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Insurance (Annual)
                    </label>
                    <input
                      type="number"
                      name="insurance"
                      value={formData.insurance}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Property Management Fees (Annual)
                    </label>
                    <input
                      type="number"
                      name="propertyManagementFees"
                      value={formData.propertyManagementFees}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maintenance & Repairs (Annual)
                    </label>
                    <input
                      type="number"
                      name="maintenanceRepairs"
                      value={formData.maintenanceRepairs}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Strata Fees (Annual)
                    </label>
                    <input
                      type="number"
                      name="strataFees"
                      value={formData.strataFees}
                      onChange={handleNumberChange}
                      min="0"
                      step="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Body corporate fees for units"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Land Tax (Annual)
                  </label>
                  <input
                    type="number"
                    name="landTax"
                    value={formData.landTax}
                    onChange={handleNumberChange}
                    min="0"
                    step="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Investment property land tax"
                  />
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-between pt-6 border-t">
              <div className="flex space-x-2">
                {activeTab !== 'basic' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['basic', 'purchase', 'rental', 'expenses'];
                      const currentIndex = tabs.indexOf(activeTab);
                      setActiveTab(tabs[currentIndex - 1] as any);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Previous
                  </button>
                )}
                {activeTab !== 'expenses' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['basic', 'purchase', 'rental', 'expenses'];
                      const currentIndex = tabs.indexOf(activeTab);
                      setActiveTab(tabs[currentIndex + 1] as any);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding...' : 'Add Property'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;