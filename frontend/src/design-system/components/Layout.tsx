import React from "react";
import { cn } from "../../utils/styles/classNames";

export interface ContainerProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = "lg",
  className,
}) => {
  const sizeClasses = {
    sm: "max-w-3xl",
    md: "max-w-4xl",
    lg: "max-w-7xl",
    xl: "max-w-8xl",
    full: "max-w-none",
  };

  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
};

export interface SectionProps {
  children: React.ReactNode;
  spacing?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  spacing = "md",
  className,
}) => {
  const spacingClasses = {
    sm: "py-4 sm:py-6",
    md: "py-8 sm:py-12",
    lg: "py-12 sm:py-16",
    xl: "py-16 sm:py-20",
  };

  return (
    <section className={cn(spacingClasses[spacing], className)}>
      {children}
    </section>
  );
};

export interface FlexProps {
  children: React.ReactNode;
  direction?: "row" | "col";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: "xs" | "sm" | "md" | "lg" | "xl";
  wrap?: boolean;
  className?: string;
}

export const Flex: React.FC<FlexProps> = ({
  children,
  direction = "row",
  align = "center",
  justify = "start",
  gap = "md",
  wrap = false,
  className,
}) => {
  const directionClasses = {
    row: "flex-row",
    col: "flex-col",
  };

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const gapClasses = {
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
    xl: "gap-6",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
};

export interface StackProps {
  children: React.ReactNode;
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = "md",
  className,
}) => {
  const spacingClasses = {
    xs: "space-y-1",
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
    xl: "space-y-6",
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>{children}</div>
  );
};
