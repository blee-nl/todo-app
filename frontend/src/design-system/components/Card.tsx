import React from "react";
import { cn } from "../../utils/styles/classNames";

export interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "active" | "overdue" | "failed";
  hover?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  hover = true,
  className,
}) => {
  const baseClasses =
    "bg-white rounded-2xl shadow-lg border border-gray-200 p-4";

  const variantClasses = {
    default: "",
    active: "border-green-200",
    overdue: "border-red-200",
    failed: "border-red-200",
  };

  const hoverClasses = hover
    ? "hover:shadow-md transition-all duration-200"
    : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
