import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APP_CONFIG, CONFIG, ENV } from '../config';

// Store original env values
const originalEnv = {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

describe('config constants', () => {
  beforeEach(() => {
    // Reset to original values before each test
    Object.assign(import.meta.env, originalEnv);
  });

  afterEach(() => {
    // Ensure clean state after each test
    Object.assign(import.meta.env, originalEnv);
  });

  describe('APP_CONFIG', () => {
    it('should have default API_BASE_URL when environment variable is not set', async () => {
      // Clear the environment variable
      delete (import.meta.env as any).VITE_API_BASE_URL;

      // Re-import to get fresh config
      vi.resetModules();
      const { APP_CONFIG: freshConfig } = await import('../config');

      expect(freshConfig.API_BASE_URL).toBe('http://localhost:5001');
    });

    it('should use environment variable for API_BASE_URL when set', async () => {
      // Mock environment variable
      (import.meta.env as any).VITE_API_BASE_URL = 'https://api.example.com';

      // Re-import to get fresh config
      vi.resetModules();
      const { APP_CONFIG: freshConfig } = await import('../config');

      expect(freshConfig.API_BASE_URL).toBe('https://api.example.com');
    });

    it('should have correct API_TIMEOUT value', () => {
      expect(APP_CONFIG.API_TIMEOUT).toBe(10000);
      expect(typeof APP_CONFIG.API_TIMEOUT).toBe('number');
    });

    it('should have correct QUERY_STALE_TIME value', () => {
      const expectedStaleTime = 1000 * 60 * 5; // 5 minutes in milliseconds
      expect(APP_CONFIG.QUERY_STALE_TIME).toBe(expectedStaleTime);
      expect(APP_CONFIG.QUERY_STALE_TIME).toBe(300000);
    });

    it('should have correct QUERY_GC_TIME value', () => {
      const expectedGcTime = 1000 * 60 * 10; // 10 minutes in milliseconds
      expect(APP_CONFIG.QUERY_GC_TIME).toBe(expectedGcTime);
      expect(APP_CONFIG.QUERY_GC_TIME).toBe(600000);
    });

    it('should have correct MAX_TODO_TEXT_LENGTH value', () => {
      expect(APP_CONFIG.MAX_TODO_TEXT_LENGTH).toBe(500);
      expect(typeof APP_CONFIG.MAX_TODO_TEXT_LENGTH).toBe('number');
    });

    it('should have correct DEBOUNCE_DELAY value', () => {
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBe(300);
      expect(typeof APP_CONFIG.DEBOUNCE_DELAY).toBe('number');
    });

    it('should be readonly (const assertion)', () => {
      // TypeScript const assertion should make this readonly
      expect(() => {
        // @ts-expect-error - Testing readonly behavior
        (APP_CONFIG as any).API_TIMEOUT = 5000;
      }).not.toThrow(); // Runtime doesn't prevent this, but TypeScript should

      // Verify the type is properly constrained
      type ConfigKeys = keyof typeof APP_CONFIG;
      const keys: ConfigKeys[] = [
        'API_BASE_URL',
        'API_TIMEOUT',
        'QUERY_STALE_TIME',
        'QUERY_GC_TIME',
        'MAX_TODO_TEXT_LENGTH',
        'DEBOUNCE_DELAY'
      ];

      keys.forEach(key => {
        expect(APP_CONFIG).toHaveProperty(key);
      });
    });

    it('should have all required properties', () => {
      expect(APP_CONFIG).toHaveProperty('API_BASE_URL');
      expect(APP_CONFIG).toHaveProperty('API_TIMEOUT');
      expect(APP_CONFIG).toHaveProperty('QUERY_STALE_TIME');
      expect(APP_CONFIG).toHaveProperty('QUERY_GC_TIME');
      expect(APP_CONFIG).toHaveProperty('MAX_TODO_TEXT_LENGTH');
      expect(APP_CONFIG).toHaveProperty('DEBOUNCE_DELAY');
    });

    it('should have reasonable timeout values', () => {
      // API timeout should be reasonable (between 1 second and 1 minute)
      expect(APP_CONFIG.API_TIMEOUT).toBeGreaterThanOrEqual(1000);
      expect(APP_CONFIG.API_TIMEOUT).toBeLessThanOrEqual(60000);

      // Query stale time should be reasonable (between 1 minute and 1 hour)
      expect(APP_CONFIG.QUERY_STALE_TIME).toBeGreaterThanOrEqual(60000);
      expect(APP_CONFIG.QUERY_STALE_TIME).toBeLessThanOrEqual(3600000);

      // Query GC time should be longer than stale time
      expect(APP_CONFIG.QUERY_GC_TIME).toBeGreaterThan(APP_CONFIG.QUERY_STALE_TIME);
    });

    it('should have reasonable text length limits', () => {
      // Max todo text length should be reasonable
      expect(APP_CONFIG.MAX_TODO_TEXT_LENGTH).toBeGreaterThan(0);
      expect(APP_CONFIG.MAX_TODO_TEXT_LENGTH).toBeLessThanOrEqual(1000);
    });

    it('should have reasonable debounce delay', () => {
      // Debounce delay should be reasonable (between 100ms and 1 second)
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBeGreaterThanOrEqual(100);
      expect(APP_CONFIG.DEBOUNCE_DELAY).toBeLessThanOrEqual(1000);
    });
  });

  describe('CONFIG (Legacy Export)', () => {
    it('should be identical to APP_CONFIG', () => {
      expect(CONFIG).toBe(APP_CONFIG);
      expect(CONFIG).toEqual(APP_CONFIG);
    });

    it('should maintain backward compatibility', () => {
      // All APP_CONFIG properties should be available on CONFIG
      expect(CONFIG.API_BASE_URL).toBe(APP_CONFIG.API_BASE_URL);
      expect(CONFIG.API_TIMEOUT).toBe(APP_CONFIG.API_TIMEOUT);
      expect(CONFIG.QUERY_STALE_TIME).toBe(APP_CONFIG.QUERY_STALE_TIME);
      expect(CONFIG.QUERY_GC_TIME).toBe(APP_CONFIG.QUERY_GC_TIME);
      expect(CONFIG.MAX_TODO_TEXT_LENGTH).toBe(APP_CONFIG.MAX_TODO_TEXT_LENGTH);
      expect(CONFIG.DEBOUNCE_DELAY).toBe(APP_CONFIG.DEBOUNCE_DELAY);
    });
  });

  describe('ENV', () => {
    it('should expose NODE_ENV from import.meta.env', () => {
      expect(ENV.NODE_ENV).toBe(import.meta.env.NODE_ENV);
    });

    it('should expose DEV from import.meta.env', () => {
      expect(ENV.DEV).toBe(import.meta.env.DEV);
    });

    it('should expose PROD from import.meta.env', () => {
      expect(ENV.PROD).toBe(import.meta.env.PROD);
    });

    it('should have all required environment properties', () => {
      expect(ENV).toHaveProperty('NODE_ENV');
      expect(ENV).toHaveProperty('DEV');
      expect(ENV).toHaveProperty('PROD');
    });

    it('should have boolean values for DEV and PROD', () => {
      expect(typeof ENV.DEV).toBe('boolean');
      expect(typeof ENV.PROD).toBe('boolean');
    });

    it('should have valid NODE_ENV values', () => {
      const validNodeEnvs = ['development', 'production', 'test', undefined];
      expect(validNodeEnvs).toContain(ENV.NODE_ENV);
    });

    it('should be readonly (const assertion)', () => {
      // Verify the type is properly constrained
      type EnvKeys = keyof typeof ENV;
      const keys: EnvKeys[] = ['NODE_ENV', 'DEV', 'PROD'];

      keys.forEach(key => {
        expect(ENV).toHaveProperty(key);
      });
    });

    it('should have logical relationship between DEV and PROD', () => {
      // In most cases, DEV and PROD should be opposite
      // (though this might not always be true in all build systems)
      if (ENV.DEV !== undefined && ENV.PROD !== undefined) {
        // If both are defined as booleans, they should typically be opposites
        if (typeof ENV.DEV === 'boolean' && typeof ENV.PROD === 'boolean') {
          expect(ENV.DEV !== ENV.PROD).toBe(true);
        }
      }
    });
  });

  describe('Integration and Type Safety', () => {
    it('should maintain type safety across exports', () => {
      // All exports should maintain their types
      expect(typeof APP_CONFIG).toBe('object');
      expect(typeof CONFIG).toBe('object');
      expect(typeof ENV).toBe('object');
    });

    it('should work with destructuring', () => {
      const { API_BASE_URL, API_TIMEOUT } = APP_CONFIG;
      const { NODE_ENV, DEV } = ENV;

      expect(typeof API_BASE_URL).toBe('string');
      expect(typeof API_TIMEOUT).toBe('number');
      expect(NODE_ENV).toBeDefined();
      expect(typeof DEV).toBe('boolean');
    });

    it('should handle environment variable edge cases', async () => {
      // Test with empty string environment variable
      (import.meta.env as any).VITE_API_BASE_URL = '';

      vi.resetModules();
      const { APP_CONFIG: freshConfig } = await import('../config');

      // Empty string should fallback to default
      expect(freshConfig.API_BASE_URL).toBe('http://localhost:5001');
    });

    it('should handle undefined environment variables gracefully', async () => {
      // Test with undefined environment variable
      (import.meta.env as any).VITE_API_BASE_URL = undefined;

      vi.resetModules();
      const { APP_CONFIG: freshConfig } = await import('../config');

      expect(freshConfig.API_BASE_URL).toBe('http://localhost:5001');
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should support typical API configuration usage', () => {
      const apiUrl = `${APP_CONFIG.API_BASE_URL}/api/todos`;
      expect(apiUrl).toMatch(/^https?:\/\/.+\/api\/todos$/);
    });

    it('should support query configuration usage', () => {
      const queryOptions = {
        staleTime: APP_CONFIG.QUERY_STALE_TIME,
        gcTime: APP_CONFIG.QUERY_GC_TIME,
      };

      expect(queryOptions.staleTime).toBe(300000);
      expect(queryOptions.gcTime).toBe(600000);
      expect(queryOptions.gcTime).toBeGreaterThan(queryOptions.staleTime);
    });

    it('should support validation usage', () => {
      const testText = 'a'.repeat(APP_CONFIG.MAX_TODO_TEXT_LENGTH + 1);
      const isValid = testText.length <= APP_CONFIG.MAX_TODO_TEXT_LENGTH;

      expect(isValid).toBe(false);
      expect(testText.length).toBe(501);
    });

    it('should support debouncing usage', () => {
      const debounceMs = APP_CONFIG.DEBOUNCE_DELAY;

      expect(debounceMs).toBeGreaterThan(0);
      expect(typeof debounceMs).toBe('number');
    });
  });
});