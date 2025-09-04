import axios from 'axios';

// API base configuration
const API_BASE_URL = 'http://localhost:5001';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Todo interface matching backend
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Create todo request interface
export interface CreateTodoRequest {
  text: string;
}

// Update todo request interface
export interface UpdateTodoRequest {
  text?: string;
  completed?: boolean;
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
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    const response = await api.get<ApiResponse<Todo[]>>('/api/todos');
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

  // Update todo
  updateTodo: async (id: string, updates: UpdateTodoRequest): Promise<Todo> => {
    const response = await api.put<ApiResponse<Todo>>(`/api/todos/${id}`, updates);
    return response.data.data;
  },

  // Toggle todo completion
  toggleTodo: async (id: string): Promise<Todo> => {
    const response = await api.patch<ApiResponse<Todo>>(`/api/todos/${id}/toggle`);
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

  // Get todos by completion status
  getTodosByStatus: async (completed?: boolean): Promise<Todo[]> => {
    const params = completed !== undefined ? { completed: completed.toString() } : {};
    const response = await api.get<ApiResponse<Todo[]>>('/api/todos/status', { params });
    return response.data.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
  const response = await api.get('/health');
  return response.data;
};

export default api;
