// Constants for CustomDateTimePicker component

export const MONTH_NAMES = [
  "January",
  "February", 
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const CALENDAR_GRID_SIZE = 42; // 6 weeks * 7 days

export const TIME_SELECTION = {
  HOURS: Array.from({ length: 24 }, (_, i) => i),
  MINUTES: Array.from({ length: 60 }, (_, i) => i),
} as const;

export const DEFAULT_TIME_OFFSET_MINUTES = 60; // 1 hour from now

export const MINIMUM_TIME_BUFFER_MINUTES = 10; // 10 minutes buffer

export const CSS_CLASSES = {
  // Input button classes
  INPUT_BUTTON: {
    BASE: "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
    DISABLED: "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200",
    OPEN: "border-blue-500 bg-blue-50 text-blue-900 shadow-lg",
    DEFAULT: "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm",
  },
  
  // Calendar popup classes
  CALENDAR_POPUP: {
    BASE: "absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 min-w-80",
    MOBILE: "fixed inset-x-4 top-1/2 transform -translate-y-1/2 max-w-sm mx-auto",
  },
  
  // Calendar header classes
  CALENDAR_HEADER: {
    BASE: "flex items-center justify-between mb-4",
    NAV_BUTTON: "p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200",
    MONTH_YEAR: "text-lg font-semibold text-gray-900",
  },
  
  // Calendar grid classes
  CALENDAR_GRID: {
    BASE: "grid grid-cols-7 gap-1 mb-4",
    WEEK_DAY: "text-center text-sm font-medium text-gray-500 py-2",
    DATE_BUTTON: {
      BASE: "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
      DISABLED: "text-gray-300 cursor-not-allowed",
      SELECTED: "bg-blue-500 text-white shadow-lg",
      TODAY: "bg-green-100 text-green-700 font-semibold border-2 border-green-300",
      CURRENT_MONTH: "text-gray-900 hover:bg-gray-100",
      OTHER_MONTH: "text-gray-400 hover:bg-gray-50",
    },
  },
  
  // Time picker classes
  TIME_PICKER: {
    BASE: "flex items-center space-x-4",
    SELECT: {
      BASE: "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
      CONTAINER: "flex flex-col",
      LABEL: "text-xs font-medium text-gray-600 mb-1",
    },
  },
  
  // Action buttons classes
  ACTION_BUTTONS: {
    BASE: "flex justify-end space-x-2 pt-4 border-t border-gray-200",
    BUTTON: {
      BASE: "px-4 py-2 rounded-lg font-medium transition-colors duration-200",
      PRIMARY: "bg-blue-500 text-white hover:bg-blue-600",
      SECONDARY: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    },
  },
} as const;

export const ARIA_LABELS = {
  CALENDAR_BUTTON: "Open calendar",
  PREVIOUS_MONTH: "Previous month",
  NEXT_MONTH: "Next month",
  SELECT_DATE: "Select date",
  SELECT_HOUR: "Select hour",
  SELECT_MINUTE: "Select minute",
  CONFIRM_SELECTION: "Confirm selection",
  CANCEL_SELECTION: "Cancel selection",
} as const;
