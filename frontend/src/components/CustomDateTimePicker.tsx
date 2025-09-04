import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

interface CustomDateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
}

const CustomDateTimePicker: React.FC<CustomDateTimePickerProps> = ({
  value,
  onChange,
  min,
  disabled = false,
  placeholder = "Select date and time",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState<{
    hours: number;
    minutes: number;
  }>({
    hours: value ? new Date(value).getHours() : 12,
    minutes: value ? new Date(value).getMinutes() : 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDisplayValue = (
    date: Date | null,
    time: { hours: number; minutes: number }
  ) => {
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const newDateTime = new Date(date);
    newDateTime.setHours(selectedTime.hours, selectedTime.minutes, 0, 0);
    onChange(newDateTime.toISOString().slice(0, 16));
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
    if (selectedDate) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);
      onChange(newDateTime.toISOString().slice(0, 16));
    }
  };

  const getMinDate = () => {
    if (min) {
      return new Date(min);
    }
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now;
  };

  const generateCalendarDays = () => {
    // Use current date if no date is selected
    const displayDate = selectedDate || new Date();

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const minDate = getMinDate();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isDisabled = date < minDate;

      days.push({
        date,
        isCurrentMonth,
        isToday,
        isSelected,
        isDisabled,
      });
    }

    return days;
  };

  const monthNames = [
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
  ];

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div ref={containerRef} className="relative">
      {/* Input Display */}
      <button
        type="button"
        id={id || undefined}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={placeholder}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`
          w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
          flex items-center justify-between text-left
          ${
            disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
              : isOpen
              ? "border-blue-500 bg-blue-50 text-blue-900 shadow-lg"
              : "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm"
          }
        `}
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="w-5 h-5 text-gray-400" />
          <span className="font-medium">
            {formatDisplayValue(selectedDate, selectedTime)}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-gray-400" />
          <div
            className={`w-2 h-2 rounded-full transition-colors ${
              isOpen ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        </div>
      </button>

      {/* Calendar Popup */}
      {isOpen && !disabled && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Calendar Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 min-w-[320px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => {
                  const displayDate = selectedDate || new Date();
                  const newDate = new Date(displayDate);
                  newDate.setMonth(newDate.getMonth() - 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <h3 className="text-lg font-semibold text-gray-900">
                {(() => {
                  const displayDate = selectedDate || new Date();
                  return `${
                    monthNames[displayDate.getMonth()]
                  } ${displayDate.getFullYear()}`;
                })()}
              </h3>

              <button
                type="button"
                onClick={() => {
                  const displayDate = selectedDate || new Date();
                  const newDate = new Date(displayDate);
                  newDate.setMonth(newDate.getMonth() + 1);
                  setSelectedDate(newDate);
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="mb-6">
              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      !day.isDisabled && handleDateSelect(day.date)
                    }
                    disabled={day.isDisabled}
                    className={`
                    w-10 h-10 rounded-full text-sm font-medium transition-all duration-200
                    ${
                      day.isDisabled
                        ? "text-gray-300 cursor-not-allowed"
                        : day.isSelected
                        ? "bg-blue-500 text-white shadow-lg"
                        : day.isToday
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : day.isCurrentMonth
                        ? "text-gray-900 hover:bg-gray-100"
                        : "text-gray-400 hover:bg-gray-50"
                    }
                  `}
                  >
                    {day.date.getDate()}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Picker */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center space-x-4">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Time</span>
              </div>

              <div className="flex items-center space-x-4 mt-3">
                {/* Hours */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Hours
                  </label>
                  <select
                    value={selectedTime.hours}
                    onChange={(e) =>
                      handleTimeChange(
                        parseInt(e.target.value),
                        selectedTime.minutes
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-gray-400 text-lg">:</div>

                {/* Minutes */}
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Minutes
                  </label>
                  <select
                    value={selectedTime.minutes}
                    onChange={(e) =>
                      handleTimeChange(
                        selectedTime.hours,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
