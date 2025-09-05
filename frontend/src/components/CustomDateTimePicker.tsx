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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        variant="ghost"
        className={getInputButtonClasses(isOpen, disabled)}
        aria-label={placeholder}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        data-testid="custom-datetime-picker"
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
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 min-w-80">
          <CalendarHeader
            displayDate={displayDate}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
          />

          <CalendarGrid days={calendarDays} onDateSelect={handleDateSelect} />

          <TimePicker
            selectedTime={selectedTime}
            onTimeChange={handleTimeChange}
          />

          <ActionButtons onConfirm={handleConfirm} onCancel={handleCancel} />
        </div>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
