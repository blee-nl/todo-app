import React from "react";
import {
  TIME_SELECTION,
  ARIA_LABELS,
} from "../constants/dateTimePickerConstants";
import type { TimeState } from "../utils/dateTimeUtils";
import { Label } from "../../design-system";

interface TimePickerProps {
  selectedTime: TimeState;
  onTimeChange: (hours: number, minutes: number) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({
  selectedTime,
  onTimeChange,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4" data-testid="due-time-input">
      <Label className="text-sm font-medium text-gray-700">Select Time</Label>

      <div className="flex items-center space-x-3">
        {/* Hour Picker */}
        <div className="flex flex-col items-center">
          <Label className="text-xs font-medium text-gray-600 mb-2">Hour</Label>
          <div className="relative">
            <select
              value={selectedTime.hours}
              onChange={(e) =>
                onTimeChange(parseInt(e.target.value), selectedTime.minutes)
              }
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer min-w-[80px] shadow-sm hover:shadow-md"
              aria-label={ARIA_LABELS.SELECT_HOUR}
            >
              {TIME_SELECTION.HOURS.map((hour) => (
                <option key={hour} value={hour}>
                  {hour.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="flex items-center justify-center pt-6">
          <span className="text-2xl font-bold text-gray-400">:</span>
        </div>

        {/* Minute Picker */}
        <div className="flex flex-col items-center">
          <Label className="text-xs font-medium text-gray-600 mb-2">
            Minute
          </Label>
          <div className="relative">
            <select
              value={selectedTime.minutes}
              onChange={(e) =>
                onTimeChange(selectedTime.hours, parseInt(e.target.value))
              }
              className="appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-lg font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 cursor-pointer min-w-[80px] shadow-sm hover:shadow-md"
              aria-label={ARIA_LABELS.SELECT_MINUTE}
            >
              {TIME_SELECTION.MINUTES.map((minute) => (
                <option key={minute} value={minute}>
                  {minute.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimePicker;
