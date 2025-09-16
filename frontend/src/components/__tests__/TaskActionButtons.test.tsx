import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import {
  CancelButton,
  SaveButton,
  DeleteButton,
  CompleteButton,
  ActivateButton,
  FailedButton,
  DeleteAllButton,
  ReactivateButton,
  AddTaskButton,
} from '../TaskActionButtons';

// Mock the design system Button component
vi.mock('../../design-system', () => ({
  Button: ({ children, onClick, disabled, type, variant, size, isLoading, leftIcon, className, ...props }: any) => (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      data-loading={isLoading}
      className={className}
      {...props}
    >
      {leftIcon && <span data-testid="left-icon">{leftIcon}</span>}
      {children}
    </button>
  ),
}));

// Mock the icons
vi.mock('../../assets/icons', () => ({
  CheckIcon: ({ size }: any) => <div data-testid="check-icon" data-size={size}>CheckIcon</div>,
  XIcon: ({ size }: any) => <div data-testid="x-icon" data-size={size}>XIcon</div>,
  TrashIcon: ({ size }: any) => <div data-testid="trash-icon" data-size={size}>TrashIcon</div>,
  RefreshIcon: ({ size }: any) => <div data-testid="refresh-icon" data-size={size}>RefreshIcon</div>,
  PlusIcon: ({ size }: any) => <div data-testid="plus-icon" data-size={size}>PlusIcon</div>,
}));

