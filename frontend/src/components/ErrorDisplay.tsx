import React from "react";
import type { AppError } from "../utils/errorUtils";
import { Error } from "../design-system";

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

  const title = error.status ? `Error ${error.status}` : "Error";

  return (
    <Error
      title={title}
      message={error.message}
      code={error.code}
      onRetry={onRetry}
      onDismiss={onDismiss}
      variant="default"
      className={`mb-3 ${className}`}
    />
  );
};
