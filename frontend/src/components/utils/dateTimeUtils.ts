import { MINIMUM_TIME_BUFFER_MINUTES, DEFAULT_TIME_OFFSET_MINUTES } from '../constants/dateTimePickerConstants';
import { cn } from '../../utils/styles/classNames';

// Time utility functions for CustomDateTimePicker

export interface TimeState {
  hours: number;
  minutes: number;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
}

/**
 * Get default time (1 hour from now)
 */
export const getDefaultTime = (): TimeState => {
  const oneHourFromNow = new Date();
  oneHourFromNow.setHours(oneHourFromNow.getHours() + DEFAULT_TIME_OFFSET_MINUTES / 60);
  return {
    hours: oneHourFromNow.getHours(),
    minutes: oneHourFromNow.getMinutes(),
  };
};

/**
 * Check if a date is today
 */
export const isToday = (date: Date): boolean => {
  return date.toDateString() === new Date().toDateString();
};

/**
 * Check if a date is disabled based on time constraints
 */
export const isDateDisabled = (date: Date, selectedTime: TimeState): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isToday(date)) {
    const now = new Date();
    const bufferTime = new Date(now.getTime() + MINIMUM_TIME_BUFFER_MINUTES * 60 * 1000);
    const selectedDateTime = new Date(date);
    selectedDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
    return selectedDateTime < bufferTime;
  }
  
  return date < today;
};

/**
 * Generate calendar days for a given month
 */
export const generateCalendarDays = (
  displayDate: Date,
  selectedDate: Date | null,
  selectedTime: TimeState
): CalendarDay[] => {
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days: CalendarDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const isCurrentMonth = date.getMonth() === month;
    const isTodayDate = isToday(date);
    const isSelected = selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
    const isDisabled = isDateDisabled(date, selectedTime);

    days.push({
      date,
      isCurrentMonth,
      isToday: isTodayDate,
      isSelected,
      isDisabled,
    });
  }

  return days;
};

/**
 * Format display value for the input
 */
export const formatDisplayValue = (
  date: Date | null,
  time: TimeState,
  placeholder: string
): string => {
  if (!date) return placeholder;

  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = `${time.hours.toString().padStart(2, "0")}:${time.minutes
    .toString()
    .padStart(2, "0")}`;

  return `${dateStr} at ${timeStr}`;
};

/**
 * Format date and time to ISO string for API
 */
export const formatToISOString = (date: Date, time: TimeState): string => {
  const newDateTime = new Date(date);
  newDateTime.setHours(time.hours, time.minutes, 0, 0);
  
  const year = newDateTime.getFullYear();
  const month = String(newDateTime.getMonth() + 1).padStart(2, "0");
  const day = String(newDateTime.getDate()).padStart(2, "0");
  const hours = String(newDateTime.getHours()).padStart(2, "0");
  const minutes = String(newDateTime.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get CSS classes for date button based on state
 */
export const getDateButtonClasses = (day: CalendarDay): string => {
  const baseClasses = "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200";
  
  if (day.isDisabled) {
    return cn(baseClasses, "text-gray-300 cursor-not-allowed");
  }
  
  if (day.isSelected) {
    return cn(baseClasses, "bg-blue-500 text-white shadow-lg");
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
