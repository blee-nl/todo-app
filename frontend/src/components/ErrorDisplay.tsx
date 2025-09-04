import React from "react";
import type { AppError } from "../utils/errorUtils";

interface ErrorDisplayProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  className = "",
}) => {
  if (!error) return null;

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-3 mb-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-red-800 mb-1">
            {error.status ? `Error ${error.status}` : "Error"}
          </h4>
          <p className="text-sm text-red-700">{error.message}</p>
          {error.code && (
            <p className="text-xs text-red-600 mt-1">Code: {error.code}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              aria-label="Retry operation"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              aria-label="Dismiss error"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
