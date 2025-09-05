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
    <div className="flex items-center space-x-4">
      <div className="flex flex-col">
        <Label className="text-xs mb-1">Hour</Label>
        <select
          value={selectedTime.hours}
          onChange={(e) =>
            onTimeChange(parseInt(e.target.value), selectedTime.minutes)
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          aria-label={ARIA_LABELS.SELECT_HOUR}
        >
          {TIME_SELECTION.HOURS.map((hour) => (
            <option key={hour} value={hour}>
              {hour.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col">
        <Label className="text-xs mb-1">Minute</Label>
        <select
          value={selectedTime.minutes}
          onChange={(e) =>
            onTimeChange(selectedTime.hours, parseInt(e.target.value))
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          aria-label={ARIA_LABELS.SELECT_MINUTE}
        >
          {TIME_SELECTION.MINUTES.map((minute) => (
            <option key={minute} value={minute}>
              {minute.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimePicker;
