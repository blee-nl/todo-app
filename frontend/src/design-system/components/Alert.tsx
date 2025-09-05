import React from "react";
import { cn } from "../../utils/styles/classNames";
import {
  ErrorIcon,
  WarningIcon,
  SuccessIcon,
  InfoIcon,
  CloseIcon,
} from "../../assets/icons";
import { Text, Heading } from "./Typography";
import Button from "./Button";

export interface AlertProps {
  variant?: "error" | "warning" | "success" | "info";
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  variant = "info",
  title,
  children,
  onClose,
  className,
  showIcon = true,
}) => {
  const baseClasses = "border rounded-lg p-4 transition-all duration-200";

  const variantClasses = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    success: "bg-green-50 border-green-200 text-green-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  const iconMap = {
    error: ErrorIcon,
    warning: WarningIcon,
    success: SuccessIcon,
    info: InfoIcon,
  };

  const IconComponent = iconMap[variant];

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <IconComponent
              className={cn(
                "w-5 h-5",
                variant === "error" && "text-red-400",
                variant === "warning" && "text-yellow-400",
                variant === "success" && "text-green-400",
                variant === "info" && "text-blue-400"
              )}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <Heading level={4} className="mb-1">
              {title}
            </Heading>
          )}
          <Text variant="body" className="text-current">
            {children}
          </Text>
        </div>

        {onClose && (
          <div className="flex-shrink-0">
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className={cn(
                "p-1",
                variant === "error" &&
                  "text-red-600 hover:text-red-800 hover:bg-red-100",
                variant === "warning" &&
                  "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100",
                variant === "success" &&
                  "text-green-600 hover:text-green-800 hover:bg-green-100",
                variant === "info" &&
                  "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              )}
              aria-label="Close alert"
            >
              <CloseIcon size="sm" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Inline Alert Component
export interface InlineAlertProps {
  variant?: "error" | "warning" | "success" | "info";
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = "info",
  children,
  onClose,
  className,
  showIcon = true,
}) => {
  const baseClasses = "border-l-4 p-3 rounded-r-lg transition-all duration-200";

  const variantClasses = {
    error: "bg-red-50 border-red-400 text-red-700",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-700",
    success: "bg-green-50 border-green-400 text-green-700",
    info: "bg-blue-50 border-blue-400 text-blue-700",
  };

  const iconMap = {
    error: ErrorIcon,
    warning: WarningIcon,
    success: SuccessIcon,
    info: InfoIcon,
  };

  const IconComponent = iconMap[variant];

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        {showIcon && (
          <IconComponent
            className={cn(
              "w-4 h-4 flex-shrink-0",
              variant === "error" && "text-red-400",
              variant === "warning" && "text-yellow-400",
              variant === "success" && "text-green-400",
              variant === "info" && "text-blue-400"
            )}
          />
        )}

        <Text variant="small" className="text-current flex-1">
          {children}
        </Text>

        {onClose && (
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className={cn(
              "p-1",
              variant === "error" &&
                "text-red-600 hover:text-red-800 hover:bg-red-100",
              variant === "warning" &&
                "text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100",
              variant === "success" &&
                "text-green-600 hover:text-green-800 hover:bg-green-100",
              variant === "info" &&
                "text-blue-600 hover:text-blue-800 hover:bg-blue-100"
            )}
            aria-label="Close alert"
          >
            <CloseIcon size="xs" />
          </Button>
        )}
      </div>
    </div>
  );
};
