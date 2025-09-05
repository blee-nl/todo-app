import React from "react";
import { cn } from "../../utils/styles/classNames";

// Text Component
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "body" | "small" | "muted" | "error" | "success" | "warning";
  weight?: "normal" | "medium" | "semibold" | "bold";
  as?: "p" | "span" | "div";
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = "body",
  weight = "normal",
  as: Component = "p",
  className,
  ...props
}) => {
  const baseClasses = "transition-colors duration-200";

  const variantClasses = {
    body: "text-gray-900",
    small: "text-sm text-gray-700",
    muted: "text-gray-500",
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
  };

  const weightClasses = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  return (
    <Component
      className={cn(
        baseClasses,
        variantClasses[variant],
        weightClasses[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

// Heading Component
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "default" | "muted" | "error" | "success" | "warning";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  level = 1,
  variant = "default",
  as,
  className,
  ...props
}) => {
  const baseClasses = "font-semibold transition-colors duration-200";

  const sizeClasses = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-base",
    6: "text-sm",
  };

  const variantClasses = {
    default: "text-gray-900",
    muted: "text-gray-600",
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
  };

  const classes = cn(
    baseClasses,
    sizeClasses[level],
    variantClasses[variant],
    className
  );

  if (as) {
    const Component = as;
    return (
      <Component className={classes} {...props}>
        {children}
      </Component>
    );
  }

  switch (level) {
    case 1:
      return (
        <h1 className={classes} {...props}>
          {children}
        </h1>
      );
    case 2:
      return (
        <h2 className={classes} {...props}>
          {children}
        </h2>
      );
    case 3:
      return (
        <h3 className={classes} {...props}>
          {children}
        </h3>
      );
    case 4:
      return (
        <h4 className={classes} {...props}>
          {children}
        </h4>
      );
    case 5:
      return (
        <h5 className={classes} {...props}>
          {children}
        </h5>
      );
    case 6:
      return (
        <h6 className={classes} {...props}>
          {children}
        </h6>
      );
    default:
      return (
        <h1 className={classes} {...props}>
          {children}
        </h1>
      );
  }
};

// Label Component
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: "default" | "required" | "error" | "success";
  size?: "sm" | "md" | "lg";
}

export const Label: React.FC<LabelProps> = ({
  children,
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  const baseClasses = "block font-medium transition-colors duration-200";

  const variantClasses = {
    default: "text-gray-700",
    required: "text-gray-700",
    error: "text-red-600",
    success: "text-green-600",
  };

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <label
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
      {variant === "required" && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

// Caption Component
export interface CaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "muted" | "error" | "success" | "warning";
}

export const Caption: React.FC<CaptionProps> = ({
  children,
  variant = "default",
  className,
  ...props
}) => {
  const baseClasses = "text-xs font-medium transition-colors duration-200";

  const variantClasses = {
    default: "text-gray-600",
    muted: "text-gray-500",
    error: "text-red-600",
    success: "text-green-600",
    warning: "text-yellow-600",
  };

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
};
