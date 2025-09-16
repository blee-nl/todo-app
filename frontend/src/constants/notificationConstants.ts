import { TIME_CONSTANTS } from './timeConstants';

export const NOTIFICATION_CONSTANTS = {
  // Default reminder time in minutes
  DEFAULT_REMINDER_MINUTES: TIME_CONSTANTS.FIFTEEN_MINUTES,

  // Validation limits
  MIN_REMINDER_MINUTES: TIME_CONSTANTS.ONE_MINUTE,
  MAX_REMINDER_MINUTES: TIME_CONSTANTS.SEVEN_DAYS_IN_MINUTES,
  MAX_REMINDER_HOURS: TIME_CONSTANTS.SEVEN_DAYS_IN_HOURS,

  // Time conversion constants (re-exported for convenience)
  MINUTES_PER_HOUR: TIME_CONSTANTS.MINUTES_PER_HOUR,
  MINUTES_PER_DAY: TIME_CONSTANTS.MINUTES_PER_DAY,
  HOURS_PER_DAY: TIME_CONSTANTS.HOURS_PER_DAY,

  // UI constants
  PERMISSION_TIMEOUT_MS: TIME_CONSTANTS.MILLISECONDS_PER_SECOND * 10, // 10 seconds
  NOTIFICATION_CLEANUP_INTERVAL_MS: TIME_CONSTANTS.FIVE_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE, // 5 minutes
} as const;

export const REMINDER_PRESETS = [
  { value: TIME_CONSTANTS.FIVE_MINUTES, label: "5 minutes before" },
  { value: TIME_CONSTANTS.TEN_MINUTES, label: "10 minutes before" },
  { value: TIME_CONSTANTS.FIFTEEN_MINUTES, label: "15 minutes before" },
  { value: TIME_CONSTANTS.THIRTY_MINUTES, label: "30 minutes before" },
  { value: TIME_CONSTANTS.ONE_HOUR_IN_MINUTES, label: "1 hour before" },
  { value: TIME_CONSTANTS.TWO_HOURS_IN_MINUTES, label: "2 hours before" },
  { value: TIME_CONSTANTS.FOUR_HOURS_IN_MINUTES, label: "4 hours before" },
  { value: TIME_CONSTANTS.EIGHT_HOURS_IN_MINUTES, label: "8 hours before" },
  { value: TIME_CONSTANTS.ONE_DAY_IN_MINUTES, label: "1 day before" },
  { value: TIME_CONSTANTS.TWO_DAYS_IN_MINUTES, label: "2 days before" },
] as const;

export type ReminderPreset = typeof REMINDER_PRESETS[number];