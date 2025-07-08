import { useState } from 'react'
import { Home, Plus, ArrowLeft, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PropertiesPage() {
  const [properties] = useState([
    { 
      id: 1, 
      address: '123 Main St, Seattle, WA 98101', 
      type: 'residential' as const, 
      purchasePrice: 750000, 
      currentValue: 895000, 
      purchaseDate: '2022-03-15',
      return: 19.3, 
      returnDollar: 145000,
      sqft: 2100,
      bedrooms: 3,
      bathrooms: 2.5
    },
    { 
      id: 2, 
      address: '456 Business Ave, Austin, TX 78701', 
      type: 'commercial' as const, 
      purchasePrice: 1200000, 
      currentValue: 1380000, 
      purchaseDate: '2021-08-22',
      return: 15.0, 
      returnDollar: 180000,
      sqft: 4500,
      bedrooms: null,
      bathrooms: 3
    },
    { 
      id: 3, 
      address: '789 Oak Drive, Portland, OR 97201', 
      type: 'residential' as const, 
      purchasePrice: 525000, 
      currentValue: 615000, 
      purchaseDate: '2023-01-10',
      return: 17.1, 
      returnDollar: 90000,
      sqft: 1850,
      bedrooms: 2,
      bathrooms: 2
    },
  ])

  const totalValue = properties.reduce((sum, property) => sum + property.currentValue, 0)
  const totalCost = properties.reduce((sum, property) => sum + property.purchasePrice, 0)
  const totalReturn = totalValue - totalCost
  const totalReturnPercent = (totalReturn / totalCost) * 100

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Home className="h-8 w-8 text-orange-500 mr-3" />
              Real Estate Properties
            </h1>
            <p className="text-gray-600 mt-1">Manage your real estate investment portfolio</p>
          </div>
        </div>
        <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Add Property
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <Home className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Equity</p>
              <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${totalReturn >= 0 ? '+' : ''}${totalReturn.toLocaleString()}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-lg ${totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturn >= 0 ? '+' : '-'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Return %</p>
              <p className={`text-2xl font-bold ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalReturnPercent >= 0 ? '+' : ''}{totalReturnPercent.toFixed(1)}%
              </p>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${totalReturnPercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <span className={`text-lg ${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Properties</p>
              <p className="text-2xl font-bold text-gray-900">{properties.length}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
              <span className="text-lg text-orange-600">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Property Image Placeholder */}
            <div className="h-48 bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center">
              <Home className="h-16 w-16 text-white opacity-50" />
            </div>
            
            {/* Property Details */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                    <p className="text-sm font-medium text-gray-900">{property.address}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    property.type === 'residential' 
                      ? 'bg-blue-100 text-blue-800' 
                      : property.type === 'commercial'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                  </span>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-500">Square Feet</p>
                  <p className="font-medium">{property.sqft.toLocaleString()} sq ft</p>
                </div>
                {property.bedrooms && (
                  <div>
                    <p className="text-gray-500">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms} bed</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500">Bathrooms</p>
                  <p className="font-medium">{property.bathrooms} bath</p>
                </div>
                <div>
                  <p className="text-gray-500">Purchased</p>
                  <p className="font-medium">{new Date(property.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Financial Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">Purchase Price</p>
                    <p className="font-medium text-gray-900">${property.purchasePrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Value</p>
                    <p className="font-medium text-gray-900">${property.currentValue.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-lg font-bold ${property.return >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {property.return >= 0 ? '+' : ''}{property.return}%
                    </p>
                    <p className={`text-sm ${property.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${property.returnDollar >= 0 ? '+' : ''}${property.returnDollar.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-orange-600 hover:text-orange-900 text-sm font-medium">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 text-sm font-medium">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}