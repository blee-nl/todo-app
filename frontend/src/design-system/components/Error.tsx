import React from "react";
import { cn } from "../../utils/styles/classNames";
import { ErrorIcon, CloseIcon, RefreshIcon } from "../../assets/icons";
import { Text, Heading } from "./Typography";
import Button from "./Button";

export interface ErrorProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: "default" | "inline" | "compact";
  className?: string;
  showIcon?: boolean;
}

const baseClasses = "transition-all duration-200";

const variantConfig = {
  default: {
    container: "bg-red-50 border border-red-200 rounded-lg p-4",
    iconSize: "w-5 h-5",
    textSize: "text-sm",
    layout: "flex items-start gap-3",
    iconPosition: "flex-shrink-0",
    contentPosition: "flex-1 min-w-0",
    errorButtonClassNames:
      "text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-100",
    retryButtonClassNames:
      "inline-flex items-center gap-1 text-sm font-medium hover:underline mt-2 text-red-600 hover:text-red-800",
  },
  inline: {
    container: "bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg",
    iconSize: "w-4 h-4",
    textSize: "text-sm",
    layout: "flex items-center gap-2",
    iconPosition: "flex-shrink-0",
    contentPosition: "flex-1",
    errorButtonClassNames:
      "text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-100",
    retryButtonClassNames:
      "text-red-600 hover:text-red-800 text-xs font-medium px-2 py-1 rounded hover:bg-red-100",
  },
  compact: {
    container: "bg-red-50 border border-red-200 rounded-md p-2",
    iconSize: "w-3 h-3",
    textSize: "text-xs",
    layout: "flex items-center gap-2",
    iconPosition: "flex-shrink-0",
    contentPosition: "flex-1 min-w-0",
    errorButtonClassNames: "text-red-600 hover:text-red-800 p-1 rounded",
    retryButtonClassNames: "text-red-600 hover:text-red-800 p-1 rounded",
  },
};

const ErrorIconComponent: React.FC<{
  variant: keyof typeof variantConfig;
  showIcon: boolean;
}> = ({ variant, showIcon }) => {
  if (!showIcon) return null;

  const config = variantConfig[variant];
  return (
    <div className={config.iconPosition}>
      <ErrorIcon className={cn(config.iconSize, "text-red-400")} />
    </div>
  );
};

const ErrorContent: React.FC<{
  title?: string;
  message: string;
  code?: string;
  variant: keyof typeof variantConfig;
  onRetry?: () => void;
}> = ({ title, message, code, variant, onRetry }) => {
  const config = variantConfig[variant];

  if (variant === "inline") {
    return (
      <Text variant="error" className={cn(config.textSize, "flex-1")}>
        {message}
      </Text>
    );
  }

  if (variant === "compact") {
    return (
      <div className="flex-1 min-w-0">
        <Text variant="error" className={config.textSize}>
          {message}
        </Text>
        {code && (
          <Text variant="muted" className="text-xs opacity-75">
            Code: {code}
          </Text>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex-1 min-w-0">
      {title && (
        <Heading level={4} className="mb-1">
          {title}
        </Heading>
      )}
      <Text variant="error" className={config.textSize}>
        {message}
      </Text>
      {code && (
        <Text variant="muted" className="text-xs opacity-75 mt-1">
          Code: {code}
        </Text>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="ghost"
          size="sm"
          className={config.retryButtonClassNames}
          aria-label="Retry operation"
        >
          <RefreshIcon size="xs" />
          Retry
        </Button>
      )}
    </div>
  );
};

const ErrorActions: React.FC<{
  variant: keyof typeof variantConfig;
  onRetry?: () => void;
  onDismiss?: () => void;
}> = ({ variant, onRetry, onDismiss }) => {
  const config = variantConfig[variant];

  if (variant === "inline") {
    return (
      <>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className={config.errorButtonClassNames}
            aria-label="Retry operation"
          >
            <RefreshIcon size="xs" />
          </Button>
        )}
        {onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className={config.errorButtonClassNames}
            aria-label="Dismiss error"
          >
            <CloseIcon size="xs" />
          </Button>
        )}
      </>
    );
  }

  if (variant === "compact") {
    return onDismiss ? (
      <Button
        onClick={onDismiss}
        variant="ghost"
        size="sm"
        className={config.errorButtonClassNames}
        aria-label="Dismiss error"
      >
        <CloseIcon size="xs" />
      </Button>
    ) : null;
  }

  // Default variant
  return onDismiss ? (
    <div className="flex-shrink-0">
      <Button
        onClick={onDismiss}
        variant="ghost"
        size="sm"
        className={config.errorButtonClassNames}
        aria-label="Dismiss error"
      >
        <CloseIcon size="sm" />
      </Button>
    </div>
  ) : null;
};

export const Error: React.FC<ErrorProps> = ({
  title,
  message,
  code,
  onRetry,
  onDismiss,
  variant = "default",
  className,
  showIcon = true,
}) => {
  const config = variantConfig[variant];

  return (
    <div
      className={cn(baseClasses, config.container, className)}
      role="alert"
      aria-live="polite"
    >
      <div className={config.layout}>
        <ErrorIconComponent variant={variant} showIcon={showIcon} />

        <ErrorContent
          title={title}
          message={message}
          code={code}
          variant={variant}
          onRetry={onRetry}
        />

        <ErrorActions
          variant={variant}
          onRetry={onRetry}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
};
