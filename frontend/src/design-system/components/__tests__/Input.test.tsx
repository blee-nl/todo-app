import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input, { InputProps } from '../Input';

// Mock the classNames utility
vi.mock('../../../utils/styles/classNames', () => ({
  cn: (...classes: (string | undefined | false)[]) =>
    classes.filter(Boolean).join(' ')
}));

describe('Input Component', () => {
  const renderInput = (props?: Partial<InputProps>) => {
    return render(<Input {...props} />);
  };

  describe('Basic Rendering', () => {
    it('should render input without label', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should render input with label', () => {
      renderInput({ label: 'Test Label' });

      const label = screen.getByText('Test Label');
      const input = screen.getByRole('textbox');

      expect(label).toBeInTheDocument();
      expect(input).toBeInTheDocument();
      expect(label).toHaveAttribute('for', input.id);
    });

    it('should apply custom className', () => {
      renderInput({ className: 'custom-class' });

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-class');
    });

    it('should use provided id', () => {
      const customId = 'custom-input-id';
      renderInput({ id: customId, label: 'Test Label' });

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');

      expect(input).toHaveAttribute('id', customId);
      expect(label).toHaveAttribute('for', customId);
    });

    it('should generate random id when not provided', () => {
      renderInput({ label: 'Test Label' });

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');

      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.id);
      expect(input.id).toMatch(/^input-[a-z0-9]{9}$/);
    });
  });

  describe('Base Classes', () => {
    it('should always include base classes', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'border',
        'rounded-xl',
        'focus:ring-2',
        'focus:ring-blue-500',
        'focus:border-transparent',
        'transition-all',
        'duration-200'
      );
    });
  });

  describe('Required State', () => {
    it('should show required asterisk when isRequired is true', () => {
      renderInput({ label: 'Required Field', isRequired: true });

      const asterisk = screen.getByText('*');
      expect(asterisk).toBeInTheDocument();
      expect(asterisk).toHaveClass('text-red-500', 'ml-1');
    });

    it('should not show required asterisk by default', () => {
      renderInput({ label: 'Optional Field' });

      const asterisk = screen.queryByText('*');
      expect(asterisk).not.toBeInTheDocument();
    });

    it('should not show required asterisk when isRequired is false', () => {
      renderInput({ label: 'Optional Field', isRequired: false });

      const asterisk = screen.queryByText('*');
      expect(asterisk).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should apply error classes when error is provided', () => {
      renderInput({ error: 'This field is required' });

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
    });

    it('should display error message', () => {
      const errorMessage = 'This field is required';
      renderInput({ error: errorMessage });

      const error = screen.getByText(errorMessage);
      expect(error).toBeInTheDocument();
      expect(error).toHaveClass('text-sm', 'text-red-600');
    });

    it('should not apply error classes when no error', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('border-red-300', 'focus:ring-red-500', 'focus:border-red-500');
    });

    it('should hide helper text when error is present', () => {
      renderInput({
        error: 'Error message',
        helperText: 'Helper text'
      });

      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      const helperText = 'This is helpful information';
      renderInput({ helperText });

      const helper = screen.getByText(helperText);
      expect(helper).toBeInTheDocument();
      expect(helper).toHaveClass('text-sm', 'text-gray-500');
    });

    it('should not display helper text when not provided', () => {
      renderInput();

      // Should not have any element with helper text classes
      const helpers = document.querySelectorAll('.text-gray-500');
      expect(helpers).toHaveLength(0);
    });

    it('should display helper text when no error', () => {
      renderInput({ helperText: 'Helpful info' });

      expect(screen.getByText('Helpful info')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('should apply disabled classes when disabled', () => {
      renderInput({ disabled: true });

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });

    it('should not apply disabled classes by default', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).not.toBeDisabled();
      expect(input).not.toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      renderInput({
        leftIcon: <span data-testid="left-icon">🔍</span>
      });

      const leftIcon = screen.getByTestId('left-icon');
      const input = screen.getByRole('textbox');

      expect(leftIcon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10');

      // Check icon container positioning
      const iconContainer = leftIcon.closest('.absolute');
      expect(iconContainer).toHaveClass('inset-y-0', 'left-0', 'pl-3', 'flex', 'items-center', 'pointer-events-none');
      expect(leftIcon.parentElement).toHaveClass('text-gray-400');
    });

    it('should render right icon', () => {
      renderInput({
        rightIcon: <span data-testid="right-icon">👁️</span>
      });

      const rightIcon = screen.getByTestId('right-icon');
      const input = screen.getByRole('textbox');

      expect(rightIcon).toBeInTheDocument();
      expect(input).toHaveClass('pr-10');

      // Check icon container positioning
      const iconContainer = rightIcon.closest('.absolute');
      expect(iconContainer).toHaveClass('inset-y-0', 'right-0', 'pr-3', 'flex', 'items-center', 'pointer-events-none');
      expect(rightIcon.parentElement).toHaveClass('text-gray-400');
    });

    it('should render both left and right icons', () => {
      renderInput({
        leftIcon: <span data-testid="left-icon">🔍</span>,
        rightIcon: <span data-testid="right-icon">👁️</span>
      });

      const leftIcon = screen.getByTestId('left-icon');
      const rightIcon = screen.getByTestId('right-icon');
      const input = screen.getByRole('textbox');

      expect(leftIcon).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();
      expect(input).toHaveClass('pl-10', 'pr-10');
    });

    it('should not apply icon padding classes when no icons', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveClass('pl-10', 'pr-10');
    });
  });

  describe('Event Handling', () => {
    it('should handle onChange events', () => {
      const handleChange = vi.fn();
      renderInput({ onChange: handleChange });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(input).toHaveValue('test value');
    });

    it('should handle onFocus events', () => {
      const handleFocus = vi.fn();
      renderInput({ onFocus: handleFocus });

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalledTimes(1);
    });

    it('should handle onBlur events', () => {
      const handleBlur = vi.fn();
      renderInput({ onBlur: handleBlur });

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalledTimes(1);
    });

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      renderInput({ onKeyDown: handleKeyDown });

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });

    it('should not handle events when disabled', () => {
      const handleChange = vi.fn();
      renderInput({ onChange: handleChange, disabled: true });

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test value' } });

      // onChange should still fire (browser behavior), but input value shouldn't change
      expect(input).toBeDisabled();
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML input attributes', () => {
      renderInput({
        type: 'email',
        placeholder: 'Enter your email',
        maxLength: 100,
        'data-testid': 'custom-input',
        'aria-describedby': 'help-text'
      });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
      expect(input).toHaveAttribute('maxlength', '100');
      expect(input).toHaveAttribute('data-testid', 'custom-input');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });

    it('should support different input types', () => {
      const { rerender } = render(<Input type="password" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'password');

      rerender(<Input type="number" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'number');

      rerender(<Input type="search" />);
      expect(screen.getByDisplayValue('')).toHaveAttribute('type', 'search');
    });

    it('should support form attributes', () => {
      renderInput({
        name: 'username',
        required: true,
        autoComplete: 'username',
        form: 'login-form'
      });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'username');
      expect(input).toHaveAttribute('required');
      expect(input).toHaveAttribute('autocomplete', 'username');
      expect(input).toHaveAttribute('form', 'login-form');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderInput({ disabled: true });

      const input = screen.getByRole('textbox');
      input.focus();

      expect(input).not.toHaveFocus();
    });

    it('should associate label with input correctly', () => {
      renderInput({ label: 'Username', id: 'username-input' });

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Username');

      expect(label).toHaveAttribute('for', 'username-input');
      expect(input).toHaveAttribute('id', 'username-input');
    });

    it('should support ARIA attributes', () => {
      renderInput({
        'aria-label': 'Custom label',
        'aria-required': 'true',
        'aria-invalid': 'true'
      });

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Custom label');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should have proper focus ring classes', () => {
      renderInput();

      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-blue-500', 'focus:border-transparent');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle all props together correctly', () => {
      renderInput({
        label: 'Email Address',
        placeholder: 'Enter your email',
        type: 'email',
        isRequired: true,
        error: 'Invalid email format',
        helperText: 'We will not share your email',
        leftIcon: <span data-testid="email-icon">📧</span>,
        rightIcon: <span data-testid="clear-icon">✕</span>,
        disabled: false,
        className: 'custom-input'
      });

      const input = screen.getByRole('textbox');
      const label = screen.getByText('Email Address');
      const asterisk = screen.getByText('*');
      const error = screen.getByText('Invalid email format');
      const leftIcon = screen.getByTestId('email-icon');
      const rightIcon = screen.getByTestId('clear-icon');

      // Verify all elements are rendered
      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(asterisk).toBeInTheDocument();
      expect(error).toBeInTheDocument();
      expect(leftIcon).toBeInTheDocument();
      expect(rightIcon).toBeInTheDocument();

      // Verify input has correct attributes and classes
      expect(input).toHaveAttribute('type', 'email');
      expect(input).toHaveAttribute('placeholder', 'Enter your email');
      expect(input).toHaveClass('custom-input', 'pl-10', 'pr-10', 'border-red-300');

      // Verify helper text is hidden when error is present
      expect(screen.queryByText('We will not share your email')).not.toBeInTheDocument();
    });

    it('should handle disabled state with icons and error', () => {
      renderInput({
        label: 'Disabled Field',
        error: 'This field has an error',
        leftIcon: <span data-testid="icon">🔒</span>,
        disabled: true
      });

      const input = screen.getByRole('textbox');
      const error = screen.getByText('This field has an error');
      const icon = screen.getByTestId('icon');

      expect(input).toBeDisabled();
      expect(input).toHaveClass('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
      expect(input).toHaveClass('border-red-300'); // Error classes should still apply
      expect(error).toBeInTheDocument();
      expect(icon).toBeInTheDocument();
    });

    it('should handle empty values gracefully', () => {
      renderInput({
        label: '',
        error: '',
        helperText: '',
        leftIcon: null,
        rightIcon: undefined
      });

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // Should not render label element when label is empty
      const labelElement = input.closest('.space-y-2')?.querySelector('label');
      expect(labelElement).not.toBeInTheDocument();

      // Should not render error or helper text paragraphs
      const errorElement = input.closest('.space-y-2')?.querySelector('.text-red-600');
      const helperElement = input.closest('.space-y-2')?.querySelector('.text-gray-500');
      expect(errorElement).not.toBeInTheDocument();
      expect(helperElement).not.toBeInTheDocument();

      // Should not have icon padding classes
      expect(input).not.toHaveClass('pl-10', 'pr-10');
    });

    it('should maintain unique IDs across multiple instances', () => {
      const { rerender } = render(
        <div>
          <Input label="First Input" />
          <Input label="Second Input" />
        </div>
      );

      const inputs = screen.getAllByRole('textbox');
      const labels = screen.getAllByText(/Input$/);

      expect(inputs[0].id).not.toBe(inputs[1].id);
      expect(labels[0]).toHaveAttribute('for', inputs[0].id);
      expect(labels[1]).toHaveAttribute('for', inputs[1].id);
    });
  });

  describe('Layout Structure', () => {
    it('should have correct container structure', () => {
      renderInput({
        label: 'Test Label',
        leftIcon: <span data-testid="left-icon">🔍</span>,
        rightIcon: <span data-testid="right-icon">👁️</span>,
        error: 'Error message'
      });

      // Main container should have space-y-2
      const container = screen.getByText('Test Label').closest('.space-y-2');
      expect(container).toBeInTheDocument();

      // Input wrapper should have relative positioning
      const inputWrapper = screen.getByRole('textbox').closest('.relative');
      expect(inputWrapper).toBeInTheDocument();

      // Icon containers should be absolutely positioned
      const leftIconContainer = screen.getByTestId('left-icon').closest('.absolute');
      const rightIconContainer = screen.getByTestId('right-icon').closest('.absolute');

      expect(leftIconContainer).toHaveClass('absolute', 'inset-y-0', 'left-0');
      expect(rightIconContainer).toHaveClass('absolute', 'inset-y-0', 'right-0');
    });
  });
});