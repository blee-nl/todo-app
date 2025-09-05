import { cn } from "./classNames";

/**
 * Get CSS classes for date button based on state
 */
export const getDateButtonClasses = (day: {
  isDisabled: boolean;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
}): string => {
  const baseClasses = "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200";
  
  if (day.isDisabled) {
    return cn(baseClasses, "text-gray-300 cursor-not-allowed");
  }
  
  if (day.isSelected) {
    return cn(baseClasses, "bg-blue-600 text-white shadow-lg ring-2 ring-blue-200");
  }
  
  if (day.isToday) {
    return cn(baseClasses, "bg-green-100 text-green-700 font-semibold border-2 border-green-300");
  }
  
  if (day.isCurrentMonth) {
    return cn(baseClasses, "text-gray-900 hover:bg-gray-100");
  }
  
  return cn(baseClasses, "text-gray-400 hover:bg-gray-50");
};

/**
 * Get CSS classes for input button based on state
 */
export const getInputButtonClasses = (isOpen: boolean, disabled: boolean): string => {
  const baseClasses = "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left";
  
  if (disabled) {
    return cn(baseClasses, "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200");
  }
  
  if (isOpen) {
    return cn(baseClasses, "border-blue-500 bg-blue-50 text-blue-900 shadow-lg");
  }
  
  return cn(baseClasses, "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm");
};
