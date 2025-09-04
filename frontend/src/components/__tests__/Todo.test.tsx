import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Todo from "../Todo";
import { mockTodos } from "../../test/utils";
import { useTodos } from "../../hooks/useTodos";

// Mock the hooks
vi.mock("../../hooks/useTodos", () => ({
  useTodos: vi.fn(() => ({
    data: mockTodos,
    isLoading: false,
    error: null,
  })),
  useCreateTodo: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useUpdateTodo: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useToggleTodo: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useDeleteTodo: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
  useDeleteCompletedTodos: vi.fn(() => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  })),
}));

vi.mock("../../hooks/useErrorHandler", () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn(),
    currentError: null,
    clearError: vi.fn(),
    retryOperation: vi.fn(),
  })),
}));

describe("Todo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the main todo interface", () => {
    render(<Todo />);

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(
      screen.getByText("Organize your day with elegance")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What needs to be done?")
    ).toBeInTheDocument();
  });

  it("should display active todos", () => {
    render(<Todo />);

    expect(screen.getByText("Active Tasks (1)")).toBeInTheDocument();
    expect(screen.getByText("Test todo 1")).toBeInTheDocument();
  });

  it("should display completed todos", () => {
    render(<Todo />);

    expect(screen.getByText("Completed Tasks (1)")).toBeInTheDocument();
    expect(screen.getByText("Test todo 2")).toBeInTheDocument();
  });

  it("should show clear completed button when there are completed todos", () => {
    render(<Todo />);

    expect(screen.getByText("Clear Completed (1)")).toBeInTheDocument();
  });

  it("should allow adding new todos", async () => {
    const user = userEvent.setup();
    render(<Todo />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const addButton = screen.getByRole("button", { name: /add/i });

    await user.type(input, "New todo");
    await user.click(addButton);

    // After adding a todo, the input should be cleared
    expect(input).toHaveValue("");
  });

  it("should disable add button when input is empty", () => {
    render(<Todo />);

    const addButton = screen.getByRole("button", { name: /add/i });
    expect(addButton).toBeDisabled();
  });

  it("should enable add button when input has value", async () => {
    const user = userEvent.setup();
    render(<Todo />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const addButton = screen.getByRole("button", { name: /add/i });

    await user.type(input, "Test");

    expect(addButton).not.toBeDisabled();
  });

  it("should show edit mode when edit button is clicked", async () => {
    const user = userEvent.setup();
    render(<Todo />);

    const editButton = screen.getByRole("button", { name: /edit/i });
    await user.click(editButton);

    expect(screen.getByDisplayValue("Test todo 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("should show delete buttons for todos", () => {
    render(<Todo />);

    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2); // One for active, one for completed
  });

  it("should show checkboxes for todos", () => {
    render(<Todo />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
  });

  it("should display timestamps for todos", () => {
    render(<Todo />);

    expect(screen.getAllByText(/Created/i)).toHaveLength(2);
  });

  it("should handle keyboard events for adding todos", async () => {
    const user = userEvent.setup();
    render(<Todo />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "New todo{enter}");

    // After adding a todo, the input should be cleared
    expect(input).toHaveValue("");
  });
});

describe("Todo - Loading State", () => {
  it("should show loading state", () => {
    vi.mocked(useTodos).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    } as unknown as ReturnType<typeof useTodos>);

    render(<Todo />);

    expect(screen.getByText("Loading todos...")).toBeInTheDocument();
  });
});

describe("Todo - Error State", () => {
  it("should show error state", () => {
    vi.mocked(useTodos).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error("Failed to load todos"),
    } as unknown as ReturnType<typeof useTodos>);

    render(<Todo />);

    expect(screen.getByText("Error Loading Todos")).toBeInTheDocument();
    expect(screen.getByText("Failed to load todos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });
});
