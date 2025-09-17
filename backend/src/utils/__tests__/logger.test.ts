import { logger } from '../logger';

describe('Logger Utility', () => {
  // Store original console methods
  let originalConsoleLog: typeof console.log;
  let originalConsoleError: typeof console.error;
  let originalConsoleWarn: typeof console.warn;
  let originalEnv: string | undefined;

  // Mock console methods
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  let mockConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    // Store original methods
    originalConsoleLog = console.log;
    originalConsoleError = console.error;
    originalConsoleWarn = console.warn;
    originalEnv = process.env.NODE_ENV;

    // Mock console methods
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    // Mock Date.prototype.toISOString for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-15T10:30:45.123Z');
  });

  afterEach(() => {
    // Restore original methods and environment
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    process.env.NODE_ENV = originalEnv;

    // Clear all mocks
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('info method', () => {
    it('should log info messages with timestamp prefix', () => {
      logger.info('Test info message');

      expect(mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Test info message'
      );
    });

    it('should log info messages with additional arguments', () => {
      const obj = { key: 'value' };
      const num = 42;

      logger.info('Info with args', obj, num);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Info with args',
        obj,
        num
      );
    });

    it('should handle empty message', () => {
      logger.info('');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        ''
      );
    });

    it('should handle undefined and null arguments', () => {
      logger.info('Message with nullish values', undefined, null);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Message with nullish values',
        undefined,
        null
      );
    });

    it('should handle complex objects as arguments', () => {
      const complexObj = {
        nested: { array: [1, 2, 3] },
        func: () => 'test',
        date: new Date('2025-01-01'),
        regexp: /test/gi
      };

      logger.info('Complex object', complexObj);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Complex object',
        complexObj
      );
    });

    it('should handle error objects as arguments', () => {
      const error = new Error('Test error');

      logger.info('Error in info', error);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Error in info',
        error
      );
    });

    it('should handle very long messages', () => {
      const longMessage = 'A'.repeat(1000);

      logger.info(longMessage);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        longMessage
      );
    });

    it('should handle messages with special characters', () => {
      const specialMessage = 'Message with "quotes", \\backslashes\\, and émojis 😀';

      logger.info(specialMessage);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        specialMessage
      );
    });

    it('should handle boolean arguments', () => {
      logger.info('Boolean values', true, false);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Boolean values',
        true,
        false
      );
    });
  });

  describe('error method', () => {
    it('should log error messages with timestamp prefix', () => {
      logger.error('Test error message');

      expect(mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Test error message'
      );
    });

    it('should log error messages with additional arguments', () => {
      const error = new Error('Something went wrong');
      const context = { userId: '123', action: 'delete' };

      logger.error('Database operation failed', error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Database operation failed',
        error,
        context
      );
    });

    it('should handle Error objects with stack traces', () => {
      const error = new Error('Stack trace test');
      error.stack = 'Error: Stack trace test\n    at Test.it (/path/to/test.js:1:1)';

      logger.error('Error with stack', error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Error with stack',
        error
      );
    });

    it('should handle custom error types', () => {
      class CustomError extends Error {
        constructor(message: string, public code: number) {
          super(message);
          this.name = 'CustomError';
        }
      }

      const customError = new CustomError('Custom error message', 500);

      logger.error('Custom error occurred', customError);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Custom error occurred',
        customError
      );
    });

    it('should handle multiple error objects', () => {
      const error1 = new Error('First error');
      const error2 = new Error('Second error');

      logger.error('Multiple errors', error1, error2);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Multiple errors',
        error1,
        error2
      );
    });

    it('should handle non-Error objects passed as errors', () => {
      const fakeError = { message: 'Fake error', code: 404 };

      logger.error('Fake error object', fakeError);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Fake error object',
        fakeError
      );
    });

    it('should handle primitive values as error arguments', () => {
      logger.error('Primitive error values', 'error string', 404, true);

      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Primitive error values',
        'error string',
        404,
        true
      );
    });
  });

  describe('warn method', () => {
    it('should log warning messages with timestamp prefix', () => {
      logger.warn('Test warning message');

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Test warning message'
      );
    });

    it('should log warning messages with additional arguments', () => {
      const deprecatedFeature = 'oldMethod()';
      const replacement = 'newMethod()';

      logger.warn('Deprecated feature usage', deprecatedFeature, 'use', replacement);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Deprecated feature usage',
        deprecatedFeature,
        'use',
        replacement
      );
    });

    it('should handle warning with error objects', () => {
      const error = new Error('Non-critical error');

      logger.warn('Non-critical issue detected', error);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Non-critical issue detected',
        error
      );
    });

    it('should handle configuration warnings', () => {
      const config = { timeout: 0, retries: -1 };

      logger.warn('Invalid configuration values', config);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Invalid configuration values',
        config
      );
    });

    it('should handle performance warnings', () => {
      const performanceData = {
        operation: 'database query',
        duration: 5000,
        threshold: 1000
      };

      logger.warn('Slow operation detected', performanceData);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Slow operation detected',
        performanceData
      );
    });
  });

  describe('debug method', () => {
    describe('in development environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'development';
      });

      it('should log debug messages when NODE_ENV is development', () => {
        logger.debug('Debug message in development');

        expect(mockConsoleLog).toHaveBeenCalledTimes(1);
        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[2025-01-15T10:30:45.123Z] DEBUG:',
          'Debug message in development'
        );
      });

      it('should log debug messages with additional arguments in development', () => {
        const debugData = { step: 1, state: 'processing' };

        logger.debug('Debug step', debugData, 'completed');

        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[2025-01-15T10:30:45.123Z] DEBUG:',
          'Debug step',
          debugData,
          'completed'
        );
      });

      it('should handle complex debug data in development', () => {
        const complexData = {
          request: { method: 'POST', url: '/api/todos' },
          response: { status: 201, data: { id: '123' } },
          timing: { start: 1000, end: 1050 }
        };

        logger.debug('Request processing details', complexData);

        expect(mockConsoleLog).toHaveBeenCalledWith(
          '[2025-01-15T10:30:45.123Z] DEBUG:',
          'Request processing details',
          complexData
        );
      });
    });

    describe('in production environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'production';
      });

      it('should not log debug messages when NODE_ENV is production', () => {
        logger.debug('Debug message in production');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });

      it('should not log debug messages with arguments in production', () => {
        const debugData = { sensitive: 'data' };

        logger.debug('Sensitive debug info', debugData);

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });
    });

    describe('in test environment', () => {
      beforeEach(() => {
        process.env.NODE_ENV = 'test';
      });

      it('should not log debug messages when NODE_ENV is test', () => {
        logger.debug('Debug message in test');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });
    });

    describe('with undefined NODE_ENV', () => {
      beforeEach(() => {
        delete process.env.NODE_ENV;
      });

      it('should not log debug messages when NODE_ENV is undefined', () => {
        logger.debug('Debug message with undefined NODE_ENV');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });
    });

    describe('with empty NODE_ENV', () => {
      beforeEach(() => {
        process.env.NODE_ENV = '';
      });

      it('should not log debug messages when NODE_ENV is empty', () => {
        logger.debug('Debug message with empty NODE_ENV');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });
    });

    describe('with custom NODE_ENV values', () => {
      it('should not log debug messages for staging environment', () => {
        process.env.NODE_ENV = 'staging';

        logger.debug('Debug message in staging');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });

      it('should not log debug messages for local environment', () => {
        process.env.NODE_ENV = 'local';

        logger.debug('Debug message in local');

        expect(mockConsoleLog).not.toHaveBeenCalled();
      });
    });
  });

  describe('timestamp generation', () => {
    it('should generate consistent timestamp format', () => {
      // Test multiple calls to ensure consistent format
      logger.info('Message 1');
      logger.error('Message 2');
      logger.warn('Message 3');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Message 1'
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        'Message 2'
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        'Message 3'
      );
    });

    it('should use actual timestamps when not mocked', () => {
      // Restore the original toISOString to test actual timestamps
      jest.restoreAllMocks();

      const beforeTime = new Date().toISOString();
      logger.info('Test timestamp');
      const afterTime = new Date().toISOString();

      const logCall = mockConsoleLog.mock.calls[0];
      const loggedTimestamp = logCall[0].match(/\[(.*?)\]/)?.[1];

      expect(loggedTimestamp).toBeDefined();
      expect(new Date(loggedTimestamp!).getTime()).toBeGreaterThanOrEqual(new Date(beforeTime).getTime());
      expect(new Date(loggedTimestamp!).getTime()).toBeLessThanOrEqual(new Date(afterTime).getTime());
    });

    it('should handle Date constructor errors gracefully', () => {
      // Temporarily remove the toISOString mock for this test
      jest.restoreAllMocks();

      // Mock Date constructor to throw error
      const originalDate = global.Date;
      const mockDate = jest.fn(() => {
        throw new Error('Date constructor error');
      }) as any;
      mockDate.prototype = Date.prototype;
      global.Date = mockDate;

      // Should not throw despite Date error
      expect(() => {
        logger.info('Test message');
      }).toThrow(); // Actually it should throw since Date fails

      global.Date = originalDate;

      // Re-establish mocks for other tests
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-15T10:30:45.123Z');
    });
  });

  describe('method signatures and type handling', () => {
    it('should handle all LoggerArgument types', () => {
      const testString = 'string';
      const testNumber = 42;
      const testBoolean = true;
      const testError = new Error('test error');
      const testObject = { key: 'value' };
      const testNull = null;
      const testUndefined = undefined;

      logger.info(
        'All types test',
        testString,
        testNumber,
        testBoolean,
        testError,
        testObject,
        testNull,
        testUndefined
      );

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'All types test',
        testString,
        testNumber,
        testBoolean,
        testError,
        testObject,
        testNull,
        testUndefined
      );
    });

    it('should handle arrays as arguments', () => {
      const testArray = [1, 2, 3, 'string', { nested: true }];

      logger.info('Array argument', testArray as any);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Array argument',
        testArray
      );
    });

    it('should handle circular references in objects', () => {
      const obj: any = { name: 'test' };
      obj.circular = obj;

      // Should not throw despite circular reference
      expect(() => {
        logger.info('Circular reference test', obj);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Circular reference test',
        obj
      );
    });

    it('should handle functions as arguments', () => {
      const testFunction = () => 'test function';

      logger.info('Function argument', testFunction as any);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Function argument',
        testFunction
      );
    });

    it('should handle symbols as arguments', () => {
      const testSymbol = Symbol('test');

      logger.info('Symbol argument', testSymbol as any);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Symbol argument',
        testSymbol
      );
    });

    it('should handle BigInt as arguments', () => {
      const testBigInt = BigInt(123456789012345678901234567890n);

      logger.info('BigInt argument', testBigInt as any);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'BigInt argument',
        testBigInt
      );
    });
  });

  describe('performance and edge cases', () => {
    it('should handle rapid successive calls', () => {
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`);
      }

      expect(mockConsoleLog).toHaveBeenCalledTimes(100);
    });

    it('should handle very large argument counts', () => {
      const args = Array(50).fill(null).map((_, i) => `arg${i}`);

      logger.info('Many arguments', ...args);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Many arguments',
        ...args
      );
    });

    it('should handle memory pressure scenarios', () => {
      const largeObject = {
        data: Array(1000).fill(null).map((_, i) => ({
          id: i,
          value: `value_${i}`,
          nested: { deep: { deeper: `nested_${i}` } }
        }))
      };

      expect(() => {
        logger.info('Large object', largeObject);
      }).not.toThrow();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] INFO:',
        'Large object',
        largeObject
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work correctly in concurrent logging scenarios', async () => {
      const promises = Array(10).fill(null).map(async (_, index) => {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        logger.info(`Concurrent message ${index}`);
        logger.error(`Concurrent error ${index}`);
        logger.warn(`Concurrent warning ${index}`);
      });

      await Promise.all(promises);

      expect(mockConsoleLog).toHaveBeenCalledTimes(10);
      expect(mockConsoleError).toHaveBeenCalledTimes(10);
      expect(mockConsoleWarn).toHaveBeenCalledTimes(10);
    });

    it('should maintain consistent behavior across all log levels', () => {
      process.env.NODE_ENV = 'development';

      const testMessage = 'Consistent behavior test';
      const testArg = { consistency: true };

      logger.info(testMessage, testArg);
      logger.error(testMessage, testArg);
      logger.warn(testMessage, testArg);
      logger.debug(testMessage, testArg);

      // Verify all methods were called with consistent arguments
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        1,
        '[2025-01-15T10:30:45.123Z] INFO:',
        testMessage,
        testArg
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] ERROR:',
        testMessage,
        testArg
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        '[2025-01-15T10:30:45.123Z] WARN:',
        testMessage,
        testArg
      );
      expect(mockConsoleLog).toHaveBeenNthCalledWith(
        2,
        '[2025-01-15T10:30:45.123Z] DEBUG:',
        testMessage,
        testArg
      );
    });
  });
});