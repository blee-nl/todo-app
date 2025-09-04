// Error handling utilities

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

// Extract error message from various error types
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
};

// Extract error code from API errors
export const getErrorCode = (error: unknown): string | undefined => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status?.toString();
  }
  
  if (error && typeof error === 'object' && 'code' in error) {
    return String(error.code);
  }
  
  return undefined;
};

// Check if error is a network error
export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'code' in error) {
    return error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED';
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase();
    return message.includes('network') || message.includes('timeout');
  }
  
  return false;
};

// Check if error is a 4xx client error
export const isClientError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status ? response.status >= 400 && response.status < 500 : false;
  }
  
  return false;
};

// Check if error is a 5xx server error
export const isServerError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    return response?.status ? response.status >= 500 : false;
  }
  
  return false;
};

// Create a standardized error object
export const createAppError = (error: unknown): AppError => {
  return {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    status: error && typeof error === 'object' && 'response' in error 
      ? (error as { response?: { status?: number } }).response?.status 
      : undefined,
  };
};
