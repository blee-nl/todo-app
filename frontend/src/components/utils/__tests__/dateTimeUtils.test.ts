import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getDefaultTime,
  isToday,
  isDateDisabled,
  generateCalendarDays,
  formatDisplayValue,
  formatToISOString,
  getDateButtonClasses,
  getInputButtonClasses,
  type TimeState,
  type CalendarDay,
} from '../dateTimeUtils';
import { MINIMUM_TIME_BUFFER_MINUTES, DEFAULT_TIME_OFFSET_MINUTES } from '../../constants/dateTimePickerConstants';
import { cn } from '../../../utils/styles/classNames';

// Mock the cn function
vi.mock('../../../utils/styles/classNames', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}));

describe('dateTimeUtils', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock the current date to January 15, 2024, 12:00:00 (local time)
    mockDate = new Date(2024, 0, 15, 12, 0, 0, 0);
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getDefaultTime', () => {
    it('returns time 1 hour from now', () => {
      const result = getDefaultTime();

      // Should add 1 hour to current time
      expect(result.hours).toBe(13); // 12 + 1
      expect(result.minutes).toBe(0);
    });

    it('handles hour overflow correctly', () => {
      // Set time to 23:30 (local time)
      vi.setSystemTime(new Date(2024, 0, 15, 23, 30, 0, 0));

      const result = getDefaultTime();

      expect(result.hours).toBe(0); // 23 + 1 = 24, which wraps to 0
      expect(result.minutes).toBe(30);
    });

    it('preserves current minutes', () => {
      // Set time to 14:45 (local time)
      vi.setSystemTime(new Date(2024, 0, 15, 14, 45, 0, 0));

      const result = getDefaultTime();

      expect(result.hours).toBe(15); // 14 + 1
      expect(result.minutes).toBe(45);
    });

    it('uses DEFAULT_TIME_OFFSET_MINUTES constant', () => {
      // Verify it uses the constant by checking the calculation
      const now = new Date();
      const expectedHours = now.getHours() + (DEFAULT_TIME_OFFSET_MINUTES / 60);

      const result = getDefaultTime();

      // Should add 1 hour (60 minutes / 60 = 1 hour)
      expect(DEFAULT_TIME_OFFSET_MINUTES).toBe(60);
      expect(result.hours).toBe(Math.floor(expectedHours) % 24);
    });
  });

  describe('isToday', () => {
    it('returns true for today\'s date', () => {
      const today = new Date(2024, 0, 15, 10, 30, 0, 0);
      expect(isToday(today)).toBe(true);
    });

    it('returns true for today with different time', () => {
      const todayDifferentTime = new Date(2024, 0, 15, 23, 59, 59, 999); // Local time
      expect(isToday(todayDifferentTime)).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date(2024, 0, 14, 12, 0, 0, 0);
      expect(isToday(yesterday)).toBe(false);
    });

    it('returns false for tomorrow', () => {
      const tomorrow = new Date('2024-01-16T12:00:00.000Z');
      expect(isToday(tomorrow)).toBe(false);
    });

    it('returns false for different year', () => {
      const differentYear = new Date('2023-01-15T12:00:00.000Z');
      expect(isToday(differentYear)).toBe(false);
    });

    it('handles timezone differences', () => {
      // Create date with different timezone
      const sameDay = new Date('2024-01-15T05:00:00.000Z');
      expect(isToday(sameDay)).toBe(true);
    });
  });

  describe('isDateDisabled', () => {
    const timeState: TimeState = { hours: 14, minutes: 30 };

    it('returns true for dates in the past', () => {
      const pastDate = new Date('2024-01-14T12:00:00.000Z');
      expect(isDateDisabled(pastDate, timeState)).toBe(true);
    });

    it('returns false for future dates', () => {
      const futureDate = new Date('2024-01-16T12:00:00.000Z');
      expect(isDateDisabled(futureDate, timeState)).toBe(false);
    });

    it('checks time buffer for today\'s date', () => {
      const todayDate = new Date(2024, 0, 15, 12, 0, 0, 0);

      // Time that's too soon (within buffer)
      const earlyTime: TimeState = { hours: 12, minutes: 5 }; // Only 5 minutes from now
      expect(isDateDisabled(todayDate, earlyTime)).toBe(true);

      // Time that's far enough (outside buffer)
      const laterTime: TimeState = { hours: 12, minutes: 30 }; // 30 minutes from now
      expect(isDateDisabled(todayDate, laterTime)).toBe(false);
    });

    it('uses MINIMUM_TIME_BUFFER_MINUTES constant', () => {
      const todayDate = new Date(2024, 0, 15, 12, 0, 0, 0);

      // Exactly at buffer time (should be enabled since it's NOT less than buffer)
      const bufferTime: TimeState = {
        hours: 12,
        minutes: MINIMUM_TIME_BUFFER_MINUTES
      };
      expect(isDateDisabled(todayDate, bufferTime)).toBe(false);

      // Just past buffer time (should be enabled)
      const pastBufferTime: TimeState = {
        hours: 12,
        minutes: MINIMUM_TIME_BUFFER_MINUTES + 1
      };
      expect(isDateDisabled(todayDate, pastBufferTime)).toBe(false);
    });

    it('handles hour boundaries correctly', () => {
      // Set current time to 23:50 (local time)
      vi.setSystemTime(new Date(2024, 0, 15, 23, 50, 0, 0));

      const todayDate = new Date(2024, 0, 15, 23, 50, 0, 0);

      // Time before current time - 23:45 is before 23:50 + 10min buffer, so it should be disabled
      const pastTime: TimeState = { hours: 23, minutes: 45 };
      expect(isDateDisabled(todayDate, pastTime)).toBe(true);

      // Time close to buffer is also disabled (23:59 < 00:00 next day)
      const futureTime: TimeState = { hours: 23, minutes: 59 };
      expect(isDateDisabled(todayDate, futureTime)).toBe(true);
    });
  });

  describe('generateCalendarDays', () => {
    const displayDate = new Date(2024, 0, 15); // January 15, 2024
    const selectedDate = new Date(2024, 0, 20); // January 20, 2024
    const selectedTime: TimeState = { hours: 14, minutes: 30 };

    it('generates 42 days (6 weeks)', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);
      expect(days).toHaveLength(42);
    });

    it('starts with days from previous month', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      // January 1, 2024 was a Monday, so we should have Sunday from previous month
      const firstDay = days[0];
      expect(firstDay.date.getMonth()).toBe(11); // December (previous month)
      expect(firstDay.isCurrentMonth).toBe(false);
    });

    it('includes all days of the current month', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      const currentMonthDays = days.filter(day => day.isCurrentMonth);
      expect(currentMonthDays).toHaveLength(31); // January has 31 days
    });

    it('ends with days from next month', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      const lastDay = days[41];
      expect(lastDay.date.getMonth()).toBe(1); // February (next month)
      expect(lastDay.isCurrentMonth).toBe(false);
    });

    it('marks today correctly', () => {
      // Current mock date is January 15, 2024
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      const todayDay = days.find(day =>
        day.date.getDate() === 15 && day.isCurrentMonth
      );
      expect(todayDay?.isToday).toBe(true);

      // Other days should not be marked as today
      const otherDays = days.filter(day =>
        !(day.date.getDate() === 15 && day.isCurrentMonth)
      );
      otherDays.forEach(day => {
        expect(day.isToday).toBe(false);
      });
    });

    it('marks selected date correctly', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      const selectedDay = days.find(day =>
        day.date.getDate() === 20 && day.isCurrentMonth
      );
      expect(selectedDay?.isSelected).toBe(true);

      // Other days should not be selected
      const otherDays = days.filter(day =>
        !(day.date.getDate() === 20 && day.isCurrentMonth)
      );
      otherDays.forEach(day => {
        expect(day.isSelected).toBe(false);
      });
    });

    it('handles null selectedDate', () => {
      const days = generateCalendarDays(displayDate, null, selectedTime);

      days.forEach(day => {
        expect(day.isSelected).toBe(false);
      });
    });

    it('marks disabled dates correctly', () => {
      const days = generateCalendarDays(displayDate, selectedDate, selectedTime);

      // Past dates should be disabled
      const pastDay = days.find(day =>
        day.date.getDate() === 10 && day.isCurrentMonth
      );
      expect(pastDay?.isDisabled).toBe(true);

      // Future dates should be enabled
      const futureDay = days.find(day =>
        day.date.getDate() === 25 && day.isCurrentMonth
      );
      expect(futureDay?.isDisabled).toBe(false);
    });

    it('handles different months correctly', () => {
      const marchDate = new Date(2024, 2, 15); // March 15, 2024
      const days = generateCalendarDays(marchDate, null, selectedTime);

      expect(days).toHaveLength(42);

      const marchDays = days.filter(day => day.isCurrentMonth);
      expect(marchDays).toHaveLength(31); // March has 31 days

      // Check that we have the right month
      const firstMarchDay = days.find(day =>
        day.date.getDate() === 1 && day.isCurrentMonth
      );
      expect(firstMarchDay?.date.getMonth()).toBe(2); // March
    });
  });

  describe('formatDisplayValue', () => {
    const timeState: TimeState = { hours: 14, minutes: 30 };

    it('formats a complete date and time correctly', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const result = formatDisplayValue(date, timeState, 'Select date and time');

      expect(result).toMatch(/Mon, Jan 15, 2024 at 14:30/);
    });

    it('returns placeholder when date is null', () => {
      const placeholder = 'Please select a date';
      const result = formatDisplayValue(null, timeState, placeholder);

      expect(result).toBe(placeholder);
    });

    it('formats time with zero padding', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const timeWithZeros: TimeState = { hours: 9, minutes: 5 };
      const result = formatDisplayValue(date, timeWithZeros, 'placeholder');

      expect(result).toContain('09:05');
    });

    it('handles different days of the week', () => {
      const dates = [
        new Date('2024-01-14T10:00:00.000Z'), // Sunday
        new Date('2024-01-15T10:00:00.000Z'), // Monday
        new Date('2024-01-16T10:00:00.000Z'), // Tuesday
      ];

      const results = dates.map(date =>
        formatDisplayValue(date, timeState, 'placeholder')
      );

      expect(results[0]).toContain('Sun');
      expect(results[1]).toContain('Mon');
      expect(results[2]).toContain('Tue');
    });

    it('handles different months', () => {
      const dates = [
        new Date('2024-01-15T10:00:00.000Z'), // January
        new Date('2024-02-15T10:00:00.000Z'), // February
        new Date('2024-12-15T10:00:00.000Z'), // December
      ];

      const results = dates.map(date =>
        formatDisplayValue(date, timeState, 'placeholder')
      );

      expect(results[0]).toContain('Jan');
      expect(results[1]).toContain('Feb');
      expect(results[2]).toContain('Dec');
    });

    it('handles year boundaries', () => {
      const date2023 = new Date('2023-12-31T10:00:00.000Z');
      const date2024 = new Date('2024-01-01T10:00:00.000Z');

      const result2023 = formatDisplayValue(date2023, timeState, 'placeholder');
      const result2024 = formatDisplayValue(date2024, timeState, 'placeholder');

      expect(result2023).toContain('2023');
      expect(result2024).toContain('2024');
    });
  });

  describe('formatToISOString', () => {
    it('formats date and time to ISO-like string', () => {
      const date = new Date('2024-01-15T10:00:00.000Z');
      const time: TimeState = { hours: 14, minutes: 30 };

      const result = formatToISOString(date, time);

      expect(result).toBe('2024-01-15T14:30');
    });

    it('formats with zero padding', () => {
      const date = new Date('2024-01-05T10:00:00.000Z');
      const time: TimeState = { hours: 9, minutes: 5 };

      const result = formatToISOString(date, time);

      expect(result).toBe('2024-01-05T09:05');
    });

    it('handles month boundaries', () => {
      const dates = [
        new Date('2024-01-31T10:00:00.000Z'),
        new Date('2024-02-01T10:00:00.000Z'),
        new Date('2024-12-01T10:00:00.000Z'),
      ];
      const time: TimeState = { hours: 12, minutes: 0 };

      const results = dates.map(date => formatToISOString(date, time));

      expect(results[0]).toBe('2024-01-31T12:00');
      expect(results[1]).toBe('2024-02-01T12:00');
      expect(results[2]).toBe('2024-12-01T12:00');
    });

    it('handles year boundaries', () => {
      const date = new Date('2023-12-31T10:00:00.000Z');
      const time: TimeState = { hours: 23, minutes: 59 };

      const result = formatToISOString(date, time);

      expect(result).toBe('2023-12-31T23:59');
    });

    it('overwrites original time with provided time', () => {
      const date = new Date('2024-01-15T22:45:30.123Z'); // Original time ignored
      const time: TimeState = { hours: 8, minutes: 15 };

      const result = formatToISOString(date, time);

      expect(result).toBe('2024-01-15T08:15');
    });
  });

  describe('getDateButtonClasses', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns disabled classes for disabled days', () => {
      const day: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: true,
      };

      const result = getDateButtonClasses(day);

      expect(cn).toHaveBeenCalledWith(
        "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
        "text-gray-300 cursor-not-allowed"
      );
    });

    it('returns selected classes for selected days', () => {
      const day: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: false,
        isSelected: true,
        isDisabled: false,
      };

      const result = getDateButtonClasses(day);

      expect(cn).toHaveBeenCalledWith(
        "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
        "bg-blue-500 text-white shadow-lg"
      );
    });

    it('returns today classes for today', () => {
      const day: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: true,
        isSelected: false,
        isDisabled: false,
      };

      const result = getDateButtonClasses(day);

      expect(cn).toHaveBeenCalledWith(
        "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
        "bg-green-100 text-green-700 font-semibold border-2 border-green-300"
      );
    });

    it('returns current month classes for current month days', () => {
      const day: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: false,
      };

      const result = getDateButtonClasses(day);

      expect(cn).toHaveBeenCalledWith(
        "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
        "text-gray-900 hover:bg-gray-100"
      );
    });

    it('returns other month classes for other month days', () => {
      const day: CalendarDay = {
        date: new Date(),
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: false,
      };

      const result = getDateButtonClasses(day);

      expect(cn).toHaveBeenCalledWith(
        "w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
        "text-gray-400 hover:bg-gray-50"
      );
    });

    it('prioritizes states correctly (disabled > selected > today > current month)', () => {
      // Disabled takes priority over selected
      const disabledSelected: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: true,
        isSelected: true,
        isDisabled: true,
      };

      getDateButtonClasses(disabledSelected);

      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        "text-gray-300 cursor-not-allowed"
      );
    });
  });

  describe('getInputButtonClasses', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('returns disabled classes when disabled', () => {
      const result = getInputButtonClasses(false, true);

      expect(cn).toHaveBeenCalledWith(
        "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
        "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
      );
    });

    it('returns open classes when open', () => {
      const result = getInputButtonClasses(true, false);

      expect(cn).toHaveBeenCalledWith(
        "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
        "border-blue-500 bg-blue-50 text-blue-900 shadow-lg"
      );
    });

    it('returns default classes when neither disabled nor open', () => {
      const result = getInputButtonClasses(false, false);

      expect(cn).toHaveBeenCalledWith(
        "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-center justify-between text-left",
        "border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:shadow-sm"
      );
    });

    it('prioritizes disabled over open', () => {
      const result = getInputButtonClasses(true, true);

      expect(cn).toHaveBeenCalledWith(
        expect.any(String),
        "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
      );
    });
  });

  describe('Type definitions', () => {
    it('TimeState has correct structure', () => {
      const timeState: TimeState = {
        hours: 14,
        minutes: 30,
      };

      expect(typeof timeState.hours).toBe('number');
      expect(typeof timeState.minutes).toBe('number');
    });

    it('CalendarDay has correct structure', () => {
      const calendarDay: CalendarDay = {
        date: new Date(),
        isCurrentMonth: true,
        isToday: false,
        isSelected: false,
        isDisabled: false,
      };

      expect(calendarDay.date).toBeInstanceOf(Date);
      expect(typeof calendarDay.isCurrentMonth).toBe('boolean');
      expect(typeof calendarDay.isToday).toBe('boolean');
      expect(typeof calendarDay.isSelected).toBe('boolean');
      expect(typeof calendarDay.isDisabled).toBe('boolean');
    });
  });
});