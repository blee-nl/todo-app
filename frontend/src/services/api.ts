import axios from 'axios';
import { CONFIG } from '../constants/config';
import { createAppError, isNetworkError } from '../utils';
import type { TaskNotificationSettings } from '../types/notification';

// Create axios instance with default config
export const api = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: CONFIG.API_TIMEOUT,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = createAppError(error);
    
    // Log different types of errors appropriately
    if (isNetworkError(error)) {
      console.error('Network Error:', appError.message);
    } else {
      console.error('API Error:', appError);
    }
    
    return Promise.reject(appError);
  }
);

// Task types
export type TaskType = 'one-time' | 'daily';

// Task states
export type TaskState = 'pending' | 'active' | 'completed' | 'failed';

// Notification interface for API
export interface TodoNotification {
  enabled: boolean;
  reminderMinutes: number;
  notifiedAt?: string;
}

// Todo interface
export interface Todo {
  id: string;
  text: string;
  type: TaskType;
  state: TaskState;
  dueAt?: string; // For one-time tasks
  notification?: TodoNotification; // Notification settings
  createdAt: string;
  updatedAt: string;
  activatedAt?: string; // When task was moved to active
  completedAt?: string; // When task was completed
  failedAt?: string; // When task was marked as failed
  originalId?: string; // For tracking re-activated tasks
  isReactivation?: boolean; // Flag for re-activated tasks
}

// Create todo request interface
export interface CreateTodoRequest {
  text: string;
  type: TaskType;
  dueAt?: string; // Required for one-time tasks
  notification?: {
    enabled: boolean;
    reminderMinutes?: number;
  };
}

// Update todo request interface
export interface UpdateTodoRequest {
  text?: string;
  dueAt?: string;
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

// Re-activate todo request interface
export interface ReactivateTodoRequest {
  newDueAt?: string; // For one-time tasks
  notification?: {
    enabled: boolean;
    reminderMinutes: number;
  };
}

// Grouped todos interface
export interface GroupedTodos {
  pending: Todo[];
  active: Todo[];
  completed: Todo[];
  failed: Todo[];
}

// API response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}


// Todo API functions
export const todoApi = {
  // Get all todos grouped by state
  getAllTodos: async (): Promise<GroupedTodos> => {
    const response = await api.get<ApiResponse<GroupedTodos>>('/api/todos');
    return response.data.data;
  },

  // Get todos by state
  getTodosByState: async (state: TaskState): Promise<Todo[]> => {
    const response = await api.get<ApiResponse<Todo[]>>(`/api/todos/state/${state}`);
    return response.data.data;
  },

  // Get single todo by ID
  getTodoById: async (id: string): Promise<Todo> => {
    const response = await api.get<ApiResponse<Todo>>(`/api/todos/${id}`);
    return response.data.data;
  },

  // Create new todo
  createTodo: async (todo: CreateTodoRequest): Promise<Todo> => {
    const response = await api.post<ApiResponse<Todo>>('/api/todos', todo);
    return response.data.data;
  },

  // Update todo (only text for active tasks)
  updateTodo: async (id: string, updates: UpdateTodoRequest): Promise<Todo> => {
    const response = await api.put<ApiResponse<Todo>>(`/api/todos/${id}`, updates);
    return response.data.data;
  },

  // Activate a pending task
  activateTodo: async (id: string): Promise<Todo> => {
    const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/activate`);
    return response.data.data;
  },

  // Complete an active task
  completeTodo: async (id: string): Promise<Todo> => {
    const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/complete`);
    return response.data.data;
  },

  // Mark an active task as failed
  failTodo: async (id: string): Promise<Todo> => {
    const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/fail`);
    return response.data.data;
  },

  // Re-activate a completed or failed task
  reactivateTodo: async (id: string, request?: ReactivateTodoRequest): Promise<Todo> => {
    const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/reactivate`, request);
    return response.data.data;
  },

  // Delete todo
  deleteTodo: async (id: string): Promise<{ id: string }> => {
    const response = await api.delete<ApiResponse<{ id: string }>>(`/api/todos/${id}`);
    return response.data.data;
  },

  // Delete all completed todos
  deleteCompletedTodos: async (): Promise<{ deletedCount: number }> => {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/api/todos/completed');
    return response.data.data;
  },

  // Delete all failed todos
  deleteFailedTodos: async (): Promise<{ deletedCount: number }> => {
    const response = await api.delete<ApiResponse<{ deletedCount: number }>>('/api/todos/failed');
    return response.data.data;
  },

  // Notification endpoints
  getTasksForNotification: async (): Promise<Array<{ task: Todo; notification: TaskNotificationSettings }>> => {
    const response = await api.get('/api/todos/notifications');
    return response.data.data;
  },

  updateNotificationSettings: async (
    id: string,
    settings: { enabled: boolean; reminderMinutes?: number }
  ): Promise<Todo> => {
    const response = await api.put(`/api/todos/${id}/notification`, settings);
    return response.data.data;
  },

  markTaskAsNotified: async (id: string): Promise<void> => {
    await api.post(`/api/todos/${id}/notification/mark`);
  },

};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
