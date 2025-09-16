import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ActionButtons from '../ActionButtons';
import { ARIA_LABELS } from '../../constants/dateTimePickerConstants';

// Mock the design system components
vi.mock('../../../design-system', () => ({
  Button: ({ children, onClick, type, variant, size, leftIcon, 'aria-label': ariaLabel, ...props }: any) => (
    <button
      type={type}
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      aria-label={ariaLabel}
      {...props}
    >
      {leftIcon}
      {children}
    </button>
  ),
}));

// Mock the icons
vi.mock('../../../assets/icons', () => ({
  CheckIcon: ({ size }: any) => (
    <div data-testid="check-icon" data-size={size}>
      CheckIcon
    </div>
  ),
  XIcon: ({ size }: any) => (
    <div data-testid="x-icon" data-size={size}>
      XIcon
    </div>
  ),
}));

describe('ActionButtons', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders both cancel and confirm buttons', () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION })).toBeInTheDocument();
    });

    it('renders cancel button with correct text and icon', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      expect(cancelButton).toHaveTextContent('Cancel');
      expect(cancelButton.querySelector('[data-testid="x-icon"]')).toBeInTheDocument();
    });

    it('renders confirm button with correct text and icon', () => {
      render(<ActionButtons {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });
      expect(confirmButton).toHaveTextContent('Confirm');
      expect(confirmButton.querySelector('[data-testid="check-icon"]')).toBeInTheDocument();
    });

    it('renders buttons with correct attributes', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });

      // Check button types
      expect(cancelButton).toHaveAttribute('type', 'button');
      expect(confirmButton).toHaveAttribute('type', 'button');

      // Check button variants
      expect(cancelButton).toHaveAttribute('data-variant', 'secondary');
      expect(confirmButton).toHaveAttribute('data-variant', 'primary');

      // Check button sizes
      expect(cancelButton).toHaveAttribute('data-size', 'sm');
      expect(confirmButton).toHaveAttribute('data-size', 'sm');
    });

    it('renders with correct CSS classes', () => {
      const { container } = render(<ActionButtons {...defaultProps} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex', 'justify-end', 'space-x-2', 'pt-4', 'border-t', 'border-gray-200');
    });

    it('renders icons with correct sizes', () => {
      render(<ActionButtons {...defaultProps} />);

      const xIcon = screen.getByTestId('x-icon');
      const checkIcon = screen.getByTestId('check-icon');

      expect(xIcon).toHaveAttribute('data-size', 'xs');
      expect(checkIcon).toHaveAttribute('data-size', 'xs');
    });
  });

  describe('Interactions', () => {
    it('calls onCancel when cancel button is clicked', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls onConfirm when confirm button is clicked', () => {
      render(<ActionButtons {...defaultProps} />);

      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('handles multiple clicks correctly', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });

      // Click cancel multiple times
      fireEvent.click(cancelButton);
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(2);

      // Click confirm multiple times
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA labels', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });

      expect(cancelButton).toHaveAttribute('aria-label', ARIA_LABELS.CANCEL_SELECTION);
      expect(confirmButton).toHaveAttribute('aria-label', ARIA_LABELS.CONFIRM_SELECTION);
    });

    it('buttons are keyboard accessible', () => {
      render(<ActionButtons {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });

      // Test that buttons are focusable and clickable
      cancelButton.focus();
      expect(cancelButton).toHaveFocus();
      fireEvent.click(cancelButton);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);

      confirmButton.focus();
      expect(confirmButton).toHaveFocus();
      fireEvent.click(confirmButton);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    it('handles missing callback functions gracefully', () => {
      const propsWithUndefinedCallbacks = {
        onConfirm: undefined as any,
        onCancel: undefined as any,
      };

      expect(() => {
        render(<ActionButtons {...propsWithUndefinedCallbacks} />);
      }).not.toThrow();
    });

    it('calls callbacks correctly', () => {
      const mockOnConfirm = vi.fn();
      const mockOnCancel = vi.fn();

      render(<ActionButtons onConfirm={mockOnConfirm} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByRole('button', { name: ARIA_LABELS.CANCEL_SELECTION });
      const confirmButton = screen.getByRole('button', { name: ARIA_LABELS.CONFIRM_SELECTION });

      fireEvent.click(cancelButton);
      fireEvent.click(confirmButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });
});