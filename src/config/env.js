import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configuration object with environment variables
const config = {
  // PocketBase URL - primary source from .env.local, fallback to Vite env, then localhost
  PB_URL: process.env.PB_URL || import.meta.env?.VITE_PB_URL || 'http://127.0.0.1:8090',
  
  // Development mode detection
  IS_DEV: process.env.NODE_ENV === 'development' || import.meta.env?.MODE === 'development',
  
  // API Configuration
  API_URL: process.env.API_URL || import.meta.env?.VITE_API_URL || 'http://localhost:3001/api',
};

export default config;