describe('TaskActionButtons', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  describe('CancelButton', () => {
    it('should render with default props', () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'secondary');
      expect(button).toHaveAttribute('data-size', 'md');
      expect(button).not.toBeDisabled();
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toBeDisabled();
    });

    it('should apply custom size', () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} size="sm" />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should apply custom className', () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} className="custom-class" />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      expect(button).toHaveClass('custom-class');
    });

    it('should handle keyboard interactions', async () => {
      const onClick = vi.fn();
      render(<CancelButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'Cancel' });
      button.focus();
      await user.keyboard('{Enter}');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('SaveButton', () => {
    it('should render with default props', () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'primary');
      expect(button).toHaveAttribute('data-size', 'md');
    });

    it('should show loading state', () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveAttribute('data-loading', 'true');
    });

    it('should be disabled when loading', () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toBeDisabled();
    });

    it('should handle click events when not loading', async () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'Save' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle custom sizes', () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} size="lg" />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveAttribute('data-size', 'lg');
    });
  });

  describe('DeleteButton', () => {
    it('should render with trash icon', () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'danger');

      const icon = screen.getByTestId('left-icon');
      expect(icon).toBeInTheDocument();
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    it('should handle loading state with icon', () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete' });
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete' });
      expect(button).toBeDisabled();
    });

    it('should have proper icon size', () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} />);

      const icon = screen.getByTestId('trash-icon');
      expect(icon).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('CompleteButton', () => {
    it('should render with check icon', () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'success');

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
    });

    it('should call onClick when not disabled', async () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should work with different sizes', () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} size="sm" />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });
      expect(button).toHaveAttribute('data-size', 'sm');
    });
  });

  describe('ActivateButton', () => {
    it('should render with check icon and primary variant', () => {
      const onClick = vi.fn();
      render(<ActivateButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Activate' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'primary');

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      const onClick = vi.fn();
      render(<ActivateButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Activate' });
      expect(button).toHaveAttribute('data-loading', 'true');
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<ActivateButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Activate' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should respect disabled state', () => {
      const onClick = vi.fn();
      render(<ActivateButton onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Activate' });
      expect(button).toBeDisabled();
    });
  });

  describe('FailedButton', () => {
    it('should render with X icon and warning variant', () => {
      const onClick = vi.fn();
      render(<FailedButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'XIcon Fail' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'warning');

      expect(screen.getByTestId('x-icon')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      const onClick = vi.fn();
      render(<FailedButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'XIcon Fail' });
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<FailedButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'XIcon Fail' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should work with custom className', () => {
      const onClick = vi.fn();
      render(<FailedButton onClick={onClick} className="fail-button" />);

      const button = screen.getByRole('button', { name: 'XIcon Fail' });
      expect(button).toHaveClass('fail-button');
    });
  });

  describe('DeleteAllButton', () => {
    it('should render with default text when no state specified', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={5} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All (5)' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'danger');
      expect(screen.getByTestId('trash-icon')).toBeInTheDocument();
    });

    it('should render with completed state text', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} state="completed" count={3} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All Completed' });
      expect(button).toBeInTheDocument();
    });

    it('should render with failed state text', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} state="failed" count={2} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All Failed' });
      expect(button).toBeInTheDocument();
    });

    it('should be disabled when count is 0', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={0} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All' });
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={5} disabled={true} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All (5)' });
      expect(button).toBeDisabled();
    });

    it('should show loading state', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={3} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All (3)' });
      expect(button).toHaveAttribute('data-loading', 'true');
    });

    it('should call onClick when clicked and not disabled', async () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={3} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All (3)' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle different sizes', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} count={2} size="sm" />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All (2)' });
      expect(button).toHaveAttribute('data-size', 'sm');
    });

    it('should handle undefined count', () => {
      const onClick = vi.fn();
      render(<DeleteAllButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete All' });
      expect(button).toBeDisabled();
    });
  });

  describe('ReactivateButton', () => {
    it('should render with refresh icon and primary variant', () => {
      const onClick = vi.fn();
      render(<ReactivateButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'RefreshIcon Reactivate' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('data-variant', 'primary');

      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument();
    });

    it('should handle loading state', () => {
      const onClick = vi.fn();
      render(<ReactivateButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'RefreshIcon Reactivate' });
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
    });

    it('should call onClick when clicked', async () => {
      const onClick = vi.fn();
      render(<ReactivateButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'RefreshIcon Reactivate' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should respect disabled state', () => {
      const onClick = vi.fn();
      render(<ReactivateButton onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button', { name: 'RefreshIcon Reactivate' });
      expect(button).toBeDisabled();
    });

    it('should work with custom className', () => {
      const onClick = vi.fn();
      render(<ReactivateButton onClick={onClick} className="reactivate-btn" />);

      const button = screen.getByRole('button', { name: 'RefreshIcon Reactivate' });
      expect(button).toHaveClass('reactivate-btn');
    });
  });

  describe('AddTaskButton', () => {
    it('should render as button type by default', () => {
      render(<AddTaskButton />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-variant', 'primary');

      expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('should render as submit type when specified', () => {
      render(<AddTaskButton type="submit" />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('should call onClick when provided and clicked', async () => {
      const onClick = vi.fn();
      render(<AddTaskButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should handle loading state', () => {
      render(<AddTaskButton isLoading={true} />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toHaveAttribute('data-loading', 'true');
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<AddTaskButton disabled={true} />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toBeDisabled();
    });

    it('should work with different sizes', () => {
      render(<AddTaskButton size="lg" />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toHaveAttribute('data-size', 'lg');
    });

    it('should apply custom className', () => {
      render(<AddTaskButton className="add-task-custom" />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });
      expect(button).toHaveClass('add-task-custom');
    });

    it('should work without onClick handler', async () => {
      render(<AddTaskButton />);

      const button = screen.getByRole('button', { name: 'PlusIcon Add Task' });

      // Should not throw error when clicked without onClick
      await user.click(button);
      // No assertions needed - just ensuring no error is thrown
    });
  });

  describe('Icon Integration', () => {
    it('should render icons with correct size', () => {
      const onClick = vi.fn();
      render(
        <>
          <DeleteButton onClick={onClick} />
          <CompleteButton onClick={onClick} />
          <ActivateButton onClick={onClick} />
          <FailedButton onClick={onClick} />
          <ReactivateButton onClick={onClick} />
          <AddTaskButton onClick={onClick} />
        </>
      );

      const icons = [
        screen.getByTestId('trash-icon'),
        ...screen.getAllByTestId('check-icon'),
        screen.getByTestId('x-icon'),
        screen.getByTestId('refresh-icon'),
        screen.getByTestId('plus-icon'),
      ];

      icons.forEach(icon => {
        expect(icon).toHaveAttribute('data-size', 'sm');
      });
    });

    it('should render icons as left icons', () => {
      const onClick = vi.fn();
      render(
        <>
          <DeleteButton onClick={onClick} />
          <CompleteButton onClick={onClick} />
          <ActivateButton onClick={onClick} />
          <FailedButton onClick={onClick} />
          <ReactivateButton onClick={onClick} />
          <AddTaskButton onClick={onClick} />
        </>
      );

      const leftIcons = screen.getAllByTestId('left-icon');
      expect(leftIcons).toHaveLength(6);
    });
  });

  describe('Event Handling Edge Cases', () => {
    it('should handle rapid successive clicks', async () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });

      // Click rapidly multiple times
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(onClick).toHaveBeenCalledTimes(3);
    });

    it('should prevent clicks when disabled', async () => {
      const onClick = vi.fn();
      render(<DeleteButton onClick={onClick} disabled={true} />);

      const button = screen.getByRole('button', { name: 'TrashIcon Delete' });
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should prevent clicks when loading', async () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} isLoading={true} />);

      const button = screen.getByRole('button', { name: 'Save' });
      await user.click(button);

      expect(onClick).not.toHaveBeenCalled();
    });

    it('should handle focus events', async () => {
      const onClick = vi.fn();
      render(<ActivateButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Activate' });
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should handle tab navigation', async () => {
      const onClick = vi.fn();
      render(
        <div>
          <CancelButton onClick={onClick} />
          <SaveButton onClick={onClick} />
          <DeleteButton onClick={onClick} />
        </div>
      );

      // Tab through buttons
      await user.tab();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: 'TrashIcon Delete' })).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      const onClick = vi.fn();
      render(
        <>
          <CancelButton onClick={onClick} />
          <SaveButton onClick={onClick} />
          <DeleteButton onClick={onClick} />
          <CompleteButton onClick={onClick} />
          <ActivateButton onClick={onClick} />
          <FailedButton onClick={onClick} />
          <DeleteAllButton onClick={onClick} count={5} />
          <ReactivateButton onClick={onClick} />
          <AddTaskButton />
        </>
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(9);

      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type');
      });
    });

    it('should have descriptive button text', () => {
      const onClick = vi.fn();
      render(
        <>
          <CancelButton onClick={onClick} />
          <SaveButton onClick={onClick} />
          <DeleteButton onClick={onClick} />
          <CompleteButton onClick={onClick} />
          <ActivateButton onClick={onClick} />
          <FailedButton onClick={onClick} />
          <DeleteAllButton onClick={onClick} state="completed" count={3} />
          <ReactivateButton onClick={onClick} />
          <AddTaskButton />
        </>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'TrashIcon Delete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CheckIcon Complete' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'CheckIcon Activate' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'XIcon Fail' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'TrashIcon Delete All Completed' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'RefreshIcon Reactivate' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'PlusIcon Add Task' })).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const onClick = vi.fn();
      render(<CompleteButton onClick={onClick} />);

      const button = screen.getByRole('button', { name: 'CheckIcon Complete' });

      // Test Space key
      button.focus();
      await user.keyboard(' ');
      expect(onClick).toHaveBeenCalledTimes(1);

      // Test Enter key
      onClick.mockClear();
      button.focus();
      await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply variant-specific styling', () => {
      const onClick = vi.fn();
      render(
        <>
          <CancelButton onClick={onClick} />
          <SaveButton onClick={onClick} />
          <DeleteButton onClick={onClick} />
          <CompleteButton onClick={onClick} />
          <ActivateButton onClick={onClick} />
          <FailedButton onClick={onClick} />
        </>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-variant', 'secondary');
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-variant', 'primary');
      expect(screen.getByRole('button', { name: 'TrashIcon Delete' })).toHaveAttribute('data-variant', 'danger');
      expect(screen.getByRole('button', { name: 'CheckIcon Complete' })).toHaveAttribute('data-variant', 'success');
      expect(screen.getByRole('button', { name: 'CheckIcon Activate' })).toHaveAttribute('data-variant', 'primary');
      expect(screen.getByRole('button', { name: 'XIcon Fail' })).toHaveAttribute('data-variant', 'warning');
    });

    it('should apply size-specific styling', () => {
      const onClick = vi.fn();
      render(
        <>
          <CancelButton onClick={onClick} size="sm" />
          <SaveButton onClick={onClick} size="md" />
          <DeleteButton onClick={onClick} size="lg" />
        </>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-size', 'sm');
      expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('data-size', 'md');
      expect(screen.getByRole('button', { name: 'TrashIcon Delete' })).toHaveAttribute('data-size', 'lg');
    });

    it('should combine custom className with default styling', () => {
      const onClick = vi.fn();
      render(<SaveButton onClick={onClick} className="my-custom-class another-class" />);

      const button = screen.getByRole('button', { name: 'Save' });
      expect(button).toHaveClass('my-custom-class', 'another-class');
    });
  });
});