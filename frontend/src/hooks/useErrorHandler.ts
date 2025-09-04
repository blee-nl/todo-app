import { useCallback, useState } from 'react';
import { createAppError } from '../utils';
import type { AppError } from '../utils/errorUtils';

export interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  showToast?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const { onError, showToast = false } = options;
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  const handleError = useCallback((error: unknown) => {
    const appError = createAppError(error);
    
    // Set current error for display
    setCurrentError(appError);
    
    // Log error for debugging
    console.error('Error handled:', appError);
    
    // Call custom error handler if provided
    if (onError) {
      onError(appError);
    }
    
    // Show toast notification if enabled
    if (showToast) {
      // TODO: Implement toast notification system
      console.warn('Toast notification:', appError.message);
    }
    
    return appError;
  }, [onError, showToast]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryOperation = useCallback((retryFn: () => void) => {
    clearError();
    retryFn();
  }, [clearError]);

  return { 
    handleError, 
    currentError, 
    clearError, 
    retryOperation 
  };
};
