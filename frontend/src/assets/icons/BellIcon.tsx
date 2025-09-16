import React from "react";
import type { IconProps } from "./constants";
import { DEFAULT_ICON_PROPS } from "./constants";

const BellIcon: React.FC<IconProps> = ({
  size = DEFAULT_ICON_PROPS.size,
  className = DEFAULT_ICON_PROPS.className,
  ...props
}) => {
  const sizeClasses = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  } as const;

  return (
    <svg
      className={`${sizeClasses[size || 'md']} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
};

export default BellIcon;