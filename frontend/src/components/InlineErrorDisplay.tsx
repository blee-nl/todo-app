import React from "react";
import type { AppError } from "../utils/errorUtils";
import { Error } from "../design-system";

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
    <Error
      message={error.message}
      code={error.code}
      onRetry={onRetry}
      onDismiss={onDismiss}
      variant="inline"
      className="mt-2"
    />
  );
};
