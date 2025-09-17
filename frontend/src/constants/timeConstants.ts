export const TIME_CONSTANTS = {
  // Basic time conversion constants
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,

  // Derived conversion constants
  MILLISECONDS_PER_MINUTE: 1000 * 60,
  MINUTES_PER_DAY: 60 * 24, // 1440
  MILLISECONDS_PER_HOUR: 1000 * 60 * 60,
  MILLISECONDS_PER_DAY: 1000 * 60 * 60 * 24,

  // Common time values in minutes
  ONE_MINUTE: 1,
  FIVE_MINUTES: 5,
  TEN_MINUTES: 10,
  FIFTEEN_MINUTES: 15,
  THIRTY_MINUTES: 30,
  ONE_HOUR_IN_MINUTES: 60,
  TWO_HOURS_IN_MINUTES: 120,
  FOUR_HOURS_IN_MINUTES: 240,
  EIGHT_HOURS_IN_MINUTES: 480,
  ONE_DAY_IN_MINUTES: 1440,
  TWO_DAYS_IN_MINUTES: 2880,
  SEVEN_DAYS_IN_MINUTES: 10080,

  // Common time values in hours
  ONE_HOUR: 1,
  ONE_DAY_IN_HOURS: 24,
  SEVEN_DAYS_IN_HOURS: 168,

  // Time limits and validation
  MIN_DUE_DATE_OFFSET_MINUTES: 10, // Minimum time before due date (was magic number)
  MAX_REMINDER_PERIOD_MINUTES: 10080, // 7 days maximum reminder period
} as const;