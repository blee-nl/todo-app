import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TaskListFeature from '../TaskListFeature';
import { TaskState, TaskType } from '../../../../constants/taskConstants';
import type { Task } from '../../../../domain/entities/Task';

// Mock the useTaskService hook
const mockTaskService = {
  tasks: [] as Task[],
  deleteCompletedTasks: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
  deleteFailedTasks: {
    mutateAsync: vi.fn(),
    isPending: false,
  },
};

vi.mock('../../hooks/useTaskService', () => ({
  useTaskService: () => mockTaskService,
}));

// Mock the design system components
vi.mock('../../../../design-system', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>
      {children}
    </label>
  ),
}));

// Mock the icons
vi.mock('../../../../assets/icons', () => ({
  TaskIcon: ({ size, className }: any) => (
    <div data-testid="task-icon" data-size={size} className={className}>
      TaskIcon
    </div>
  ),
  SuccessIcon: ({ size, className }: any) => (
    <div data-testid="success-icon" data-size={size} className={className}>
      SuccessIcon
    </div>
  ),
  ErrorIcon: ({ size, className }: any) => (
    <div data-testid="error-icon" data-size={size} className={className}>
      ErrorIcon
    </div>
  ),
}));

// Mock the task item components
vi.mock('../../../../components/PendingTodoItem', () => ({
  default: ({ todo, onError }: any) => (
    <div data-testid={`pending-task-${todo.id}`}>
      Pending: {todo.text}
      <button
        data-testid={`pending-error-${todo.id}`}
        onClick={() => onError?.(new Error('Pending task error'))}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

vi.mock('../../../../components/ActiveTodoItem', () => ({
  default: ({ todo, onError }: any) => (
    <div data-testid={`active-task-${todo.id}`}>
      Active: {todo.text}
      <button
        data-testid={`active-error-${todo.id}`}
        onClick={() => onError?.(new Error('Active task error'))}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

vi.mock('../../../../components/CompletedTodoItem', () => ({
  default: ({ todo, onError }: any) => (
    <div data-testid={`completed-task-${todo.id}`}>
      Completed: {todo.text}
      <button
        data-testid={`completed-error-${todo.id}`}
        onClick={() => onError?.(new Error('Completed task error'))}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

vi.mock('../../../../components/FailedTodoItem', () => ({
  default: ({ todo, onError }: any) => (
    <div data-testid={`failed-task-${todo.id}`}>
      Failed: {todo.text}
      <button
        data-testid={`failed-error-${todo.id}`}
        onClick={() => onError?.(new Error('Failed task error'))}
      >
        Trigger Error
      </button>
    </div>
  ),
}));

// Mock the DeleteAllButton component
vi.mock('../../../../components/TaskActionButtons', () => ({
  DeleteAllButton: ({ onClick, disabled, isLoading, count, state, ...props }: any) => (
    <button
      data-testid="delete-all-button"
      onClick={onClick}
      disabled={disabled}
      data-loading={isLoading}
      data-count={count}
      data-state={state}
      {...props}
    >
      Delete All {state === 'completed' ? 'Completed' : state === 'failed' ? 'Failed' : ''} ({count})
    </button>
  ),
}));

describe('TaskListFeature', () => {
  const mockOnError = vi.fn();

  const createMockTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'task-1',
    text: 'Test task',
    type: TaskType.ONE_TIME,
    state: TaskState.PENDING,
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    dueAt: '2024-01-16T12:00:00Z',
    ...overrides,
  });

  const defaultProps = {
    state: TaskState.PENDING,
    onError: mockOnError,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskService.tasks = [];
    mockTaskService.deleteCompletedTasks.isPending = false;
    mockTaskService.deleteFailedTasks.isPending = false;
  });

  describe('Empty State Rendering', () => {
    it('renders empty state for pending tasks', () => {
      mockTaskService.tasks = [];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByTestId('task-icon')).toBeInTheDocument();
      expect(screen.getByText('No pending tasks')).toBeInTheDocument();
      expect(screen.getByText('Create a new task to get started')).toBeInTheDocument();
    });

    it('renders empty state for active tasks', () => {
      mockTaskService.tasks = [];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      expect(screen.getByTestId('task-icon')).toBeInTheDocument();
      expect(screen.getByText('No active tasks')).toBeInTheDocument();
      expect(screen.getByText('Activate a pending task to begin working')).toBeInTheDocument();
    });

    it('renders empty state for completed tasks', () => {
      mockTaskService.tasks = [];

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
      expect(screen.getByText('No completed tasks')).toBeInTheDocument();
      expect(screen.getByText('Complete some tasks to see them here')).toBeInTheDocument();
    });

    it('renders empty state for failed tasks', () => {
      mockTaskService.tasks = [];

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByText('No failed tasks')).toBeInTheDocument();
      expect(screen.getByText('Tasks that weren\'t completed will appear here')).toBeInTheDocument();
    });

    it('renders empty state even when there are tasks of different states', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByText('No pending tasks')).toBeInTheDocument();
      expect(screen.queryByTestId('active-task-active-1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('completed-task-completed-1')).not.toBeInTheDocument();
    });
  });

  describe('Task Filtering and Rendering', () => {
    it('filters and renders only tasks of the specified state', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', text: 'Pending task', state: TaskState.PENDING }),
        createMockTask({ id: 'active-1', text: 'Active task', state: TaskState.ACTIVE }),
        createMockTask({ id: 'pending-2', text: 'Another pending', state: TaskState.PENDING }),
      ];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByTestId('pending-task-pending-1')).toBeInTheDocument();
      expect(screen.getByTestId('pending-task-pending-2')).toBeInTheDocument();
      expect(screen.queryByTestId('active-task-active-1')).not.toBeInTheDocument();

      expect(screen.getByText('Pending: Pending task')).toBeInTheDocument();
      expect(screen.getByText('Pending: Another pending')).toBeInTheDocument();
    });

    it('renders active tasks correctly', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'active-1', text: 'Active task', state: TaskState.ACTIVE }),
        createMockTask({ id: 'pending-1', text: 'Pending task', state: TaskState.PENDING }),
      ];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      expect(screen.getByTestId('active-task-active-1')).toBeInTheDocument();
      expect(screen.queryByTestId('pending-task-pending-1')).not.toBeInTheDocument();
      expect(screen.getByText('Active: Active task')).toBeInTheDocument();
    });

    it('renders completed tasks correctly', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', text: 'Completed task', state: TaskState.COMPLETED }),
      ];

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      expect(screen.getByTestId('completed-task-completed-1')).toBeInTheDocument();
      expect(screen.getByText('Completed: Completed task')).toBeInTheDocument();
    });

    it('renders failed tasks correctly', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', text: 'Failed task', state: TaskState.FAILED }),
      ];

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      expect(screen.getByTestId('failed-task-failed-1')).toBeInTheDocument();
      expect(screen.getByText('Failed: Failed task')).toBeInTheDocument();
    });

    it('handles tasks with all required properties', () => {
      const fullTask = createMockTask({
        id: 'full-task',
        text: 'Full task',
        state: TaskState.ACTIVE,
        activatedAt: '2024-01-15T13:00:00Z',
        completedAt: '2024-01-15T14:00:00Z',
        failedAt: '2024-01-15T15:00:00Z',
        isReactivation: true,
      });

      mockTaskService.tasks = [fullTask];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      expect(screen.getByTestId('active-task-full-task')).toBeInTheDocument();
    });
  });

  describe('Delete All Button', () => {
    it('shows delete all button for completed tasks', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
        createMockTask({ id: 'completed-2', state: TaskState.COMPLETED }),
      ];

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('Delete All Completed (2)');
      expect(deleteButton).toHaveAttribute('data-state', 'completed');
      expect(deleteButton).toHaveAttribute('data-count', '2');
    });

    it('shows delete all button for failed tasks', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      expect(deleteButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('Delete All Failed (1)');
      expect(deleteButton).toHaveAttribute('data-state', 'failed');
    });

    it('does not show delete all button for pending tasks', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', state: TaskState.PENDING }),
      ];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.queryByTestId('delete-all-button')).not.toBeInTheDocument();
    });

    it('does not show delete all button for active tasks', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
      ];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      expect(screen.queryByTestId('delete-all-button')).not.toBeInTheDocument();
    });

    it('disables delete all button when delete operation is pending', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];
      mockTaskService.deleteCompletedTasks.isPending = true;

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      expect(deleteButton).toBeDisabled();
      expect(deleteButton).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Delete All Completed Tasks', () => {
    it('handles successful delete all completed tasks', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];
      mockTaskService.deleteCompletedTasks.mutateAsync.mockResolvedValue({ success: true });

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockTaskService.deleteCompletedTasks.mutateAsync).toHaveBeenCalledTimes(1);
      });

      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('handles delete all completed tasks with service error result', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];
      mockTaskService.deleteCompletedTasks.mutateAsync.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(new Error('Delete failed'));
      });
    });

    it('handles delete all completed tasks with thrown error', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];
      const thrownError = new Error('Network error');
      mockTaskService.deleteCompletedTasks.mutateAsync.mockRejectedValue(thrownError);

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(thrownError);
      });
    });
  });

  describe('Delete All Failed Tasks', () => {
    it('handles successful delete all failed tasks', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];
      mockTaskService.deleteFailedTasks.mutateAsync.mockResolvedValue({ success: true });

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockTaskService.deleteFailedTasks.mutateAsync).toHaveBeenCalledTimes(1);
      });

      expect(mockOnError).not.toHaveBeenCalled();
    });

    it('handles delete all failed tasks with service error result', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];
      mockTaskService.deleteFailedTasks.mutateAsync.mockResolvedValue({
        success: false,
        error: 'Delete failed',
      });

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(new Error('Delete failed'));
      });
    });

    it('handles delete all failed tasks with thrown error', async () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];
      const thrownError = new Error('Network error');
      mockTaskService.deleteFailedTasks.mutateAsync.mockRejectedValue(thrownError);

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      const deleteButton = screen.getByTestId('delete-all-button');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(thrownError);
      });
    });
  });

  describe('Error Handling from Task Items', () => {
    it('forwards errors from pending task items', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', state: TaskState.PENDING }),
      ];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      const errorButton = screen.getByTestId('pending-error-pending-1');
      fireEvent.click(errorButton);

      expect(mockOnError).toHaveBeenCalledWith(new Error('Pending task error'));
    });

    it('forwards errors from active task items', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'active-1', state: TaskState.ACTIVE }),
      ];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      const errorButton = screen.getByTestId('active-error-active-1');
      fireEvent.click(errorButton);

      expect(mockOnError).toHaveBeenCalledWith(new Error('Active task error'));
    });

    it('forwards errors from completed task items', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'completed-1', state: TaskState.COMPLETED }),
      ];

      render(<TaskListFeature state={TaskState.COMPLETED} onError={mockOnError} />);

      const errorButton = screen.getByTestId('completed-error-completed-1');
      fireEvent.click(errorButton);

      expect(mockOnError).toHaveBeenCalledWith(new Error('Completed task error'));
    });

    it('forwards errors from failed task items', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'failed-1', state: TaskState.FAILED }),
      ];

      render(<TaskListFeature state={TaskState.FAILED} onError={mockOnError} />);

      const errorButton = screen.getByTestId('failed-error-failed-1');
      fireEvent.click(errorButton);

      expect(mockOnError).toHaveBeenCalledWith(new Error('Failed task error'));
    });

    it('handles errors gracefully without onError callback', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'pending-1', state: TaskState.PENDING }),
      ];

      render(<TaskListFeature state={TaskState.PENDING} />);

      const errorButton = screen.getByTestId('pending-error-pending-1');

      expect(() => {
        fireEvent.click(errorButton);
      }).not.toThrow();
    });
  });

  describe('Task to Todo Conversion', () => {
    it('converts Task properties to Todo format correctly', () => {
      const task = createMockTask({
        id: 'conversion-test',
        text: 'Conversion test task',
        type: TaskType.DAILY,
        state: TaskState.ACTIVE,
        dueAt: '2024-01-16T12:00:00Z',
        createdAt: '2024-01-15T12:00:00Z',
        activatedAt: '2024-01-15T13:00:00Z',
        completedAt: '2024-01-15T14:00:00Z',
        failedAt: '2024-01-15T15:00:00Z',
        updatedAt: '2024-01-15T16:00:00Z',
        isReactivation: true,
      });

      mockTaskService.tasks = [task];

      render(<TaskListFeature state={TaskState.ACTIVE} onError={mockOnError} />);

      // Verify the task is rendered (indicating successful conversion)
      expect(screen.getByTestId('active-task-conversion-test')).toBeInTheDocument();
      expect(screen.getByText('Active: Conversion test task')).toBeInTheDocument();
    });

    it('handles tasks with minimal properties', () => {
      const minimalTask = createMockTask({
        id: 'minimal-task',
        text: 'Minimal task',
        state: TaskState.PENDING,
        // Most optional properties undefined
        dueAt: undefined,
        activatedAt: undefined,
        completedAt: undefined,
        failedAt: undefined,
        isReactivation: undefined,
      });

      mockTaskService.tasks = [minimalTask];

      render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByTestId('pending-task-minimal-task')).toBeInTheDocument();
    });
  });

  describe('Component Structure and Styling', () => {
    it('renders with correct structure when tasks are present', () => {
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1', state: TaskState.PENDING }),
      ];

      const { container } = render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex-1');

      const content = wrapper.firstChild as HTMLElement;
      expect(content).toHaveClass('p-6', 'max-w-4xl', 'mx-auto');

      const taskList = content.querySelector('.space-y-3');
      expect(taskList).toBeInTheDocument();
    });

    it('renders with correct empty state structure', () => {
      mockTaskService.tasks = [];

      const { container } = render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('flex-1', 'flex', 'items-center', 'justify-center', 'p-8');

      const content = wrapper.firstChild as HTMLElement;
      expect(content).toHaveClass('text-center');
    });

    it('handles unknown task states gracefully', () => {
      const unknownTask = createMockTask({
        id: 'unknown-task',
        state: 'unknown' as any,
      });

      mockTaskService.tasks = [unknownTask];

      expect(() => {
        render(<TaskListFeature state="unknown" onError={mockOnError} />);
      }).not.toThrow();
    });
  });

  describe('Performance and Updates', () => {
    it('updates rendered tasks when task list changes', () => {
      // Initial render with one task
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1', state: TaskState.PENDING }),
      ];

      const { rerender } = render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByTestId('pending-task-task-1')).toBeInTheDocument();

      // Update with additional task
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1', state: TaskState.PENDING }),
        createMockTask({ id: 'task-2', state: TaskState.PENDING }),
      ];

      rerender(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByTestId('pending-task-task-1')).toBeInTheDocument();
      expect(screen.getByTestId('pending-task-task-2')).toBeInTheDocument();
    });

    it('switches between empty state and task list correctly', () => {
      // Start with empty state
      mockTaskService.tasks = [];

      const { rerender } = render(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.getByText('No pending tasks')).toBeInTheDocument();

      // Add tasks
      mockTaskService.tasks = [
        createMockTask({ id: 'task-1', state: TaskState.PENDING }),
      ];

      rerender(<TaskListFeature state={TaskState.PENDING} onError={mockOnError} />);

      expect(screen.queryByText('No pending tasks')).not.toBeInTheDocument();
      expect(screen.getByTestId('pending-task-task-1')).toBeInTheDocument();
    });
  });
});