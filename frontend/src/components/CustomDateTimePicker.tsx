import React, { useState, useRef, useEffect } from "react";
import { CalendarIcon, ClockIcon } from "../assets/icons";
import {
  getDefaultTime,
  generateCalendarDays,
  formatDisplayValue,
  formatToISOString,
} from "./utils/dateTimeUtils";
import { getInputButtonClasses } from "../utils/styles/dateTimeStyles";
import type { TimeState } from "./utils/dateTimeUtils";
import CalendarHeader from "./DateTimePicker/CalendarHeader";
import CalendarGrid from "./DateTimePicker/CalendarGrid";
import TimePicker from "./DateTimePicker/TimePicker";
import ActionButtons from "./DateTimePicker/ActionButtons";
import { Button } from "../design-system";

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
  disabled = false,
  placeholder = "Select date and time",
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const [selectedTime, setSelectedTime] = useState<TimeState>(() => {
    if (value) {
      const date = new Date(value);
      return {
        hours: date.getHours(),
        minutes: date.getMinutes(),
      };
    }
    return getDefaultTime();
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

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setSelectedTime({
        hours: date.getHours(),
        minutes: date.getMinutes(),
      });
    } else {
      setSelectedDate(new Date());
      setSelectedTime(getDefaultTime());
    }
  }, [value]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (selectedDate) {
      onChange(formatToISOString(date, selectedTime));
    }
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    setSelectedTime({ hours, minutes });
    if (selectedDate) {
      onChange(formatToISOString(selectedDate, { hours, minutes }));
    }
  };

  const [displayDate, setDisplayDate] = useState<Date>(
    selectedDate || new Date()
  );

  const handlePreviousMonth = () => {
    setDisplayDate(
      new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setDisplayDate(
      new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1)
    );
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onChange(formatToISOString(selectedDate, selectedTime));
    }
    setIsOpen(false);
  };

  const handleToggleOpen = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const calendarDays = generateCalendarDays(
    displayDate,
    selectedDate,
    selectedTime
  );

  return (
    <div ref={containerRef} className="relative">
      {/* Input Display */}
      <Button
        type="button"
        id={id || undefined}
        onClick={handleToggleOpen}
        disabled={disabled}
        variant="ghost"
        className={getInputButtonClasses(isOpen, disabled)}
        aria-label={placeholder}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid="due-date-input"
      >
        <div className="flex items-center space-x-3">
          <CalendarIcon className="text-gray-400" size="md" />
          <span className="text-gray-900">
            {formatDisplayValue(selectedDate, selectedTime, placeholder)}
          </span>
        </div>
        <ClockIcon className="text-gray-400" size="md" />
      </Button>

      {/* Calendar Popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={handleCancel}
          />
          {/* Calendar Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-6 min-w-96 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CalendarHeader
              displayDate={displayDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />

            <div className="mb-6">
              <CalendarGrid
                days={calendarDays}
                onDateSelect={handleDateSelect}
              />
            </div>

            <div className="mb-6">
              <TimePicker
                selectedTime={selectedTime}
                onTimeChange={handleTimeChange}
              />
            </div>

            <ActionButtons onConfirm={handleConfirm} onCancel={handleCancel} />
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
