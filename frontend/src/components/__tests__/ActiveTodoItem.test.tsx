import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ActiveTodoItem from '../ActiveTodoItem';
import type { Todo } from '../../services/api';

// Mock the hooks
const mockUpdateTodo = vi.fn();
const mockCompleteTodo = vi.fn();
const mockFailTodo = vi.fn();
const mockDeleteTodo = vi.fn();

vi.mock('../../hooks/useTodos', () => ({
  useUpdateTodo: () => ({
    mutateAsync: mockUpdateTodo,
    isPending: false,
  }),
  useCompleteTodo: () => ({
    mutateAsync: mockCompleteTodo,
    isPending: false,
  }),
  useFailTodo: () => ({
    mutateAsync: mockFailTodo,
    isPending: false,
  }),
  useDeleteTodo: () => ({
    mutateAsync: mockDeleteTodo,
    isPending: false,
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockTodo: Todo = {
  id: '1',
  text: 'Test active todo',
  type: 'one-time',
  state: 'active',
  dueAt: '2024-12-31T23:59:59.000Z',
  activatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('ActiveTodoItem', () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render todo text', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Test active todo')).toBeInTheDocument();
  });

  it('should render task type', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('one-time')).toBeInTheDocument();
  });

  it('should render due date', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Due:')).toBeInTheDocument();
  });

  it('should render activated date', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText(/Activated/)).toBeInTheDocument();
  });

  it('should render complete button', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Complete')).toBeInTheDocument();
  });

  it('should render fail button', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Fail')).toBeInTheDocument();
  });

  it('should render delete button', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should call completeTodo when complete button is clicked', async () => {
    mockCompleteTodo.mockResolvedValue({});
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockCompleteTodo).toHaveBeenCalledWith('1');
    });
  });

  it('should call failTodo when fail button is clicked', async () => {
    mockFailTodo.mockResolvedValue({});
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const failButton = screen.getByText('Fail');
    fireEvent.click(failButton);

    await waitFor(() => {
      expect(mockFailTodo).toHaveBeenCalledWith('1');
    });
  });

  it('should call deleteTodo when delete button is clicked', async () => {
    mockDeleteTodo.mockResolvedValue({});
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTodo).toHaveBeenCalledWith('1');
    });
  });

  it('should call onError when completion fails', async () => {
    const error = new Error('Completion failed');
    mockCompleteTodo.mockRejectedValue(error);
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const completeButton = screen.getByText('Complete');
    fireEvent.click(completeButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it('should call onError when failure fails', async () => {
    const error = new Error('Failure failed');
    mockFailTodo.mockRejectedValue(error);
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const failButton = screen.getByText('Fail');
    fireEvent.click(failButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it('should call onError when deletion fails', async () => {
    const error = new Error('Deletion failed');
    mockDeleteTodo.mockRejectedValue(error);
    
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it('should show overdue status for overdue todos', () => {
    const overdueTodo: Todo = {
      ...mockTodo,
      dueAt: '2020-01-01T00:00:00.000Z', // Past date
    };

    render(
      <ActiveTodoItem todo={overdueTodo} onError={mockOnError} />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  it('should handle mobile layout', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} isMobile={true} />,
      { wrapper: createWrapper() }
    );

    const buttonContainer = screen.getByText('Complete').closest('div');
    expect(buttonContainer).toHaveClass('flex-row', 'space-x-2');
  });

  it('should handle desktop layout', () => {
    render(
      <ActiveTodoItem todo={mockTodo} onError={mockOnError} isMobile={false} />,
      { wrapper: createWrapper() }
    );

    const buttonContainer = screen.getByText('Complete').closest('div');
    expect(buttonContainer).toHaveClass('flex-col', 'space-y-2');
  });
});
