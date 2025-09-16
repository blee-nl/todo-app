import React from "react";
import type { IconProps } from "./constants";
import { DEFAULT_ICON_PROPS } from "./constants";

const BellSlashIcon: React.FC<IconProps> = ({
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
        d="M9.143 17.082a24.248 24.248 0 003.844.148m-3.844-.148a23.856 23.856 0 01-5.455-1.31A8.967 8.967 0 002.312 9.75 6 6 0 018.25 3.75V4m4.5 8.25V9a6 6 0 00-6-6m6 6a8.967 8.967 0 012.312 6.022c-1.733.64-3.56 1.085-5.455 1.31m0 0a3 3 0 11-5.714 0m5.714 0a24.255 24.255 0 01-5.714 0M3.75 3.75l16.5 16.5"
      />
    </svg>
  );
};

export default BellSlashIcon;