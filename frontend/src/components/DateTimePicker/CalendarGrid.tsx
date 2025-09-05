import React from "react";
import { WEEK_DAYS, ARIA_LABELS } from "../constants/dateTimePickerConstants";
import type { CalendarDay } from "../utils/dateTimeUtils";
import { getDateButtonClasses } from "../../utils/styles/dateTimeStyles";
import { Button, Text } from "../../design-system";

interface CalendarGridProps {
  days: CalendarDay[];
  onDateSelect: (date: Date) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onDateSelect }) => {
  return (
    <div className="grid grid-cols-7 gap-1 mb-4">
      {/* Week day headers */}
      {WEEK_DAYS.map((day) => (
        <div key={day} className="text-center py-2">
          <Text variant="muted" className="text-sm font-medium">
            {day}
          </Text>
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day, index) => (
        <Button
          key={index}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => !day.isDisabled && onDateSelect(day.date)}
          disabled={day.isDisabled}
          className={getDateButtonClasses(day)}
          aria-label={ARIA_LABELS.SELECT_DATE}
        >
          {day.date.getDate()}
        </Button>
      ))}
    </div>
  );
};

export default CalendarGrid;
