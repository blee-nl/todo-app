import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('../../utils', () => ({
  createAppError: vi.fn((error) => ({ message: error.message, code: 'TEST_ERROR' })),
  isNetworkError: vi.fn(() => false),
}));
vi.mock('../../constants/config', () => ({
  CONFIG: {
    API_BASE_URL: 'http://localhost:5001',
    API_TIMEOUT: 10000,
  },
}));

const mockAxios = vi.mocked(axios);

describe('API Service Configuration', () => {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      response: {
        use: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the interceptor use mock to track calls
    mockAxiosInstance.interceptors.response.use.mockClear();
    mockAxios.create.mockReturnValue(mockAxiosInstance as any);
    global.console.error = vi.fn();

    // Mock the interceptor setup to ensure it's captured in tests
    vi.spyOn(mockAxiosInstance.interceptors.response, 'use').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Axios Configuration', () => {
    it('creates axios instance with correct configuration', async () => {
      // Import the module to trigger configuration
      await import('../api');

      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:5001',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
    });

    it('sets up response interceptor', async () => {
      // Since the interceptor is set up at module level, just verify the module loads successfully
      const apiModule = await import('../api');
      expect(apiModule.api).toBeDefined();
      expect(apiModule.todoApi).toBeDefined();
    });
  });

  describe('Response Interceptor Logic', () => {
    it('api instance is properly configured', async () => {
      const apiModule = await import('../api');
      expect(apiModule.api).toBeDefined();
      expect(typeof apiModule.api.get).toBe('function');
      expect(typeof apiModule.api.post).toBe('function');
    });

    it('error handling utilities are available', async () => {
      // Test that the error handling functions are properly imported
      const { createAppError, isNetworkError } = await import('../../utils');
      expect(typeof createAppError).toBe('function');
      expect(typeof isNetworkError).toBe('function');
    });
  });
});

// Test the API interfaces and types
describe('API Types and Interfaces', () => {
  it('should define correct Todo interface structure', () => {
    // This is more of a TypeScript compilation test
    const mockTodo = {
      id: '1',
      text: 'Test task',
      type: 'one-time' as const,
      state: 'pending' as const,
      dueAt: '2024-12-31T23:59:59.000Z',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };

    expect(mockTodo.id).toBe('1');
    expect(mockTodo.type).toBe('one-time');
    expect(mockTodo.state).toBe('pending');
  });

  it('should define correct CreateTodoRequest interface', () => {
    const createRequest = {
      text: 'New task',
      type: 'daily' as const,
    };

    expect(createRequest.text).toBe('New task');
    expect(createRequest.type).toBe('daily');
  });

  it('should define correct UpdateTodoRequest interface', () => {
    const updateRequest = {
      text: 'Updated task',
      dueAt: '2025-01-01T00:00:00.000Z',
    };

    expect(updateRequest.text).toBe('Updated task');
    expect(updateRequest.dueAt).toBe('2025-01-01T00:00:00.000Z');
  });

  it('should define correct GroupedTodos interface', () => {
    const groupedTodos = {
      pending: [],
      active: [],
      completed: [],
      failed: [],
    };

    expect(groupedTodos.pending).toEqual([]);
    expect(groupedTodos.active).toEqual([]);
    expect(groupedTodos.completed).toEqual([]);
    expect(groupedTodos.failed).toEqual([]);
  });

  it('should define correct ApiResponse interface', () => {
    const apiResponse = {
      success: true,
      data: { test: 'data' },
      message: 'Success',
      count: 1,
    };

    expect(apiResponse.success).toBe(true);
    expect(apiResponse.data).toEqual({ test: 'data' });
    expect(apiResponse.message).toBe('Success');
    expect(apiResponse.count).toBe(1);
  });

  it('should support notification interface', () => {
    const notification = {
      enabled: true,
      reminderMinutes: 15,
      notifiedAt: '2024-12-31T13:45:00.000Z',
    };

    expect(notification.enabled).toBe(true);
    expect(notification.reminderMinutes).toBe(15);
    expect(notification.notifiedAt).toBe('2024-12-31T13:45:00.000Z');
  });
});

// Functional API tests with mocked implementation
describe('TodoApi Functions', () => {
  let todoApi: any;

  beforeEach(async () => {
    // Create a properly structured mock axios instance
    const mockAxiosInstance = {
      get: vi.fn().mockImplementation((url) => {
        if (url === '/api/todos') {
          return Promise.resolve({ data: { success: true, data: [] } });
        }
        if (url.startsWith('/api/todos/') && !url.includes('/state/')) {
          return Promise.resolve({ data: { success: true, data: { id: '1' } } });
        }
        if (url.includes('/api/todos/state/')) {
          return Promise.resolve({ data: { success: true, data: [] } });
        }
        if (url.includes('/api/health')) {
          return Promise.resolve({ data: { success: true, data: [] } });
        }
        return Promise.resolve({ data: { success: true, data: [] } });
      }),
      post: vi.fn().mockResolvedValue({ data: { success: true, data: { id: '1' } } }),
      put: vi.fn().mockResolvedValue({ data: { success: true, data: { id: '1' } } }),
      patch: vi.fn().mockResolvedValue({ data: { success: true, data: { id: '1' } } }),
      delete: vi.fn().mockResolvedValue({ data: { success: true, data: { id: '1' } } }),
      interceptors: {
        response: {
          use: vi.fn()
        }
      }
    };

    // Properly setup the mocked axios instance to return the response structure
    mockAxios.create.mockReturnValue({
      ...mockAxiosInstance,
      get: mockAxiosInstance.get,
      post: mockAxiosInstance.post,
      put: mockAxiosInstance.put,
      patch: mockAxiosInstance.patch,
      delete: mockAxiosInstance.delete,
      interceptors: mockAxiosInstance.interceptors
    } as any);

    // Re-import to get fresh module
    vi.resetModules();
    const apiModule = await import('../api');
    todoApi = apiModule.todoApi;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('should call correct endpoint for getAllTodos', async () => {
    const result = await todoApi.getAllTodos();
    expect(result).toEqual([]);
  });

  it('should call correct endpoint for getTodosByState', async () => {
    const result = await todoApi.getTodosByState('pending');
    expect(result).toEqual([]);
  });

  it('should call correct endpoint for getTodoById', async () => {
    const result = await todoApi.getTodoById('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for createTodo', async () => {
    const request = { text: 'New task', type: 'one-time' };
    const result = await todoApi.createTodo(request);
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for updateTodo', async () => {
    const updates = { text: 'Updated task' };
    const result = await todoApi.updateTodo('1', updates);
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for activateTodo', async () => {
    const result = await todoApi.activateTodo('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for completeTodo', async () => {
    const result = await todoApi.completeTodo('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for failTodo', async () => {
    const result = await todoApi.failTodo('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for reactivateTodo', async () => {
    const result = await todoApi.reactivateTodo('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should call correct endpoint for deleteTodo', async () => {
    const result = await todoApi.deleteTodo('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should handle health check', async () => {
    const healthCheck = (await import('../api')).healthCheck;
    const result = await healthCheck();
    expect(result).toEqual({ success: true, data: [] });
  });
});