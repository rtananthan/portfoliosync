const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'https://7mjwgcrtq0.execute-api.ap-southeast-2.amazonaws.com';

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
             key.includes('percentage') || key.includes('Percentage') || key.includes('Cost') ||
             key.includes('Ratio') || key.includes('Amount') || key.includes('Expense') ||
             key.includes('Rates') || key.includes('Fees') || key.includes('Tax') ||
             key.includes('Yield') || key.includes('Growth') || key.includes('Flow') ||
             key.includes('Size') || key.includes('Area') || key.includes('Rent') ||
             key === 'quantity' || key === 'expenseRatio' || key === 'lastDistributionAmount' ||
             key === 'annualExpenseCost' || key === 'daysHeld' || key === 'bedrooms' || 
             key === 'bathrooms' || key === 'carSpaces' || key === 'yearBuilt')) {
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

// Enhanced fetch wrapper with proper error handling
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
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      ...config,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Handle different HTTP status codes
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorData = null;
      
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      const error = new Error(errorMessage) as any;
      error.response = {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      };
      
      throw error;
    }
    
    let data = await response.json();
    console.log('API Response:', data);
    
    // Convert Decimal strings back to numbers for frontend display
    if (data) {
      data = convertDecimalStrings(data);
    }
    
    return data;
  } catch (error: any) {
    // Enhanced error handling
    if (error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout - please try again') as any;
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    
    // Network errors
    if (!navigator.onLine) {
      const networkError = new Error('No internet connection') as any;
      networkError.name = 'NetworkError';
      throw networkError;
    }
    
    // Log error details for debugging
    console.error('API Error Details:', {
      endpoint,
      method: config.method || 'GET',
      error: error.message,
      stack: error.stack,
      response: error.response
    });
    
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