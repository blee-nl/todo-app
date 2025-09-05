import React from "react";
import { cn } from "../../utils/styles/classNames";

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isRequired?: boolean;
  characterCount?: {
    current: number;
    max: number;
  };
}

const baseClasses =
  "w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none";
const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500";
const disabledClasses = "bg-gray-100 text-gray-400 cursor-not-allowed";

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  helperText,
  isRequired = false,
  characterCount,
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        className={cn(
          baseClasses,
          error ? errorClasses : "",
          props.disabled ? disabledClasses : "",
          className
        )}
        {...props}
      />

      {/* Character count and helper text */}
      <div className="flex justify-between items-center">
        {error && <p className="text-sm text-red-600">{error}</p>}
        
        {!error && helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
        
        {characterCount && (
          <p className="text-sm text-gray-500 ml-auto">
            {characterCount.current}/{characterCount.max}
          </p>
        )}
      </div>
    </div>
  );
};

export default TextArea;
