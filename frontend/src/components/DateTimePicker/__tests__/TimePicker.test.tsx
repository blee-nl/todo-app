import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TimePicker from '../TimePicker';
import { TIME_SELECTION, ARIA_LABELS } from '../../constants/dateTimePickerConstants';
import type { TimeState } from '../../utils/dateTimeUtils';

// Mock the design system components
vi.mock('../../../design-system', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
}));

describe('TimePicker', () => {
  const mockOnTimeChange = vi.fn();

  const defaultTimeState: TimeState = {
    hours: 14,
    minutes: 30,
  };

  const defaultProps = {
    selectedTime: defaultTimeState,
    onTimeChange: mockOnTimeChange,
  };

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.clearAllMocks();
    user = userEvent.setup();
  });

  describe('Rendering', () => {
    it('renders the time picker with correct structure', () => {
      const { container } = render(<TimePicker {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'space-y-4');
    });

    it('renders the main label', () => {
      render(<TimePicker {...defaultProps} />);

      expect(screen.getByText('Select Time')).toBeInTheDocument();
    });

    it('renders hour and minute selects', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      expect(hourSelect).toBeInTheDocument();
      expect(minuteSelect).toBeInTheDocument();
    });

    it('renders hour and minute labels', () => {
      render(<TimePicker {...defaultProps} />);

      expect(screen.getByText('Hour')).toBeInTheDocument();
      expect(screen.getByText('Minute')).toBeInTheDocument();
    });

    it('renders time separator', () => {
      render(<TimePicker {...defaultProps} />);

      expect(screen.getByText(':')).toBeInTheDocument();
    });

    it('renders dropdown arrows for both selects', () => {
      const { container } = render(<TimePicker {...defaultProps} />);

      const svgs = container.querySelectorAll('svg');
      expect(svgs).toHaveLength(2); // One for each select
    });

    it('displays correct selected values', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('14');
      expect(minuteSelect.value).toBe('30');
    });
  });

  describe('Hour Selection Options', () => {
    it('renders all 24 hour options', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const options = hourSelect.querySelectorAll('option');

      expect(options).toHaveLength(24);
      expect(TIME_SELECTION.HOURS).toHaveLength(24);
    });

    it('renders hour options with correct values and text', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const options = hourSelect.querySelectorAll('option');

      TIME_SELECTION.HOURS.forEach((hour, index) => {
        const option = options[index] as HTMLOptionElement;
        expect(option.value).toBe(hour.toString());
        expect(option.textContent).toBe(hour.toString().padStart(2, '0'));
      });
    });

    it('renders hours with zero padding', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      // Check first few hours are zero-padded
      expect(hourSelect.querySelector('option[value="0"]')?.textContent).toBe('00');
      expect(hourSelect.querySelector('option[value="1"]')?.textContent).toBe('01');
      expect(hourSelect.querySelector('option[value="9"]')?.textContent).toBe('09');
      expect(hourSelect.querySelector('option[value="10"]')?.textContent).toBe('10');
      expect(hourSelect.querySelector('option[value="23"]')?.textContent).toBe('23');
    });
  });

  describe('Minute Selection Options', () => {
    it('renders all 60 minute options', () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);
      const options = minuteSelect.querySelectorAll('option');

      expect(options).toHaveLength(60);
      expect(TIME_SELECTION.MINUTES).toHaveLength(60);
    });

    it('renders minute options with correct values and text', () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);
      const options = minuteSelect.querySelectorAll('option');

      TIME_SELECTION.MINUTES.forEach((minute, index) => {
        const option = options[index] as HTMLOptionElement;
        expect(option.value).toBe(minute.toString());
        expect(option.textContent).toBe(minute.toString().padStart(2, '0'));
      });
    });

    it('renders minutes with zero padding', () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      // Check first few minutes are zero-padded
      expect(minuteSelect.querySelector('option[value="0"]')?.textContent).toBe('00');
      expect(minuteSelect.querySelector('option[value="1"]')?.textContent).toBe('01');
      expect(minuteSelect.querySelector('option[value="9"]')?.textContent).toBe('09');
      expect(minuteSelect.querySelector('option[value="10"]')?.textContent).toBe('10');
      expect(minuteSelect.querySelector('option[value="59"]')?.textContent).toBe('59');
    });
  });

  describe('Hour Selection Interactions', () => {
    it('calls onTimeChange when hour is changed', async () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      await user.selectOptions(hourSelect, '16');

      expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
      expect(mockOnTimeChange).toHaveBeenCalledWith(16, 30); // Keep existing minutes
    });

    it('handles hour selection with fireEvent', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      fireEvent.change(hourSelect, { target: { value: '8' } });

      expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
      expect(mockOnTimeChange).toHaveBeenCalledWith(8, 30);
    });

    it('handles multiple hour changes', async () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      await user.selectOptions(hourSelect, '10');
      await user.selectOptions(hourSelect, '20');
      await user.selectOptions(hourSelect, '5');

      expect(mockOnTimeChange).toHaveBeenCalledTimes(3);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(1, 10, 30);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(2, 20, 30);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(3, 5, 30);
    });

    it('handles edge case hours (0 and 23)', async () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      await user.selectOptions(hourSelect, '0');
      expect(mockOnTimeChange).toHaveBeenCalledWith(0, 30);

      await user.selectOptions(hourSelect, '23');
      expect(mockOnTimeChange).toHaveBeenCalledWith(23, 30);
    });
  });

  describe('Minute Selection Interactions', () => {
    it('calls onTimeChange when minute is changed', async () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      await user.selectOptions(minuteSelect, '45');

      expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
      expect(mockOnTimeChange).toHaveBeenCalledWith(14, 45); // Keep existing hours
    });

    it('handles minute selection with fireEvent', () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      fireEvent.change(minuteSelect, { target: { value: '15' } });

      expect(mockOnTimeChange).toHaveBeenCalledTimes(1);
      expect(mockOnTimeChange).toHaveBeenCalledWith(14, 15);
    });

    it('handles multiple minute changes', async () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      await user.selectOptions(minuteSelect, '0');
      await user.selectOptions(minuteSelect, '30');
      await user.selectOptions(minuteSelect, '59');

      expect(mockOnTimeChange).toHaveBeenCalledTimes(3);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(1, 14, 0);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(2, 14, 30);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(3, 14, 59);
    });

    it('handles edge case minutes (0 and 59)', async () => {
      render(<TimePicker {...defaultProps} />);

      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      await user.selectOptions(minuteSelect, '0');
      expect(mockOnTimeChange).toHaveBeenCalledWith(14, 0);

      await user.selectOptions(minuteSelect, '59');
      expect(mockOnTimeChange).toHaveBeenCalledWith(14, 59);
    });
  });

  describe('Combined Hour and Minute Changes', () => {
    it('handles both hour and minute changes independently', async () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      await user.selectOptions(hourSelect, '9');
      await user.selectOptions(minuteSelect, '15');

      expect(mockOnTimeChange).toHaveBeenCalledTimes(2);
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(1, 9, 30); // Hour change
      expect(mockOnTimeChange).toHaveBeenNthCalledWith(2, 14, 15); // Minute change (with original hour)
    });

    it('preserves current state when changing one value', async () => {
      const initialTime: TimeState = { hours: 8, minutes: 45 };
      render(<TimePicker selectedTime={initialTime} onTimeChange={mockOnTimeChange} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      await user.selectOptions(hourSelect, '12');

      expect(mockOnTimeChange).toHaveBeenCalledWith(12, 45); // Minutes preserved
    });
  });

  describe('Different Time States', () => {
    it('displays midnight correctly', () => {
      const midnightTime: TimeState = { hours: 0, minutes: 0 };
      render(<TimePicker selectedTime={midnightTime} onTimeChange={mockOnTimeChange} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('0');
      expect(minuteSelect.value).toBe('0');
    });

    it('displays noon correctly', () => {
      const noonTime: TimeState = { hours: 12, minutes: 0 };
      render(<TimePicker selectedTime={noonTime} onTimeChange={mockOnTimeChange} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('12');
      expect(minuteSelect.value).toBe('0');
    });

    it('displays end of day correctly', () => {
      const endOfDayTime: TimeState = { hours: 23, minutes: 59 };
      render(<TimePicker selectedTime={endOfDayTime} onTimeChange={mockOnTimeChange} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('23');
      expect(minuteSelect.value).toBe('59');
    });

    it('updates display when selectedTime prop changes', () => {
      const { rerender } = render(<TimePicker {...defaultProps} />);

      let hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      let minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('14');
      expect(minuteSelect.value).toBe('30');

      const newTime: TimeState = { hours: 6, minutes: 15 };
      rerender(<TimePicker selectedTime={newTime} onTimeChange={mockOnTimeChange} />);

      hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR) as HTMLSelectElement;
      minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE) as HTMLSelectElement;

      expect(hourSelect.value).toBe('6');
      expect(minuteSelect.value).toBe('15');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels for selects', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      expect(hourSelect).toHaveAttribute('aria-label', ARIA_LABELS.SELECT_HOUR);
      expect(minuteSelect).toHaveAttribute('aria-label', ARIA_LABELS.SELECT_MINUTE);
    });

    it('has proper label association', () => {
      render(<TimePicker {...defaultProps} />);

      expect(screen.getByText('Hour')).toBeInTheDocument();
      expect(screen.getByText('Minute')).toBeInTheDocument();
    });

    it('selects are keyboard accessible', async () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      hourSelect.focus();
      await user.keyboard('{ArrowDown}');

      // The select should be focused and responsive to keyboard
      expect(hourSelect).toHaveFocus();
    });
  });

  describe('Styling and CSS Classes', () => {
    it('applies correct CSS classes to selects', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      const minuteSelect = screen.getByLabelText(ARIA_LABELS.SELECT_MINUTE);

      const expectedClasses = [
        'appearance-none', 'bg-white', 'border-2', 'border-gray-200',
        'rounded-xl', 'px-4', 'py-3', 'text-center', 'text-lg',
        'font-semibold', 'text-gray-800', 'min-w-[80px]'
      ];

      expectedClasses.forEach(className => {
        expect(hourSelect).toHaveClass(className);
        expect(minuteSelect).toHaveClass(className);
      });
    });

    it('renders labels with correct styling', () => {
      render(<TimePicker {...defaultProps} />);

      const mainLabel = screen.getByText('Select Time');
      const hourLabel = screen.getByText('Hour');
      const minuteLabel = screen.getByText('Minute');

      expect(mainLabel).toHaveClass('text-sm', 'font-medium', 'text-gray-700');
      expect(hourLabel).toHaveClass('text-xs', 'font-medium', 'text-gray-600', 'mb-2');
      expect(minuteLabel).toHaveClass('text-xs', 'font-medium', 'text-gray-600', 'mb-2');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined callback function gracefully', () => {
      expect(() => {
        render(<TimePicker selectedTime={defaultTimeState} onTimeChange={undefined as any} />);
      }).not.toThrow();
    });

    it('handles extreme time values', () => {
      const extremeTime: TimeState = { hours: 23, minutes: 59 };

      expect(() => {
        render(<TimePicker selectedTime={extremeTime} onTimeChange={mockOnTimeChange} />);
      }).not.toThrow();
    });

    it('handles invalid hour values gracefully', () => {
      const invalidTime: TimeState = { hours: 25, minutes: 30 };

      expect(() => {
        render(<TimePicker selectedTime={invalidTime} onTimeChange={mockOnTimeChange} />);
      }).not.toThrow();
    });

    it('handles invalid minute values gracefully', () => {
      const invalidTime: TimeState = { hours: 12, minutes: 70 };

      expect(() => {
        render(<TimePicker selectedTime={invalidTime} onTimeChange={mockOnTimeChange} />);
      }).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('calls onTimeChange callback correctly', async () => {
      const mockCallback = vi.fn();
      render(<TimePicker selectedTime={defaultTimeState} onTimeChange={mockCallback} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);
      await user.selectOptions(hourSelect, '10');

      expect(mockCallback).toHaveBeenCalledTimes(1);
      expect(mockCallback).toHaveBeenCalledWith(10, 30);
    });

    it('handles non-numeric input values', () => {
      render(<TimePicker {...defaultProps} />);

      const hourSelect = screen.getByLabelText(ARIA_LABELS.SELECT_HOUR);

      fireEvent.change(hourSelect, { target: { value: 'invalid' } });

      // Should still call onTimeChange with NaN, which parseInt handles
      expect(mockOnTimeChange).toHaveBeenCalledWith(NaN, 30);
    });
  });
});