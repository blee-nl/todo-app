import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import NotificationTimePicker, { NotificationTimePickerProps } from '../NotificationTimePicker';
import { REMINDER_PRESETS, NOTIFICATION_CONSTANTS } from '../../constants/notificationConstants';
import { TIME_CONSTANTS } from '../../constants/timeConstants';

// Mock the design system components
vi.mock('../../design-system', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
  Button: ({ children, onClick, disabled, type = 'button', variant, size, ...props }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      {...props}
    >
      {children}
    </button>
  ),
}));

// Mock the icons
vi.mock('../../assets/icons', () => ({
  BellIcon: ({ size, className }: any) => (
    <div data-testid="bell-icon" data-size={size} className={className}>
      BellIcon
    </div>
  ),
}));

// Mock window.alert
const mockAlert = vi.fn();
global.alert = mockAlert;

describe('NotificationTimePicker', () => {
  const defaultProps: NotificationTimePickerProps = {
    enabled: false,
    reminderMinutes: NOTIFICATION_CONSTANTS.DEFAULT_REMINDER_MINUTES,
    onEnabledChange: vi.fn(),
    onReminderMinutesChange: vi.fn(),
  };

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<NotificationTimePicker {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Enable task reminders')).toBeInTheDocument();
      expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
      expect(screen.getByText(/Your browser will ask for permission first/)).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <NotificationTimePicker {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should show bell icon with correct props', () => {
      render(<NotificationTimePicker {...defaultProps} />);

      const bellIcon = screen.getByTestId('bell-icon');
      expect(bellIcon).toHaveAttribute('data-size', 'sm');
      expect(bellIcon).toHaveClass('text-gray-500');
    });

    it('should render checkbox as unchecked by default', () => {
      render(<NotificationTimePicker {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
    });

    it('should render checkbox as checked when enabled is true', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  describe('Enabled State Toggle', () => {
    it('should call onEnabledChange when checkbox is clicked', async () => {
      const onEnabledChange = vi.fn();
      render(<NotificationTimePicker {...defaultProps} onEnabledChange={onEnabledChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onEnabledChange).toHaveBeenCalledTimes(1);
      expect(onEnabledChange).toHaveBeenCalledWith(true);
    });

    it('should call onEnabledChange when label is clicked', async () => {
      const onEnabledChange = vi.fn();
      render(<NotificationTimePicker {...defaultProps} onEnabledChange={onEnabledChange} />);

      const label = screen.getByText('Enable task reminders');
      await user.click(label);

      expect(onEnabledChange).toHaveBeenCalledTimes(1);
      expect(onEnabledChange).toHaveBeenCalledWith(true);
    });

    it('should toggle from enabled to disabled', async () => {
      const onEnabledChange = vi.fn();
      render(<NotificationTimePicker {...defaultProps} enabled={true} onEnabledChange={onEnabledChange} />);

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(onEnabledChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Reminder Time Selection', () => {
    it('should not show reminder options when disabled', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={false} />);

      expect(screen.queryByText('Remind me:')).not.toBeInTheDocument();
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('should show reminder options when enabled', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      expect(screen.getByText('Remind me:')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should show all available preset options', () => {
      // Set due date to 3 days from now to ensure all presets are available
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={new Date(Date.now() + TIME_CONSTANTS.TWO_DAYS_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE + TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      // Should include all presets plus custom option (10 presets + 1 custom = 11 total)
      expect(options.length).toBe(REMINDER_PRESETS.length + 1); // +1 for custom option
      expect(options[options.length - 1]).toHaveTextContent('Custom time...');
    });

    it('should select correct default option', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} reminderMinutes={30} />);

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('30');
    });

    it('should call onReminderMinutesChange when preset is selected', async () => {
      const onReminderMinutesChange = vi.fn();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={new Date(Date.now() + TIME_CONSTANTS.TWO_DAYS_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '60'); // 1 hour

      expect(onReminderMinutesChange).toHaveBeenCalledWith(60);
    });
  });

  describe('Custom Time Input', () => {
    it('should show custom input when "Custom time..." is selected', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      expect(screen.getByText('Custom reminder time:')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter time')).toBeInTheDocument();
      expect(screen.getByDisplayValue('minutes')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Set' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('should focus custom input when shown', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      await waitFor(() => {
        const customInput = screen.getByPlaceholderText('Enter time');
        expect(customInput).toHaveFocus();
      });
    });

    it('should change unit from minutes to hours', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const unitSelect = screen.getByDisplayValue('minutes');
      await user.selectOptions(unitSelect, 'hours');

      expect(screen.getByDisplayValue('hours')).toBeInTheDocument();
    });

    it('should handle custom time input and conversion', async () => {
      const onReminderMinutesChange = vi.fn();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={new Date(Date.now() + 5 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const setButton = screen.getByRole('button', { name: 'Set' });

      await user.type(customInput, '90');
      await user.click(setButton);

      expect(onReminderMinutesChange).toHaveBeenCalledWith(90);
    });

    it('should convert hours to minutes correctly', async () => {
      const onReminderMinutesChange = vi.fn();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={new Date(Date.now() + 5 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const unitSelect = screen.getByDisplayValue('minutes');
      const setButton = screen.getByRole('button', { name: 'Set' });

      await user.selectOptions(unitSelect, 'hours');
      await user.type(customInput, '2');
      await user.click(setButton);

      expect(onReminderMinutesChange).toHaveBeenCalledWith(120); // 2 hours = 120 minutes
    });

    it('should cancel custom input and return to dropdown', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      expect(screen.getByText('Custom reminder time:')).toBeInTheDocument();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      expect(screen.queryByText('Custom reminder time:')).not.toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should clear custom input value on cancel', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      await user.type(customInput, '45');

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      // Re-open custom input
      const selectAfterCancel = screen.getByRole('combobox');
      await user.selectOptions(selectAfterCancel, 'custom');

      // Wait for custom input to appear
      const newCustomInput = await screen.findByPlaceholderText('Enter time');
      expect(newCustomInput).toHaveValue(null);
    });

    it('should disable Set button when input is empty or invalid', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const setButton = screen.getByRole('button', { name: 'Set' });
      expect(setButton).toBeDisabled();

      const customInput = screen.getByPlaceholderText('Enter time');
      await user.type(customInput, '0');
      expect(setButton).toBeDisabled();

      await user.clear(customInput);
      await user.type(customInput, '-5');
      expect(setButton).toBeDisabled();

      await user.clear(customInput);
      await user.type(customInput, '10');
      expect(setButton).toBeEnabled();
    });
  });

  describe('Due Date Validation', () => {
    it('should filter presets based on due date', () => {
      const nearFuture = new Date(Date.now() + 35 * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 35 minutes from now
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={nearFuture.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      const options = Array.from(select.querySelectorAll('option'));

      // Should include presets that are less than or equal to available time
      // With 35 minutes available, should include: 5, 10, 15, 30 minute presets
      expect(options.length).toBe(5); // 4 presets + 1 custom option
    });

    it('should show no presets warning when task is due too soon', () => {
      const veryNearFuture = new Date(Date.now() + 2 * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 2 minutes from now
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={veryNearFuture.toISOString()}
        />
      );

      expect(screen.getByText('No preset options available for this due date.')).toBeInTheDocument();
      expect(screen.getByText(/Task is due too soon/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set custom time/ })).toBeInTheDocument();
    });

    it('should auto-adjust invalid reminder time to maximum available', () => {
      const onReminderMinutesChange = vi.fn();
      const nearFuture = new Date(Date.now() + 30 * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 30 minutes from now

      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={60} // 1 hour - too long for 30 minute due date
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={nearFuture.toISOString()}
        />
      );

      // Should auto-adjust to the maximum available preset
      expect(onReminderMinutesChange).toHaveBeenCalled();
    });

    it('should handle daily tasks with different max reminder time', () => {
      const onReminderMinutesChange = vi.fn();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={2000} // Too long for daily task
          onReminderMinutesChange={onReminderMinutesChange}
          taskType="daily"
          dueAt={new Date(Date.now() + 2 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      // Should adjust for daily task limits
      expect(onReminderMinutesChange).toHaveBeenCalled();
    });
  });

  describe('Custom Time Validation', () => {
    it('should show alert for invalid time range', async () => {
      const dueDate = new Date(Date.now() + 2 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 2 hours from now
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const setButton = screen.getByRole('button', { name: 'Set' });

      // Try to set reminder for 4 hours (longer than 2 hour due date)
      await user.type(customInput, '4');

      const unitSelect = screen.getByDisplayValue('minutes');
      await user.selectOptions(unitSelect, 'hours');

      await user.click(setButton);

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('Reminder time must be between')
      );
    });

    it('should show alert with correct time format for different due dates', async () => {
      const dueDate = new Date(Date.now() + 30 * TIME_CONSTANTS.MINUTES_PER_DAY * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 30 days from now
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const unitSelect = screen.getByDisplayValue('minutes');
      const setButton = screen.getByRole('button', { name: 'Set' });

      await user.selectOptions(unitSelect, 'hours');
      await user.type(customInput, '200'); // 200 hours is more than 7 days max
      await user.click(setButton);

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('days')
      );
    });

    it('should show alert for daily task type with appropriate message', async () => {
      const dueDate = new Date(Date.now() + 4 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          taskType="daily"
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const setButton = screen.getByRole('button', { name: 'Set' });

      await user.type(customInput, '300'); // 5 hours - too long for 4-hour due date
      await user.click(setButton);

      expect(mockAlert).toHaveBeenCalledWith(
        expect.stringContaining('daily schedule')
      );
    });

    it('should accept valid custom time input', async () => {
      const onReminderMinutesChange = vi.fn();
      const dueDate = new Date(Date.now() + 4 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE);
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      const setButton = screen.getByRole('button', { name: 'Set' });

      await user.type(customInput, '45');
      await user.click(setButton);

      expect(onReminderMinutesChange).toHaveBeenCalledWith(45);
      expect(mockAlert).not.toHaveBeenCalled();
      expect(screen.queryByText('Custom reminder time:')).not.toBeInTheDocument();
    });
  });

  describe('Custom Time Display', () => {
    it('should show custom time correctly when current value is not a preset', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={45} // Not a standard preset
          dueAt={new Date(Date.now() + TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('custom');

      // Should show the custom time in the dropdown
      const customOption = screen.getByText('45 minutes before');
      expect(customOption).toBeInTheDocument();
    });

    it('should format custom time display correctly for hours', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={90} // 1.5 hours
          dueAt={new Date(Date.now() + TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      expect(screen.getByText('1h 30m before')).toBeInTheDocument();
    });

    it('should format custom time display correctly for whole hours', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={180} // 3 hours exactly
          dueAt={new Date(Date.now() + TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      expect(screen.getByText('3 hours before')).toBeInTheDocument();
    });

    it('should format custom time display correctly for days', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={2520} // 1 day 18 hours
          dueAt={new Date(Date.now() + 5 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      expect(screen.getByText('1d 18h before')).toBeInTheDocument();
    });

    it('should format custom time display correctly for whole days', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={2880} // 2 days exactly
          dueAt={new Date(Date.now() + 5 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      expect(screen.getByText('2 days before')).toBeInTheDocument();
    });
  });

  describe('Range Information Display', () => {
    it('should show correct range information for custom input', async () => {
      const dueDate = new Date(Date.now() + 2 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 2 days
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' &&
               element?.textContent?.includes('Allowed range:') &&
               element?.textContent?.includes('days') &&
               element?.textContent?.includes('minute') &&
               element?.textContent?.includes('based on due date') || false;
      })).toBeInTheDocument();
    });

    it('should show hours when range is less than a day', async () => {
      const dueDate = new Date(Date.now() + 5 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 5 hours
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      expect(screen.getByText((content, element) => {
        return element?.tagName === 'P' &&
               element?.textContent?.includes('Allowed range:') &&
               element?.textContent?.includes('hours') &&
               element?.textContent?.includes('minute') || false;
      })).toBeInTheDocument();
    });

    it('should show daily schedule message for daily tasks', async () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          taskType="daily"
          dueAt={new Date(Date.now() + 12 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      expect(screen.getByText(/based on daily schedule/)).toBeInTheDocument();
    });

    it('should update max values for custom input based on unit selection', async () => {
      const dueDate = new Date(Date.now() + 6 * TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE); // 6 hours to avoid timing issues
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={dueDate.toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time') as HTMLInputElement;
      const unitSelect = screen.getByDisplayValue('minutes');

      // In minutes mode, max should be approximately 360 (6 hours), allow some variation for timing
      expect(parseInt(customInput.max)).toBeGreaterThanOrEqual(350);

      // Switch to hours mode
      await user.selectOptions(unitSelect, 'hours');

      // In hours mode, max should be 5 (5 hours)
      expect(customInput.max).toBe('5');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing dueAt gracefully', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      // Should use default max values when no due date
    });

    it('should handle invalid dueAt gracefully', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt="invalid-date"
        />
      );

      // When dueAt is invalid, should show warning instead of combobox
      expect(screen.getByText('No preset options available for this due date.')).toBeInTheDocument();
      expect(screen.getByText('Set custom time →')).toBeInTheDocument();
    });

    it('should handle zero or negative time differences', () => {
      const pastDate = new Date(Date.now() - TIME_CONSTANTS.ONE_HOUR_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          dueAt={pastDate}
        />
      );

      // Should show no presets available for past due date
      expect(screen.getByText('No preset options available for this due date.')).toBeInTheDocument();
    });

    it('should handle very large reminder minutes values', () => {
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          reminderMinutes={999999}
          dueAt={new Date(Date.now() + 30 * TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      // Should handle large values gracefully
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should handle keyboard interactions', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const checkbox = screen.getByRole('checkbox');

      // Test keyboard toggle - since enabled=true initially, toggling should set to false
      checkbox.focus();
      await user.keyboard(' ');

      expect(defaultProps.onEnabledChange).toHaveBeenCalledWith(false);
    });

    it('should handle form submission in custom input', async () => {
      const onReminderMinutesChange = vi.fn();
      render(
        <NotificationTimePicker
          {...defaultProps}
          enabled={true}
          onReminderMinutesChange={onReminderMinutesChange}
          dueAt={new Date(Date.now() + TIME_CONSTANTS.ONE_DAY_IN_MINUTES * TIME_CONSTANTS.MILLISECONDS_PER_MINUTE).toISOString()}
        />
      );

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customInput = screen.getByPlaceholderText('Enter time');
      await user.type(customInput, '25');

      // Test Set button submission
      const setButton = screen.getByRole('button', { name: 'Set' });
      await user.click(setButton);

      expect(onReminderMinutesChange).toHaveBeenCalledWith(25);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<NotificationTimePicker {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('id', 'notification-enabled');

      const label = screen.getByText('Enable task reminders');
      expect(label).toHaveAttribute('for', 'notification-enabled');
    });

    it('should have proper form labels and structure', () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const reminderLabel = screen.getByText('Remind me:');
      expect(reminderLabel).toBeInTheDocument();

      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('should have accessible custom input form', async () => {
      render(<NotificationTimePicker {...defaultProps} enabled={true} />);

      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'custom');

      const customLabel = screen.getByText('Custom reminder time:');
      expect(customLabel).toBeInTheDocument();

      const customInput = screen.getByPlaceholderText('Enter time');
      expect(customInput).toBeInTheDocument();
    });
  });
});