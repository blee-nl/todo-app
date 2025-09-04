import React from "react";
import type { AppError } from "../utils/errorUtils";

interface InlineErrorDisplayProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const InlineErrorDisplay: React.FC<InlineErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
}) => {
  if (!error) return null;

  return (
    <div
      className="bg-red-50 border-l-4 border-red-400 p-2 mt-2 rounded-r-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-red-400 flex-shrink-0"
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
        <span className="text-sm text-red-700 flex-1">{error.message}</span>
        <div className="flex gap-1">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-100"
              aria-label="Retry operation"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <svg
                className="w-3 h-3"
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
