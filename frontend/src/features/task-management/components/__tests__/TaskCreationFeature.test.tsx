import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskCreationFeature } from '../TaskCreationFeature';
import { TaskType as TaskTypeConstants } from '../../../../constants/taskConstants';

// Mock the TaskModal component
const mockTaskModal = vi.fn();
vi.mock('../../../../components/TaskModal', () => ({
  default: (props: any) => {
    mockTaskModal(props);
    return props.isOpen ? (
      <div data-testid="task-modal">
        <div>Modal Content</div>
        <button
          data-testid="modal-close"
          onClick={props.onClose}
        >
          Close Modal
        </button>
        <button
          data-testid="modal-create-task"
          onClick={() => {
            // Simulate successful task creation
            props.onTaskCreated?.();
          }}
        >
          Create Task
        </button>
        <button
          data-testid="modal-trigger-error"
          onClick={() => {
            // Simulate error during task creation
            props.onError?.(new Error('Task creation failed'));
          }}
        >
          Trigger Error
        </button>
        <div data-testid="modal-task-type">{props.taskType}</div>
        <button
          data-testid="modal-change-task-type"
          onClick={() => {
            // Simulate changing task type
            props.setTaskType(
              props.taskType === TaskTypeConstants.ONE_TIME
                ? TaskTypeConstants.DAILY
                : TaskTypeConstants.ONE_TIME
            );
          }}
        >
          Change Task Type
        </button>
      </div>
    ) : null;
  },
}));

