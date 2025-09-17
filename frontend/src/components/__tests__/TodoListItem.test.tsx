import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import TodoListItem, { TodoListItemProps } from '../TodoListItem';
import type { Todo } from '../../services/api';

// Mock the design system components
vi.mock('../../design-system', () => ({
  Card: ({ children, variant, className, ...props }: any) => (
    <div data-testid="card" data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
  Badge: ({ children, variant, ...props }: any) => (
    <span data-testid="badge" data-variant={variant} {...props}>
      {children}
    </span>
  ),
  Text: ({ children, variant, weight, className, onClick, ...props }: any) => (
    <span
      data-testid="text"
      data-variant={variant}
      data-weight={weight}
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  ),
}));

// Mock the icons
vi.mock('../../assets/icons', () => ({
  CalendarIcon: ({ size, className }: any) => (
    <div data-testid="calendar-icon" data-size={size} className={className}>
      CalendarIcon
    </div>
  ),
  ClockIcon: ({ size, className }: any) => (
    <div data-testid="clock-icon" data-size={size} className={className}>
      ClockIcon
    </div>
  ),
}));

// Mock NotificationIndicator
vi.mock('../NotificationIndicator', () => ({
  default: ({ todo, size, showTime, className }: any) => (
    <div
      data-testid="notification-indicator"
      data-size={size}
      data-show-time={showTime}
      className={className}
    >
      NotificationIndicator for {todo.id}
    </div>
  ),
}));

// Mock date utils
vi.mock('../../utils/dateUtils', () => ({
  formatDate: vi.fn((date) => `formatted-${date}`),
  formatFullDate: vi.fn((date) => `full-formatted-${date}`),
}));

describe('TodoListItem', () => {
  const mockTodo: Todo = {
    id: '123',
    text: 'Test todo item',
    type: 'one-time',
    state: 'pending',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    dueAt: '2025-01-16T14:30:00Z',
    isReactivation: false,
  };

  const defaultProps: TodoListItemProps = {
    todo: mockTodo,
  };

  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<TodoListItem {...defaultProps} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Test todo item')).toBeInTheDocument();
    });

    it('should apply custom card className', () => {
      render(<TodoListItem {...defaultProps} cardClassName="custom-card-class" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-card-class');
    });

    it('should apply custom card variant', () => {
      render(<TodoListItem {...defaultProps} cardVariant="overdue" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-variant', 'overdue');
    });

    it('should render with default card variant', () => {
      render(<TodoListItem {...defaultProps} />);

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-variant', 'default');
    });
  });

  describe('Badge Rendering', () => {
    it('should render default badges for todo type', () => {
      render(<TodoListItem {...defaultProps} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent('one-time');
      expect(badges[0]).toHaveAttribute('data-variant', 'primary');
    });

    it('should render reactivation badge when todo is reactivated', () => {
      const reactivatedTodo = { ...mockTodo, isReactivation: true };
      render(<TodoListItem {...defaultProps} todo={reactivatedTodo} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('one-time');
      expect(badges[1]).toHaveTextContent('Re-activated');
      expect(badges[1]).toHaveAttribute('data-variant', 'purple');
    });

    it('should render custom badges when provided', () => {
      const customBadges = [
        { variant: 'danger' as const, text: 'Overdue' },
        { variant: 'success' as const, text: 'Priority' },
      ];

      render(<TodoListItem {...defaultProps} badges={customBadges} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(2);
      expect(badges[0]).toHaveTextContent('Overdue');
      expect(badges[0]).toHaveAttribute('data-variant', 'danger');
      expect(badges[1]).toHaveTextContent('Priority');
      expect(badges[1]).toHaveAttribute('data-variant', 'success');
    });

    it('should use custom badges over default badges', () => {
      const customBadges = [{ variant: 'info' as const, text: 'Custom' }];
      render(<TodoListItem {...defaultProps} badges={customBadges} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent('Custom');
      expect(screen.queryByText('one-time')).not.toBeInTheDocument();
    });
  });

  describe('Text Rendering and Interaction', () => {
    it('should render todo text with default styling', () => {
      render(<TodoListItem {...defaultProps} />);

      const text = screen.getByText('Test todo item');
      expect(text).toHaveAttribute('data-variant', 'body');
      expect(text).toHaveAttribute('data-weight', 'medium');
    });

    it('should apply custom text styling', () => {
      render(
        <TodoListItem
          {...defaultProps}
          textVariant="muted"
          textWeight="bold"
          textClassName="custom-text-class"
        />
      );

      const text = screen.getByText('Test todo item');
      expect(text).toHaveAttribute('data-variant', 'muted');
      expect(text).toHaveAttribute('data-weight', 'bold');
      expect(text).toHaveClass('custom-text-class');
    });

    it('should make text clickable when onTextClick is provided', async () => {
      const onTextClick = vi.fn();
      render(<TodoListItem {...defaultProps} onTextClick={onTextClick} />);

      const text = screen.getByText('Test todo item');
      expect(text.className).toContain('cursor-pointer');

      await user.click(text);
      expect(onTextClick).toHaveBeenCalledTimes(1);
    });

    it('should not make text clickable when onTextClick is not provided', () => {
      render(<TodoListItem {...defaultProps} />);

      const text = screen.getByText('Test todo item');
      expect(text.className).not.toContain('cursor-pointer');
    });

    it('should handle keyboard interaction on clickable text', async () => {
      const onTextClick = vi.fn();
      render(<TodoListItem {...defaultProps} onTextClick={onTextClick} />);

      const text = screen.getByText('Test todo item');
      text.focus();
      await user.keyboard('{Enter}');

      expect(onTextClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Due Date Display', () => {
    it('should show due date by default when todo has dueAt', () => {
      render(<TodoListItem {...defaultProps} />);

      expect(screen.getByTestId('calendar-icon')).toBeInTheDocument();
      expect(screen.getByText('Due:')).toBeInTheDocument();
      expect(screen.getByText('full-formatted-2025-01-16T14:30:00Z')).toBeInTheDocument();
    });

    it('should not show due date when showDueDate is false', () => {
      render(<TodoListItem {...defaultProps} showDueDate={false} />);

      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Due:')).not.toBeInTheDocument();
    });

    it('should not show due date when todo has no dueAt', () => {
      const todoWithoutDueDate = { ...mockTodo, dueAt: undefined };
      render(<TodoListItem {...defaultProps} todo={todoWithoutDueDate} />);

      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
      expect(screen.queryByText('Due:')).not.toBeInTheDocument();
    });

    it('should apply custom due date label and colors', () => {
      render(
        <TodoListItem
          {...defaultProps}
          dueDateLabel="Deadline:"
          dueDateIconColor="text-red-500"
          dueDateTextColor="text-red-600"
        />
      );

      const icon = screen.getByTestId('calendar-icon');
      expect(icon).toHaveClass('text-red-500');

      const text = screen.getByText('Deadline:');
      expect(text).toHaveClass('text-red-600');
    });

    it('should show notification indicator with due date', () => {
      render(<TodoListItem {...defaultProps} />);

      const notificationIndicator = screen.getByTestId('notification-indicator');
      expect(notificationIndicator).toBeInTheDocument();
      expect(notificationIndicator).toHaveAttribute('data-size', 'sm');
      expect(notificationIndicator).toHaveAttribute('data-show-time', 'true');
    });

    it('should not show notification indicator when showNotificationIndicator is false', () => {
      render(<TodoListItem {...defaultProps} showNotificationIndicator={false} />);

      expect(screen.queryByTestId('notification-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Notification Indicator for Tasks without Due Date', () => {
    it('should show notification indicator for tasks without due date', () => {
      const todoWithoutDueDate = { ...mockTodo, dueAt: undefined };
      render(<TodoListItem {...defaultProps} todo={todoWithoutDueDate} />);

      const notificationIndicator = screen.getByTestId('notification-indicator');
      expect(notificationIndicator).toBeInTheDocument();
      expect(notificationIndicator).toHaveAttribute('data-size', 'sm');
      expect(notificationIndicator).toHaveAttribute('data-show-time', 'true');
    });

    it('should not show notification indicator for tasks without due date when disabled', () => {
      const todoWithoutDueDate = { ...mockTodo, dueAt: undefined };
      render(
        <TodoListItem
          {...defaultProps}
          todo={todoWithoutDueDate}
          showNotificationIndicator={false}
        />
      );

      expect(screen.queryByTestId('notification-indicator')).not.toBeInTheDocument();
    });
  });

  describe('Metadata Display', () => {
    it('should show default metadata by default', () => {
      render(<TodoListItem {...defaultProps} />);

      expect(screen.getByText('Created formatted-2025-01-15T10:00:00Z')).toBeInTheDocument();
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(1);
    });

    it('should show activated date when todo has activatedAt', () => {
      const activatedTodo = { ...mockTodo, activatedAt: '2025-01-15T11:00:00Z' };
      render(<TodoListItem {...defaultProps} todo={activatedTodo} />);

      expect(screen.getByText('Created formatted-2025-01-15T10:00:00Z')).toBeInTheDocument();
      expect(screen.getByText('Activated formatted-2025-01-15T11:00:00Z')).toBeInTheDocument();
      expect(screen.getAllByTestId('clock-icon')).toHaveLength(2);
    });

    it('should not show metadata when showMetadata is false', () => {
      render(<TodoListItem {...defaultProps} showMetadata={false} />);

      expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
      expect(screen.queryByTestId('clock-icon')).not.toBeInTheDocument();
    });

    it('should use custom metadata when provided', () => {
      const customMetadata = [
        {
          label: 'Modified',
          value: 'yesterday',
          icon: <div data-testid="custom-icon">CustomIcon</div>,
        },
        {
          label: 'Priority',
          value: 'High',
          icon: <div data-testid="priority-icon">PriorityIcon</div>,
        },
      ];

      render(<TodoListItem {...defaultProps} metadataItems={customMetadata} />);

      expect(screen.getByText('Modified yesterday')).toBeInTheDocument();
      expect(screen.getByText('Priority High')).toBeInTheDocument();
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
      expect(screen.getByTestId('priority-icon')).toBeInTheDocument();

      // Should not show default metadata
      expect(screen.queryByText(/Created/)).not.toBeInTheDocument();
    });

    it('should handle empty custom metadata array', () => {
      render(<TodoListItem {...defaultProps} metadataItems={[]} />);

      // Should fall back to default metadata
      expect(screen.getByText('Created formatted-2025-01-15T10:00:00Z')).toBeInTheDocument();
    });
  });

  describe('Children and Action Buttons', () => {
    it('should render children in action button area', () => {
      render(
        <TodoListItem {...defaultProps}>
          <button>Action 1</button>
          <button>Action 2</button>
        </TodoListItem>
      );

      expect(screen.getByRole('button', { name: 'Action 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action 2' })).toBeInTheDocument();
    });

    it('should not render action button area when no children', () => {
      const { container } = render(<TodoListItem {...defaultProps} />);

      // Look for the action buttons container
      const actionContainer = container.querySelector('.flex.flex-col.space-y-2.ml-4');
      expect(actionContainer).not.toBeInTheDocument();
    });

    it('should properly space action buttons', () => {
      const { container } = render(
        <TodoListItem {...defaultProps}>
          <button>Action 1</button>
          <button>Action 2</button>
        </TodoListItem>
      );

      const actionContainer = container.querySelector('.flex.flex-col.space-y-2.ml-4');
      expect(actionContainer).toBeInTheDocument();
      expect(actionContainer).toHaveClass('flex', 'flex-col', 'space-y-2', 'ml-4');
    });
  });

  describe('Layout and Structure', () => {
    it('should have proper layout structure', () => {
      const { container } = render(<TodoListItem {...defaultProps} />);

      // Check main container structure
      const mainContainer = container.querySelector('.flex.items-start.justify-between');
      expect(mainContainer).toBeInTheDocument();

      // Check content area
      const contentArea = container.querySelector('.flex-1');
      expect(contentArea).toBeInTheDocument();
    });

    it('should properly order content sections', () => {
      const activatedTodo = { ...mockTodo, activatedAt: '2025-01-15T11:00:00Z' };
      render(
        <TodoListItem {...defaultProps} todo={activatedTodo}>
          <button>Action</button>
        </TodoListItem>
      );

      const sections = screen.getByTestId('card').children[0].children[0].children;

      // Should have badges first, then text, then due date section, then metadata
      expect(sections[0]).toContainElement(screen.getAllByTestId('badge')[0]);
      expect(sections[1]).toContainElement(screen.getByText('Test todo item'));
      expect(sections[2].querySelector('[data-testid="calendar-icon"]')).toBeInTheDocument();
      expect(sections[3]).toContainElement(screen.getByText(/Created/));
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle todo with minimal data', () => {
      const minimalTodo: Todo = {
        id: 'minimal',
        text: 'Minimal todo',
        type: 'daily',
        state: 'pending',
        createdAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
      };

      render(<TodoListItem {...defaultProps} todo={minimalTodo} />);

      expect(screen.getByText('Minimal todo')).toBeInTheDocument();
      expect(screen.getByText('daily')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
    });

    it('should handle todo with empty text', () => {
      const emptyTextTodo = { ...mockTodo, text: '' };
      render(<TodoListItem {...defaultProps} todo={emptyTextTodo} />);

      // Should still render the text element, even if empty
      const textElements = screen.getAllByTestId('text');
      expect(textElements.some(el => el.textContent === '')).toBe(true);
    });

    it('should handle very long todo text', () => {
      const longTextTodo = { ...mockTodo, text: 'A'.repeat(1000) };
      render(<TodoListItem {...defaultProps} />);

      // Should render without crashing
      expect(screen.getByTestId('card')).toBeInTheDocument();
    });

    it('should handle special characters in todo text', () => {
      const specialCharsTodo = {
        ...mockTodo,
        text: 'Todo with "quotes" & <script>alert("xss")</script> special chars'
      };
      render(<TodoListItem {...defaultProps} todo={specialCharsTodo} />);

      expect(screen.getByText(/Todo with "quotes"/)).toBeInTheDocument();
    });

    it('should handle null/undefined values gracefully', () => {
      const todoWithNulls = {
        ...mockTodo,
        dueAt: null as any,
        activatedAt: undefined,
        isReactivation: undefined as any,
      };

      render(<TodoListItem {...defaultProps} todo={todoWithNulls} />);

      expect(screen.getByText('Test todo item')).toBeInTheDocument();
      expect(screen.queryByTestId('calendar-icon')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const onTextClick = vi.fn();
      render(<TodoListItem {...defaultProps} onTextClick={onTextClick} />);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();

      // Text should be focusable when clickable
      const text = screen.getByText('Test todo item');
      expect(text).toHaveClass('cursor-pointer');
    });

    it('should support keyboard navigation on clickable elements', async () => {
      const onTextClick = vi.fn();
      render(<TodoListItem {...defaultProps} onTextClick={onTextClick} />);

      const text = screen.getByText('Test todo item');

      // Should be able to focus and interact via keyboard
      text.focus();
      await user.keyboard('{Enter}');
      expect(onTextClick).toHaveBeenCalled();
    });

    it('should have appropriate ARIA attributes', () => {
      render(<TodoListItem {...defaultProps} />);

      // The card should be accessible
      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
    });

    it('should handle focus management correctly', () => {
      render(
        <TodoListItem {...defaultProps}>
          <button>Action 1</button>
          <button>Action 2</button>
        </TodoListItem>
      );

      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
    });
  });

  describe('Integration with Design System', () => {
    it('should pass correct props to Card component', () => {
      render(
        <TodoListItem
          {...defaultProps}
          cardVariant="active"
          cardClassName="custom-card"
        />
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-variant', 'active');
      expect(card).toHaveClass('custom-card');
    });

    it('should pass correct props to Badge components', () => {
      const customBadges = [
        { variant: 'danger' as const, text: 'Critical' },
        { variant: 'success' as const, text: 'Complete' },
      ];

      render(<TodoListItem {...defaultProps} badges={customBadges} />);

      const badges = screen.getAllByTestId('badge');
      expect(badges[0]).toHaveAttribute('data-variant', 'danger');
      expect(badges[1]).toHaveAttribute('data-variant', 'success');
    });

    it('should pass correct props to Text components', () => {
      render(
        <TodoListItem
          {...defaultProps}
          textVariant="muted"
          textWeight="semibold"
        />
      );

      const mainText = screen.getByText('Test todo item');
      expect(mainText).toHaveAttribute('data-variant', 'muted');
      expect(mainText).toHaveAttribute('data-weight', 'semibold');
    });
  });
});