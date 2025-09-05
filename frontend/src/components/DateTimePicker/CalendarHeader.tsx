import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../../assets/icons";
import { MONTH_NAMES, ARIA_LABELS } from "../constants/dateTimePickerConstants";
import { Button, Heading } from "../../design-system";

interface CalendarHeaderProps {
  displayDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  displayDate,
  onPreviousMonth,
  onNextMonth,
}) => {
  const monthName = MONTH_NAMES[displayDate.getMonth()];
  const year = displayDate.getFullYear();

  return (
    <div className="flex items-center justify-between mb-4">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onPreviousMonth}
        className="p-2"
        leftIcon={<ChevronLeftIcon size="md" />}
        aria-label={ARIA_LABELS.PREVIOUS_MONTH}
      />

      <Heading level={3}>
        {monthName} {year}
      </Heading>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onNextMonth}
        className="p-2"
        leftIcon={<ChevronRightIcon size="md" />}
        aria-label={ARIA_LABELS.NEXT_MONTH}
      />
    </div>
  );
};

export default CalendarHeader;
