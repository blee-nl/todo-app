import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button, { ButtonProps } from '../Button';

// Mock the classNames utility
vi.mock('../../../utils/styles/classNames', () => ({
  cn: (...classes: (string | undefined | false)[]) =>
    classes.filter(Boolean).join(' ')
}));

describe('Button Component', () => {
  const renderButton = (props?: Partial<ButtonProps>) => {
    return render(<Button {...props}>Click me</Button>);
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderButton();

      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('Click me');
    });

    it('should render children content', () => {
      render(<Button>Custom Button Text</Button>);

      expect(screen.getByRole('button')).toHaveTextContent('Custom Button Text');
    });

    it('should apply custom className', () => {
      renderButton({ className: 'custom-class' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });
  });

  describe('Variants', () => {
    it('should apply primary variant classes by default', () => {
      renderButton();

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-500', 'text-white', 'hover:bg-blue-600');
    });

    it('should apply secondary variant classes', () => {
      renderButton({ variant: 'secondary' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
    });

    it('should apply success variant classes', () => {
      renderButton({ variant: 'success' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-green-500', 'text-white', 'hover:bg-green-600');
    });

    it('should apply danger variant classes', () => {
      renderButton({ variant: 'danger' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'text-white', 'hover:bg-red-600');
    });

    it('should apply warning variant classes', () => {
      renderButton({ variant: 'warning' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-yellow-500', 'text-white', 'hover:bg-yellow-600');
    });

    it('should apply ghost variant classes', () => {
      renderButton({ variant: 'ghost' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-transparent', 'text-gray-600', 'hover:bg-gray-100');
    });
  });

  describe('Sizes', () => {
    it('should apply medium size classes by default', () => {
      renderButton();

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-base', 'rounded-lg');
    });

    it('should apply small size classes', () => {
      renderButton({ size: 'sm' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm', 'rounded-lg');
    });

    it('should apply large size classes', () => {
      renderButton({ size: 'lg' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg', 'rounded-xl');
    });
  });

  describe('Base Classes', () => {
    it('should always include base classes', () => {
      renderButton();

      const button = screen.getByRole('button');
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'transition-all',
        'duration-200',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-offset-2'
      );
    });
  });

  describe('Disabled State', () => {
    it('should disable button when disabled prop is true', () => {
      renderButton({ disabled: true });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should disable button when isLoading is true', () => {
      renderButton({ isLoading: true });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });

    it('should not be disabled by default', () => {
      renderButton();

      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      renderButton({ isLoading: true });

      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('w-4', 'h-4', 'border-2', 'border-current', 'border-t-transparent', 'rounded-full', 'animate-spin', 'mr-2');
    });

    it('should not show loading spinner by default', () => {
      renderButton();

      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should hide right icon when loading', () => {
      renderButton({
        isLoading: true,
        rightIcon: <span data-testid="right-icon">→</span>
      });

      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should render left icon', () => {
      renderButton({
        leftIcon: <span data-testid="left-icon">←</span>
      });

      const leftIcon = screen.getByTestId('left-icon');
      expect(leftIcon).toBeInTheDocument();
      expect(leftIcon.parentElement).toHaveClass('mr-2');
    });

    it('should render right icon', () => {
      renderButton({
        rightIcon: <span data-testid="right-icon">→</span>
      });

      const rightIcon = screen.getByTestId('right-icon');
      expect(rightIcon).toBeInTheDocument();
      expect(rightIcon.parentElement).toHaveClass('ml-2');
    });

    it('should render both left and right icons', () => {
      renderButton({
        leftIcon: <span data-testid="left-icon">←</span>,
        rightIcon: <span data-testid="right-icon">→</span>
      });

      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('should not render left icon when loading', () => {
      renderButton({
        isLoading: true,
        leftIcon: <span data-testid="left-icon">←</span>
      });

      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });
  });

  describe('Event Handling', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not handle click events when disabled', () => {
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick, disabled: true });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should not handle click events when loading', () => {
      const handleClick = vi.fn();
      renderButton({ onClick: handleClick, isLoading: true });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard events', () => {
      const handleKeyDown = vi.fn();
      renderButton({ onKeyDown: handleKeyDown });

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      expect(handleKeyDown).toHaveBeenCalledTimes(1);
    });
  });

  describe('HTML Attributes', () => {
    it('should pass through HTML button attributes', () => {
      renderButton({
        type: 'submit',
        'data-testid': 'custom-button',
        'aria-label': 'Custom button label'
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('data-testid', 'custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom button label');
    });

    it('should support form attributes', () => {
      renderButton({
        form: 'my-form',
        formAction: '/submit',
        formMethod: 'post'
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('form', 'my-form');
      expect(button).toHaveAttribute('formaction', '/submit');
      expect(button).toHaveAttribute('formmethod', 'post');
    });
  });

  describe('Accessibility', () => {
    it('should be focusable', () => {
      renderButton();

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should not be focusable when disabled', () => {
      renderButton({ disabled: true });

      const button = screen.getByRole('button');
      button.focus();

      expect(button).not.toHaveFocus();
    });

    it('should include focus ring classes for accessibility', () => {
      renderButton();

      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-offset-2');
    });

    it('should support ARIA attributes', () => {
      renderButton({
        'aria-expanded': 'false',
        'aria-haspopup': 'true'
      });

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'true');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle variant and size combinations correctly', () => {
      renderButton({ variant: 'danger', size: 'lg' });

      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-500', 'px-6', 'py-3', 'text-lg');
    });

    it('should prioritize disabled state over other states', () => {
      renderButton({
        variant: 'primary',
        disabled: true,
        leftIcon: <span data-testid="icon">←</span>
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('should handle empty children gracefully', () => {
      render(<Button />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent('');
    });

    it('should render complex children content', () => {
      render(
        <Button>
          <span>Complex</span>
          <strong>Content</strong>
        </Button>
      );

      const button = screen.getByRole('button');
      expect(button.querySelector('span')).toHaveTextContent('Complex');
      expect(button.querySelector('strong')).toHaveTextContent('Content');
    });
  });
});