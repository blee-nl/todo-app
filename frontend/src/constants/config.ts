// Application configuration constants
export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
  API_TIMEOUT: 10000,
  QUERY_STALE_TIME: 1000 * 60 * 5, // 5 minutes
  QUERY_GC_TIME: 1000 * 60 * 10, // 10 minutes
  MAX_TODO_TEXT_LENGTH: 500,
  DEBOUNCE_DELAY: 300,
} as const;

// Legacy export for backward compatibility
export const CONFIG = APP_CONFIG;

// Environment variables
export const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
} as const;