describe('TaskCreationFeature', () => {
  const mockOnError = vi.fn();
  const mockOnTaskCreated = vi.fn();

  const defaultProps = {
    onError: mockOnError,
    onTaskCreated: mockOnTaskCreated,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders the add task button', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toHaveClass(
        'w-full', 'p-4', 'text-left', 'text-gray-500', 'bg-white',
        'rounded-lg', 'border-2', 'border-dashed', 'border-gray-300'
      );
    });

    it('does not render the modal initially', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });

    it('renders without optional props', () => {
      expect(() => {
        render(<TaskCreationFeature />);
      }).not.toThrow();

      expect(screen.getByText('+ Add new task')).toBeInTheDocument();
    });
  });

  describe('Modal Opening and Closing', () => {
    it('opens modal when add task button is clicked', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);

      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();

      // Close modal
      const closeButton = screen.getByTestId('modal-close');
      fireEvent.click(closeButton);

      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });

    it('passes correct props to TaskModal when opened', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);

      expect(mockTaskModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
          taskType: TaskTypeConstants.ONE_TIME,
          setTaskType: expect.any(Function),
          onError: mockOnError,
          onTaskCreated: expect.any(Function),
        })
      );
    });

    it('modal starts with ONE_TIME task type as default', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);

      const taskTypeDisplay = screen.getByTestId('modal-task-type');
      expect(taskTypeDisplay).toHaveTextContent(TaskTypeConstants.ONE_TIME);
    });
  });

  describe('Task Type Management', () => {
    it('allows changing task type through modal', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);

      // Check initial task type
      let taskTypeDisplay = screen.getByTestId('modal-task-type');
      expect(taskTypeDisplay).toHaveTextContent(TaskTypeConstants.ONE_TIME);

      // Change task type
      const changeTypeButton = screen.getByTestId('modal-change-task-type');
      fireEvent.click(changeTypeButton);

      // Check updated task type
      taskTypeDisplay = screen.getByTestId('modal-task-type');
      expect(taskTypeDisplay).toHaveTextContent(TaskTypeConstants.DAILY);
    });

    it('maintains task type across modal open/close cycles', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal and change task type
      fireEvent.click(screen.getByText('+ Add new task'));
      fireEvent.click(screen.getByTestId('modal-change-task-type'));

      // Verify it changed to DAILY
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.DAILY);

      // Close and reopen modal
      fireEvent.click(screen.getByTestId('modal-close'));
      fireEvent.click(screen.getByText('+ Add new task'));

      // Task type should still be DAILY
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.DAILY);
    });
  });

  describe('Task Creation Success', () => {
    it('handles successful task creation', async () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      const addButton = screen.getByText('+ Add new task');
      fireEvent.click(addButton);
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();

      // Trigger successful task creation
      const createTaskButton = screen.getByTestId('modal-create-task');
      fireEvent.click(createTaskButton);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });

      // onTaskCreated callback should be called
      expect(mockOnTaskCreated).toHaveBeenCalledTimes(1);
    });

    it('handles successful task creation without onTaskCreated callback', async () => {
      render(<TaskCreationFeature onError={mockOnError} />);

      // Open modal and create task
      fireEvent.click(screen.getByText('+ Add new task'));
      fireEvent.click(screen.getByTestId('modal-create-task'));

      // Should not throw error and modal should close
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });
    });

    it('closes modal after successful task creation', async () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByText('+ Add new task'));
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();

      // Create task successfully
      fireEvent.click(screen.getByTestId('modal-create-task'));

      // Modal should be closed
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('forwards errors from TaskModal to onError callback', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByText('+ Add new task'));

      // Trigger error
      const triggerErrorButton = screen.getByTestId('modal-trigger-error');
      fireEvent.click(triggerErrorButton);

      // Error callback should be called
      expect(mockOnError).toHaveBeenCalledTimes(1);
      expect(mockOnError).toHaveBeenCalledWith(new Error('Task creation failed'));
    });

    it('handles errors gracefully without onError callback', () => {
      render(<TaskCreationFeature />);

      // Open modal and trigger error - should not throw
      fireEvent.click(screen.getByText('+ Add new task'));

      expect(() => {
        fireEvent.click(screen.getByTestId('modal-trigger-error'));
      }).not.toThrow();
    });

    it('keeps modal open when error occurs', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal
      fireEvent.click(screen.getByText('+ Add new task'));
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();

      // Trigger error
      fireEvent.click(screen.getByTestId('modal-trigger-error'));

      // Modal should still be open
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('has correct button styling classes', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');

      // Check all expected CSS classes are present
      const expectedClasses = [
        'w-full', 'p-4', 'text-left', 'text-gray-500', 'bg-white',
        'rounded-lg', 'border-2', 'border-dashed', 'border-gray-300',
        'hover:border-gray-400', 'hover:bg-gray-50', 'transition-colors'
      ];

      expectedClasses.forEach(className => {
        expect(addButton).toHaveClass(className);
      });
    });

    it('responds to multiple button clicks', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');

      // Click multiple times
      fireEvent.click(addButton);
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();

      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();

      fireEvent.click(addButton);
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });

    it('button is accessible via keyboard', async () => {
      const user = userEvent.setup();
      render(<TaskCreationFeature {...defaultProps} />);

      const addButton = screen.getByText('+ Add new task');

      // Focus and activate with Enter key
      addButton.focus();
      await user.keyboard('{Enter}');

      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
    });
  });

  describe('State Management', () => {
    it('maintains independent state for modal visibility and task type', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Initial state - modal closed, task type ONE_TIME
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();

      // Open modal
      fireEvent.click(screen.getByText('+ Add new task'));
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.ONE_TIME);

      // Change task type
      fireEvent.click(screen.getByTestId('modal-change-task-type'));
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.DAILY);

      // Close modal
      fireEvent.click(screen.getByTestId('modal-close'));
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();

      // Reopen modal - task type should be preserved
      fireEvent.click(screen.getByText('+ Add new task'));
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.DAILY);
    });

    it('resets modal state correctly after task creation', async () => {
      render(<TaskCreationFeature {...defaultProps} />);

      // Open modal, change task type, create task
      fireEvent.click(screen.getByText('+ Add new task'));
      fireEvent.click(screen.getByTestId('modal-change-task-type'));
      fireEvent.click(screen.getByTestId('modal-create-task'));

      // Wait for modal to close
      await waitFor(() => {
        expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
      });

      // Reopen modal - task type should still be preserved
      fireEvent.click(screen.getByText('+ Add new task'));
      expect(screen.getByTestId('modal-task-type')).toHaveTextContent(TaskTypeConstants.DAILY);
    });
  });

  describe('Component Integration', () => {
    it('passes all required props to TaskModal', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      fireEvent.click(screen.getByText('+ Add new task'));

      // Verify all props are passed correctly
      expect(mockTaskModal).toHaveBeenCalledWith(
        expect.objectContaining({
          isOpen: true,
          onClose: expect.any(Function),
          taskType: expect.any(String),
          setTaskType: expect.any(Function),
          onError: expect.any(Function),
          onTaskCreated: expect.any(Function),
        })
      );
    });

    it('handles TaskModal prop changes correctly', () => {
      render(<TaskCreationFeature {...defaultProps} />);

      fireEvent.click(screen.getByText('+ Add new task'));

      // Verify that the prop functions work as expected
      const modalProps = mockTaskModal.mock.calls[0][0];

      // Test onClose
      expect(screen.getByTestId('task-modal')).toBeInTheDocument();
      act(() => {
        modalProps.onClose();
      });
      expect(screen.queryByTestId('task-modal')).not.toBeInTheDocument();
    });
  });
});