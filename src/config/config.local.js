// Local configuration file that reads from .env
// This file won't be overridden by server deployment processes

const config = {
  // PocketBase URL - reads from your .env file
  PB_URL: import.meta.env?.VITE_PB_URL || 'http://127.0.0.1:8090',
  
  // Development mode detection
  IS_DEV: import.meta.env?.MODE === 'development',
  
  // API Configuration
  API_URL: import.meta.env?.VITE_API_URL || import.meta.env?.VITE_PB_URL + '/api' || 'http://localhost:3001/api',
  
  // OAuth Configuration
  OAUTH_PROVIDERS: ['google', 'github', 'discord'],
  
  // App Configuration
  APP_NAME: 'Print A Pic',
  APP_VERSION: '1.0.0',
};

export default config;