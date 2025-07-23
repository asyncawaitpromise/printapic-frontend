// Mock API Configuration
const API_CONFIG = {
  // Environment settings
  USE_MOCK_API: import.meta.env?.MODE === 'development' || !import.meta.env?.VITE_API_URL,
  
  // API endpoints
  BASE_URL: import.meta.env?.VITE_PB_URL || 'http://localhost:3001/api',
  
  // Mock settings
  MOCK_DELAYS: {
    UPLOAD: 1000,        // 1 second
    PROCESSING: 3000,    // 3 seconds
    STATUS_CHECK: 500,   // 0.5 seconds
    DOWNLOAD: 800,       // 0.8 seconds
    AUTHENTICATION: 1200 // 1.2 seconds
  },
  
  // Error simulation
  ERROR_RATES: {
    UPLOAD: 0.05,        // 5% chance of upload error
    PROCESSING: 0.03,    // 3% chance of processing error
    NETWORK: 0.02,       // 2% chance of network error
    AUTHENTICATION: 0.01 // 1% chance of auth error
  },
  
  // Mock data settings
  MOCK_PROCESSING_TIME: 15000, // 15 seconds for AI processing
  MOCK_QUEUE_SIZE: 3,          // Simulate 3 jobs in queue
  MOCK_TOKEN_COST: 2,          // 2 tokens per AI processing
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'X-Client-Version': '1.0.0',
    'X-Platform': 'web'
  }
};

/**
 * Simulate network delay
 * @param {string} operation - The operation type
 * @returns {Promise} - Promise that resolves after delay
 */
export const simulateDelay = (operation = 'default') => {
  const delay = API_CONFIG.MOCK_DELAYS[operation.toUpperCase()] || 1000;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Simulate network error
 * @param {string} operation - The operation type
 * @returns {boolean} - Whether to simulate an error
 */
export const shouldSimulateError = (operation = 'default') => {
  const errorRate = API_CONFIG.ERROR_RATES[operation.toUpperCase()] || 0.02;
  return Math.random() < errorRate;
};

/**
 * Create mock response with realistic structure
 * @param {*} data - The response data
 * @param {boolean} success - Whether the response is successful
 * @param {string} message - Response message
 * @returns {Object} - Mock API response
 */
export const createMockResponse = (data = null, success = true, message = '') => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(36).substr(2, 9)
  };
};

/**
 * Mock HTTP client with realistic behavior
 */
export class MockHttpClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.headers = { ...API_CONFIG.DEFAULT_HEADERS };
  }

  async request(method, endpoint, data = null, options = {}) {
    const operation = options.operation || 'default';
    
    // Simulate network delay
    await simulateDelay(operation);
    
    // Simulate network errors
    if (shouldSimulateError(operation)) {
      throw new Error(`Network error during ${operation}`);
    }
    
    // Log mock request
    console.log(`🔄 Mock ${method.toUpperCase()} ${endpoint}`, data ? { data } : '');
    
    // Return mock response based on endpoint
    return this.getMockResponse(method, endpoint, data);
  }

  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, null, options);
  }

  async post(endpoint, data, options = {}) {
    return this.request('POST', endpoint, data, options);
  }

  async put(endpoint, data, options = {}) {
    return this.request('PUT', endpoint, data, options);
  }

  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, null, options);
  }

  getMockResponse(method, endpoint, data) {
    // Mock responses based on endpoint patterns
    if (endpoint.includes('/auth/login')) {
      return createMockResponse({
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          id: 'user_123',
          email: 'user@example.com',
          name: 'Mock User',
          tokenBalance: 1000
        }
      });
    }

    if (endpoint.includes('/photos/upload')) {
      return createMockResponse({
        photoId: 'photo_' + Date.now(),
        uploadUrl: 'https://mock-storage.com/photo.jpg',
        status: 'uploaded'
      });
    }

    if (endpoint.includes('/ai/process')) {
      return createMockResponse({
        jobId: 'job_' + Date.now(),
        status: 'queued',
        estimatedTime: API_CONFIG.MOCK_PROCESSING_TIME,
        queuePosition: API_CONFIG.MOCK_QUEUE_SIZE,
        tokenCost: API_CONFIG.MOCK_TOKEN_COST
      });
    }

    if (endpoint.includes('/ai/status/')) {
      const jobId = endpoint.split('/').pop();
      return createMockResponse({
        jobId,
        status: 'processing',
        progress: Math.floor(Math.random() * 100),
        estimatedTimeRemaining: Math.floor(Math.random() * 10000)
      });
    }

    if (endpoint.includes('/ai/workflows')) {
      return createMockResponse([
        {
          id: 'remove_background',
          name: 'Remove Background',
          description: 'Cleanly remove the background from your photo',
          tokenCost: 2,
          category: 'editing',
          estimatedTime: 15000
        },
        {
          id: 'enhance_colors',
          name: 'Enhance Colors',
          description: 'Make your photo colors pop with AI enhancement',
          tokenCost: 1,
          category: 'enhancement',
          estimatedTime: 10000
        },
        {
          id: 'cartoon_style',
          name: 'Cartoon Style',
          description: 'Transform your photo into a cartoon illustration',
          tokenCost: 3,
          category: 'style',
          estimatedTime: 20000
        }
      ]);
    }

    // Default mock response
    return createMockResponse({ message: 'Mock response' });
  }
}

// Create singleton instance
export const mockHttpClient = new MockHttpClient();

// Export configuration
export default API_CONFIG; 