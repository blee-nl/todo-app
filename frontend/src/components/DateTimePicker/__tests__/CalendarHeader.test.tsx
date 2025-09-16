import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CalendarHeader from '../CalendarHeader';
import { MONTH_NAMES, ARIA_LABELS } from '../../constants/dateTimePickerConstants';

// Mock the design system components
vi.mock('../../../design-system', () => ({
  Button: ({ children, onClick, type, variant, size, className, leftIcon, 'aria-label': ariaLabel, ...props }: any) => (
    <button
      type={type}
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  ),
  Heading: ({ children, level, ...props }: any) => {
    const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
    return <HeadingTag data-level={level} {...props}>{children}</HeadingTag>;
  },
}));

// Mock the icons
vi.mock('../../../assets/icons', () => ({
  ChevronLeftIcon: ({ size }: any) => (
    <div data-testid="chevron-left-icon" data-size={size}>
      ChevronLeftIcon
    </div>
  ),
  ChevronRightIcon: ({ size }: any) => (
    <div data-testid="chevron-right-icon" data-size={size}>
      ChevronRightIcon
    </div>
  ),
}));

describe('CalendarHeader', () => {
  const mockOnPreviousMonth = vi.fn();
  const mockOnNextMonth = vi.fn();

  const defaultProps = {
    displayDate: new Date(2024, 0, 15), // January 15, 2024
    onPreviousMonth: mockOnPreviousMonth,
    onNextMonth: mockOnNextMonth,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the calendar header with correct structure', () => {
      const { container } = render(<CalendarHeader {...defaultProps} />);

      const header = container.firstChild as HTMLElement;
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'mb-4');
    });

    it('renders previous month button', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      expect(prevButton).toBeInTheDocument();
    });

    it('renders next month button', () => {
      render(<CalendarHeader {...defaultProps} />);

      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });
      expect(nextButton).toBeInTheDocument();
    });

    it('displays the correct month and year', () => {
      render(<CalendarHeader {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('January 2024');
    });

    it('renders buttons with correct attributes', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });

      // Check button types
      expect(prevButton).toHaveAttribute('type', 'button');
      expect(nextButton).toHaveAttribute('type', 'button');

      // Check button variants
      expect(prevButton).toHaveAttribute('data-variant', 'ghost');
      expect(nextButton).toHaveAttribute('data-variant', 'ghost');

      // Check button sizes
      expect(prevButton).toHaveAttribute('data-size', 'sm');
      expect(nextButton).toHaveAttribute('data-size', 'sm');

      // Check button classes
      expect(prevButton).toHaveClass('p-2');
      expect(nextButton).toHaveClass('p-2');
    });

    it('renders icons with correct sizes', () => {
      render(<CalendarHeader {...defaultProps} />);

      const leftIcon = screen.getByTestId('chevron-left-icon');
      const rightIcon = screen.getByTestId('chevron-right-icon');

      expect(leftIcon).toHaveAttribute('data-size', 'md');
      expect(rightIcon).toHaveAttribute('data-size', 'md');
    });

    it('renders heading with correct level', () => {
      render(<CalendarHeader {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveAttribute('data-level', '3');
    });
  });

  describe('Month and Year Display', () => {
    it('displays correct month name for each month', () => {
      // Test just a few representative months instead of all 12
      const testCases = [
        { month: 0, name: 'January' },
        { month: 5, name: 'June' },
        { month: 11, name: 'December' }
      ];

      testCases.forEach(({ month, name }) => {
        const { unmount } = render(<CalendarHeader {...defaultProps} displayDate={new Date(2024, month, 15)} />);
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent(`${name} 2024`);
        unmount();
      });
    });

    it('displays different years correctly', () => {
      // Test just a few representative years
      const testYears = [2020, 2024, 2025];

      testYears.forEach((year) => {
        const { unmount } = render(<CalendarHeader {...defaultProps} displayDate={new Date(year, 5, 15)} />);
        const heading = screen.getByRole('heading', { level: 3 });
        expect(heading).toHaveTextContent(`June ${year}`);
        unmount();
      });
    });

    it('handles edge case dates correctly', () => {
      // Test leap year February
      const leapYearDate = new Date(2024, 1, 29); // February 29, 2024
      render(<CalendarHeader {...defaultProps} displayDate={leapYearDate} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('February 2024');
    });

    it('handles year boundaries correctly', () => {
      // Last day of year
      const { unmount } = render(<CalendarHeader {...defaultProps} displayDate={new Date(2023, 11, 31)} />);
      let heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('December 2023');
      unmount();

      // First day of year
      const { unmount: unmount2 } = render(<CalendarHeader {...defaultProps} displayDate={new Date(2024, 0, 1)} />);
      heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('January 2024');
      unmount2();
    });
  });

  describe('Interactions', () => {
    it('calls onPreviousMonth when previous button is clicked', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      fireEvent.click(prevButton);

      expect(mockOnPreviousMonth).toHaveBeenCalledTimes(1);
      expect(mockOnNextMonth).not.toHaveBeenCalled();
    });

    it('calls onNextMonth when next button is clicked', () => {
      render(<CalendarHeader {...defaultProps} />);

      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });
      fireEvent.click(nextButton);

      expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
      expect(mockOnPreviousMonth).not.toHaveBeenCalled();
    });

    it('handles multiple clicks correctly', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });

      // Click previous multiple times
      fireEvent.click(prevButton);
      fireEvent.click(prevButton);
      expect(mockOnPreviousMonth).toHaveBeenCalledTimes(2);

      // Click next multiple times
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      expect(mockOnNextMonth).toHaveBeenCalledTimes(3);
    });

    it('handles rapid clicks correctly', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });

      // Simulate rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(prevButton);
      }

      expect(mockOnPreviousMonth).toHaveBeenCalledTimes(10);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels for navigation buttons', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });

      expect(prevButton).toHaveAttribute('aria-label', ARIA_LABELS.PREVIOUS_MONTH);
      expect(nextButton).toHaveAttribute('aria-label', ARIA_LABELS.NEXT_MONTH);
    });

    it('buttons are keyboard accessible', () => {
      render(<CalendarHeader {...defaultProps} />);

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });

      // Test that buttons are focusable and clickable
      prevButton.focus();
      expect(prevButton).toHaveFocus();
      fireEvent.click(prevButton);
      expect(mockOnPreviousMonth).toHaveBeenCalledTimes(1);

      nextButton.focus();
      expect(nextButton).toHaveFocus();
      fireEvent.click(nextButton);
      expect(mockOnNextMonth).toHaveBeenCalledTimes(1);
    });

    it('has proper semantic structure', () => {
      render(<CalendarHeader {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('heading provides context for screen readers', () => {
      render(<CalendarHeader {...defaultProps} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('January 2024');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined callback functions gracefully', () => {
      const propsWithUndefinedCallbacks = {
        displayDate: new Date(2024, 0, 15),
        onPreviousMonth: undefined as any,
        onNextMonth: undefined as any,
      };

      expect(() => {
        render(<CalendarHeader {...propsWithUndefinedCallbacks} />);
      }).not.toThrow();
    });

    it('handles invalid date objects', () => {
      const invalidDate = new Date('invalid-date');

      expect(() => {
        render(<CalendarHeader {...defaultProps} displayDate={invalidDate} />);
      }).not.toThrow();
    });

    it('handles extreme dates', () => {
      // Very old date
      const { unmount } = render(<CalendarHeader {...defaultProps} displayDate={new Date(1900, 0, 1)} />);
      let heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('January 1900');
      unmount();

      // Very future date
      const { unmount: unmount2 } = render(<CalendarHeader {...defaultProps} displayDate={new Date(2100, 11, 31)} />);
      heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('December 2100');
      unmount2();
    });

    it('updates display when displayDate prop changes', () => {
      const { rerender } = render(<CalendarHeader {...defaultProps} />);

      let heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('January 2024');

      // Change the date
      const newDate = new Date(2024, 5, 15); // June 2024
      rerender(<CalendarHeader {...defaultProps} displayDate={newDate} />);

      heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('June 2024');
    });
  });

  describe('Error Handling', () => {
    it('calls callbacks even when they might have issues', () => {
      const mockOnPrevious = vi.fn();
      const mockOnNext = vi.fn();

      render(
        <CalendarHeader
          displayDate={defaultProps.displayDate}
          onPreviousMonth={mockOnPrevious}
          onNextMonth={mockOnNext}
        />
      );

      const prevButton = screen.getByRole('button', { name: ARIA_LABELS.PREVIOUS_MONTH });
      const nextButton = screen.getByRole('button', { name: ARIA_LABELS.NEXT_MONTH });

      fireEvent.click(prevButton);
      fireEvent.click(nextButton);

      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });
});