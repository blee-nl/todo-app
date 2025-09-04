import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodoInput from "../TodoInput";

// Mock the hooks
const mockCreateTodo = vi.fn();

vi.mock("../../hooks/useTodos", () => ({
  useCreateTodo: () => ({
    mutateAsync: mockCreateTodo,
    isPending: false,
  }),
}));

// Mock CustomDateTimePicker
vi.mock("../CustomDateTimePicker", () => ({
  default: ({ value, onChange, placeholder, id }: any) => (
    <input
      id={id}
      data-testid="custom-datetime-picker"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
    />
  ),
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

describe("TodoInput", () => {
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render input field for one-time task", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByPlaceholderText("What task needs to be done?")
    ).toBeInTheDocument();
  });

  it("should render input field for daily task", () => {
    render(<TodoInput taskType="daily" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.getByPlaceholderText("What habit needs to be done?")
    ).toBeInTheDocument();
  });

  it("should render task type display", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("one-time")).toBeInTheDocument();
  });

  it("should render due date input for one-time tasks", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByTestId("custom-datetime-picker")).toBeInTheDocument();
  });

  it("should not render due date input for daily tasks", () => {
    render(<TodoInput taskType="daily" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(
      screen.queryByTestId("custom-datetime-picker")
    ).not.toBeInTheDocument();
  });

  it("should render add button", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("should call createTodo when form is submitted for one-time task", async () => {
    mockCreateTodo.mockResolvedValue({});

    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText("What task needs to be done?");
    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    const addButton = screen.getByText("Add Task");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().slice(0, 16);

    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.change(dueDateInput, { target: { value: dateString } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        text: "Test task",
        type: "one-time",
        dueAt: dateString,
      });
    });
  });

  it("should call createTodo when form is submitted for daily task", async () => {
    mockCreateTodo.mockResolvedValue({});

    render(<TodoInput taskType="daily" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText("What habit needs to be done?");
    const addButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "Test habit" } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockCreateTodo).toHaveBeenCalledWith({
        text: "Test habit",
        type: "daily",
      });
    });
  });

  it("should call onError when creation fails", async () => {
    const error = new Error("Creation failed");
    mockCreateTodo.mockRejectedValue(error);

    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText("What task needs to be done?");
    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    const addButton = screen.getByText("Add Task");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().slice(0, 16);

    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.change(dueDateInput, { target: { value: dateString } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(error);
    });
  });

  it("should clear input after successful creation", async () => {
    mockCreateTodo.mockResolvedValue({});

    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText(
      "What task needs to be done?"
    ) as HTMLInputElement;
    const dueDateInput = screen.getByLabelText(
      "Due Date & Time"
    ) as HTMLInputElement;
    const addButton = screen.getByText("Add Task");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().slice(0, 16);

    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.change(dueDateInput, { target: { value: dateString } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(input.value).toBe("");
      expect(dueDateInput.value).toBe("");
    });
  });

  it("should handle due date change", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const dueDateInput = screen.getByLabelText(
      "Due Date & Time"
    ) as HTMLInputElement;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateString = futureDate.toISOString().slice(0, 16);

    fireEvent.change(dueDateInput, { target: { value: dateString } });

    expect(dueDateInput.value).toBe(dateString);
  });

  it("should not submit empty task", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("should not submit task with only whitespace", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText("What task needs to be done?");
    const addButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.click(addButton);

    expect(mockCreateTodo).not.toHaveBeenCalled();
  });

  it("should not submit one-time task without due date", () => {
    render(<TodoInput taskType="one-time" onError={mockOnError} />, {
      wrapper: createWrapper(),
    });

    const input = screen.getByPlaceholderText("What task needs to be done?");
    const addButton = screen.getByText("Add Task");

    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.click(addButton);

    expect(mockCreateTodo).not.toHaveBeenCalled();
  });
});
