import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "../TodoItem";
import { mockTodos } from "../../test/utils";
import type { AppError } from "../../utils/errorUtils";

const mockTodo = mockTodos[0];
const defaultProps = {
  todo: mockTodo,
  isEditing: false,
  editValue: "",
  onEdit: vi.fn(),
  onSave: vi.fn(),
  onCancel: vi.fn(),
  onToggle: vi.fn(),
  onDelete: vi.fn(),
  onEditValueChange: vi.fn(),
  isPending: {
    update: false,
    toggle: false,
    delete: false,
  },
};

describe("TodoItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render todo item", () => {
    render(<TodoItem {...defaultProps} />);

    expect(screen.getByText("Test todo 1")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
  });

  it("should show edit mode when isEditing is true", () => {
    render(
      <TodoItem {...defaultProps} isEditing={true} editValue="Editing text" />
    );

    expect(screen.getByDisplayValue("Editing text")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockTodo);
  });

  it("should call onSave when save button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <TodoItem {...defaultProps} isEditing={true} editValue="New text" />
    );

    const saveButton = screen.getByRole("button", { name: /save/i });
    await user.click(saveButton);

    expect(defaultProps.onSave).toHaveBeenCalledWith(mockTodo.id);
  });

  it("should call onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} isEditing={true} />);

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("should call onToggle when checkbox is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(defaultProps.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it("should call onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} />);

    const deleteButton = screen.getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it("should call onEditValueChange when input value changes", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} isEditing={true} editValue="" />);

    const input = screen.getByDisplayValue("");
    await user.type(input, "New text");

    // Check that onEditValueChange was called for each character
    expect(defaultProps.onEditValueChange).toHaveBeenCalledTimes(8); // One call per character
    // Check that the first and last characters were called correctly
    expect(defaultProps.onEditValueChange).toHaveBeenNthCalledWith(1, "N");
    expect(defaultProps.onEditValueChange).toHaveBeenNthCalledWith(8, "t"); // Last character is 't'
  });

  it("should handle keyboard events in edit mode", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} isEditing={true} editValue="Test" />);

    const input = screen.getByDisplayValue("Test");
    await user.type(input, "{enter}");

    expect(defaultProps.onSave).toHaveBeenCalledWith(mockTodo.id);
  });

  it("should handle escape key in edit mode", async () => {
    const user = userEvent.setup();
    render(<TodoItem {...defaultProps} isEditing={true} editValue="" />);

    const input = screen.getByDisplayValue("");
    await user.type(input, "{escape}");

    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it("should disable buttons when pending", () => {
    render(
      <TodoItem
        {...defaultProps}
        isPending={{ update: true, toggle: true, delete: true }}
      />
    );

    expect(screen.getByRole("button", { name: /edit/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /delete/i })).toBeDisabled();
  });

  it("should show loading text when pending", () => {
    render(
      <TodoItem
        {...defaultProps}
        isPending={{ update: true, toggle: false, delete: true }}
      />
    );

    expect(screen.getByText("Deleting...")).toBeInTheDocument();
  });

  it("should display timestamps", () => {
    render(<TodoItem {...defaultProps} />);

    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });

  it("should display error when provided", () => {
    const error: AppError = {
      message: "Test error",
      status: 400,
    };

    render(<TodoItem {...defaultProps} error={error} />);

    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    const error: AppError = {
      message: "Test error",
      status: 400,
    };

    render(<TodoItem {...defaultProps} error={error} onRetry={onRetry} />);

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
      <TodoItem
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
    render(<TodoItem {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    const editButton = screen.getByRole("button", { name: /edit/i });
    const deleteButton = screen.getByRole("button", { name: /delete/i });

    expect(checkbox).toHaveAttribute("aria-label", "Mark todo as complete");
    expect(editButton).toHaveAttribute("aria-label", "Edit todo");
    expect(deleteButton).toHaveAttribute("aria-label", "Delete todo");
  });
});
