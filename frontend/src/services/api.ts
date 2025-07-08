const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://jhjtsrmah8.execute-api.ap-southeast-2.amazonaws.com';

// Helper function to convert Decimal string values to numbers
function convertDecimalStrings(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertDecimalStrings(item));
  }
  
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Convert decimal-like string fields to numbers
        if (typeof value === 'string' && /^-?\d+\.?\d*$/.test(value) && 
            (key.includes('Price') || key.includes('Value') || key.includes('Return') || 
             key.includes('percentage') || key === 'quantity')) {
          converted[key] = parseFloat(value);
        } else {
          converted[key] = convertDecimalStrings(value);
        }
      }
    }
    return converted;
  }
  
  return obj;
}

// Basic fetch wrapper with error handling
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`API Request: ${config.method || 'GET'} ${url}`);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let data = await response.json();
    console.log('API Response:', data);
    
    // Convert Decimal strings back to numbers for frontend display
    if (data) {
      data = convertDecimalStrings(data);
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export default {
  get: (endpoint: string) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint: string, data: any) => 
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  put: (endpoint: string, data: any) =>
    apiRequest(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => apiRequest(endpoint, { method: 'DELETE' }),
};