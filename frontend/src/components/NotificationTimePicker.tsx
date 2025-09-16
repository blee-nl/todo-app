import React, { useState, useCallback } from "react";
import { Label, Button } from "../design-system";
import { BellIcon } from "../assets/icons";
import { REMINDER_PRESETS, NOTIFICATION_CONSTANTS } from "../constants/notificationConstants";
import { TIME_CONSTANTS } from "../constants/timeConstants";

export interface NotificationTimePickerProps {
  enabled: boolean;
  reminderMinutes: number;
  onEnabledChange: (enabled: boolean) => void;
  onReminderMinutesChange: (minutes: number) => void;
  className?: string;
  dueAt?: string;
  taskType?: 'one-time' | 'daily';
}


const NotificationTimePicker: React.FC<NotificationTimePickerProps> = ({
  enabled,
  reminderMinutes,
  onEnabledChange,
  onReminderMinutesChange,
  className = "",
  dueAt,
  taskType = 'one-time',
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState<"minutes" | "hours">("minutes");

  // Calculate dynamic maximum reminder time based on due date and task type
  const getMaxReminderMinutes = useCallback((): number => {
    if (!dueAt) {
      return NOTIFICATION_CONSTANTS.MAX_REMINDER_MINUTES; // Default 7 days
    }

    const now = new Date();
    const dueDate = new Date(dueAt);
    const timeDiffMinutes = Math.floor((dueDate.getTime() - now.getTime()) / TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);

    if (taskType === 'daily') {
      // For daily tasks, max reminder is time until next occurrence (usually 24 hours max)
      return Math.min(timeDiffMinutes, NOTIFICATION_CONSTANTS.MINUTES_PER_DAY);
    } else {
      // For one-time tasks, max reminder is time until due date
      return Math.max(NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES, Math.min(timeDiffMinutes, NOTIFICATION_CONSTANTS.MAX_REMINDER_MINUTES));
    }
  }, [dueAt, taskType]);

  const maxReminderMinutes = getMaxReminderMinutes();

  // Filter preset options based on available time until due date
  const availablePresets = REMINDER_PRESETS.filter(preset => preset.value <= maxReminderMinutes);

  // Check if current reminder time is still valid
  const isCurrentReminderValid = reminderMinutes <= maxReminderMinutes;
  const isPresetOption = availablePresets.find(option => option.value === reminderMinutes);
  const isCustomTime = !isPresetOption && isCurrentReminderValid;

  // Auto-adjust invalid reminder time to the maximum available preset
  React.useEffect(() => {
    if (!isCurrentReminderValid) {
      if (availablePresets.length > 0) {
        const maxAvailablePreset = availablePresets[availablePresets.length - 1];
        onReminderMinutesChange(maxAvailablePreset.value);
      } else if (maxReminderMinutes >= NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES) {
        // No presets available, but we can still set a valid custom time
        onReminderMinutesChange(Math.min(maxReminderMinutes, NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES));
      }
    }
  }, [isCurrentReminderValid, availablePresets, maxReminderMinutes, onReminderMinutesChange]);

  const handleEnabledToggle = useCallback(() => {
    onEnabledChange(!enabled);
  }, [enabled, onEnabledChange]);

  const handlePresetChange = useCallback((value: number) => {
    onReminderMinutesChange(value);
    setShowCustomInput(false);
  }, [onReminderMinutesChange]);

  const handleCustomSubmit = useCallback(() => {
    const value = parseInt(customValue);
    if (isNaN(value) || value <= 0) return;

    const minutes = customUnit === "hours" ? value * NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR : value;

    // Validate range based on due date and task type
    if (minutes < NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES || minutes > maxReminderMinutes) {
      const maxDays = Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_DAY);
      const maxHours = Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR);
      const displayMax = maxDays > 0 ? `${maxDays} days` : `${maxHours} hours`;
      alert(`Reminder time must be between ${NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES} minute and ${displayMax} (based on ${taskType === 'daily' ? 'daily schedule' : 'due date'})`);
      return;
    }

    onReminderMinutesChange(minutes);
    setCustomValue("");
    setShowCustomInput(false);
  }, [customValue, customUnit, onReminderMinutesChange]);

  const handleCustomCancel = useCallback(() => {
    setCustomValue("");
    setShowCustomInput(false);
  }, []);

  const handlePresetSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'custom') {
      setShowCustomInput(true);
    } else {
      handlePresetChange(parseInt(value));
    }
  }, [handlePresetChange]);


  const formatCustomTime = (minutes: number): string => {
    if (minutes < NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR) {
      return `${minutes} minutes before`;
    } else if (minutes < NOTIFICATION_CONSTANTS.MINUTES_PER_DAY) {
      const hours = Math.floor(minutes / NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR);
      const remainingMinutes = minutes % NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR;
      if (remainingMinutes === 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} before`;
      } else {
        return `${hours}h ${remainingMinutes}m before`;
      }
    } else {
      const days = Math.floor(minutes / NOTIFICATION_CONSTANTS.MINUTES_PER_DAY);
      const remainingHours = Math.floor((minutes % NOTIFICATION_CONSTANTS.MINUTES_PER_DAY) / NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR);
      if (remainingHours === 0) {
        return `${days} day${days > 1 ? 's' : ''} before`;
      } else {
        return `${days}d ${remainingHours}h before`;
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Enable/Disable Toggle */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="notification-enabled"
          checked={enabled}
          onChange={handleEnabledToggle}
          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <BellIcon size="sm" className="text-gray-500" />
            <Label
              htmlFor="notification-enabled"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              Enable task reminders
            </Label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Get notified before your task is due. Your browser will ask for permission first.
          </p>
        </div>
      </div>

      {/* Reminder Time Selection */}
      {enabled && (
        <div className="pl-7 space-y-3 border-l-2 border-gray-100">
          <Label className="text-sm font-medium text-gray-700">
            Remind me:
          </Label>

          {!showCustomInput ? (
            <div className="space-y-2">
              {/* Preset Options Dropdown */}
              <div className="space-y-2">
                {availablePresets.length > 0 ? (
                  <select
                    value={isCustomTime ? 'custom' : reminderMinutes.toString()}
                    onChange={handlePresetSelectChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {availablePresets.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    <option value="custom">Custom time...</option>
                    {isCustomTime && (
                      <option value="custom">
                        {formatCustomTime(reminderMinutes)}
                      </option>
                    )}
                  </select>
                ) : (
                  <div className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-md p-2">
                    <p>No preset options available for this due date.</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Task is due too soon. Use custom time or adjust the due date.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCustomInput(true)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                    >
                      Set custom time →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-3 border rounded-md bg-gray-50">
              <Label className="text-sm font-medium text-gray-700">
                Custom reminder time:
              </Label>

              <div className="flex space-x-2">
                <input
                  type="number"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Enter time"
                  min={NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES.toString()}
                  max={customUnit === "minutes" ? maxReminderMinutes.toString() : Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR).toString()}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as "minutes" | "hours")}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="minutes">minutes</option>
                  <option value="hours">hours</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleCustomSubmit}
                  disabled={!customValue || parseInt(customValue) <= 0}
                >
                  Set
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCustomCancel}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-gray-500">
                Allowed range: {NOTIFICATION_CONSTANTS.MIN_REMINDER_MINUTES} minute to {Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_DAY) > 0 ? `${Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_DAY)} days` : `${Math.floor(maxReminderMinutes / NOTIFICATION_CONSTANTS.MINUTES_PER_HOUR)} hours`} (based on {taskType === 'daily' ? 'daily schedule' : 'due date'})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationTimePicker;