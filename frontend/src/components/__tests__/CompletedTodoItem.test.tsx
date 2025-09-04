import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompletedTodoItem } from "../CompletedTodoItem";
import { mockTodos } from "../../test/utils";
import type { AppError } from "../../utils/errorUtils";

const mockCompletedTodo = mockTodos[1]; // This is the completed todo
const defaultProps = {
  todo: mockCompletedTodo,
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  isPending: {
    toggle: false,
    delete: false,
  },
};

describe("CompletedTodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render completed todo item", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    expect(screen.getByText("Test todo 2")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should show completed checkbox as checked", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("should call onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<CompletedTodoItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith(mockCompletedTodo.id);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<CompletedTodoItem {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockCompletedTodo.id);
  });

  it("should disable buttons when pending", () => {
    render(
      <CompletedTodoItem
        {...defaultProps}
        isPending={{ toggle: true, delete: true }}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(checkbox).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it("should show loading text when pending", () => {
    render(
      <CompletedTodoItem
        {...defaultProps}
        isPending={{ toggle: false, delete: true }}
      />
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
  });

  it("should display timestamps including completed date", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    expect(screen.getByText(/created/i)).toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("should display error when provided", () => {
    const error: AppError = {
      message: "Test error",
      status: 400,
    };

    render(<CompletedTodoItem {...defaultProps} error={error} />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const error: AppError = {
      message: "Test error",
      status: 400,
    };

    render(
      <CompletedTodoItem {...defaultProps} error={error} onRetry={onRetry} />
    );

    const retryButton = screen.getByRole("button", {
      name: /retry operation/i,
    });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it("should call onDismissError when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismissError = vi.fn();
    const error: AppError = {
      message: "Test error",
      status: 400,
    };

    render(
      <CompletedTodoItem
        {...defaultProps}
        error={error}
        onDismissError={onDismissError}
      />
    );

    const dismissButton = screen.getByRole("button", {
      name: /dismiss error/i,
    });
    await user.click(dismissButton);

    expect(onDismissError).toHaveBeenCalled();
  });

  it("should have proper accessibility attributes", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(checkbox).toHaveAttribute("aria-label", "Mark todo as incomplete");
    expect(deleteButton).toHaveAttribute("aria-label", "Delete completed todo");
  });

  it("should not show edit button for completed todos", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    expect(
      screen.queryByRole("button", { name: /edit/i })
    ).not.toBeInTheDocument();
  });

  it("should have completed styling", () => {
    render(<CompletedTodoItem {...defaultProps} />);

    const todoText = screen.getByText("Test todo 2");
    expect(todoText).toHaveClass("line-through", "text-slate-500");
  });
});
