import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TaskModal from "../TaskModal";

// Mock the useCreateTodo hook
vi.mock("../../hooks/useTodos", () => ({
  useCreateTodo: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
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

describe("TaskModal", () => {
  const mockOnClose = vi.fn();
  const mockSetTaskType = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when closed", () => {
    render(
      <TaskModal
        isOpen={false}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("Add New Task")).not.toBeInTheDocument();
  });

  it("should render when open", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Add New Task")).toBeInTheDocument();
  });

  it("should render task type selector", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Task Type")).toBeInTheDocument();
    expect(screen.getByText("One-time")).toBeInTheDocument();
    expect(screen.getByText("Daily")).toBeInTheDocument();
  });

  it("should render task description field", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Task Description")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/What task needs to be done/)
    ).toBeInTheDocument();
  });

  it("should render due date field for one-time tasks", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText("Due Date & Time")).toBeInTheDocument();
    expect(screen.getByLabelText("Due Date & Time")).toBeInTheDocument(); // datetime-local input
  });

  it("should not render due date field for daily tasks", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="daily"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    expect(screen.queryByText("Due Date & Time")).not.toBeInTheDocument();
  });

  it("should call setTaskType when task type is changed", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const dailyButton = screen.getByText("Daily");
    fireEvent.click(dailyButton);

    expect(mockSetTaskType).toHaveBeenCalledWith("daily");
  });

  it("should call onClose when close button is clicked", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should update text input when typing", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const textInput = screen.getByPlaceholderText(/What task needs to be done/);
    fireEvent.change(textInput, { target: { value: "Test task" } });

    expect(textInput).toHaveValue("Test task");
  });

  it("should show character count", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const textInput = screen.getByPlaceholderText(/What task needs to be done/);
    fireEvent.change(textInput, { target: { value: "Test" } });

    expect(screen.getByText("4/500")).toBeInTheDocument();
  });

  it("should disable submit button when text is empty", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const submitButton = screen.getByRole("button", { name: /add task/i });
    expect(submitButton).toBeDisabled();
  });

  it("should disable submit button when due date is missing for one-time tasks", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const textInput = screen.getByPlaceholderText(/What task needs to be done/);
    fireEvent.change(textInput, { target: { value: "Test task" } });

    const submitButton = screen.getByRole("button", { name: /add task/i });
    expect(submitButton).toBeDisabled();
  });

  it("should enable submit button when all required fields are filled", () => {
    render(
      <TaskModal
        isOpen={true}
        onClose={mockOnClose}
        taskType="one-time"
        setTaskType={mockSetTaskType}
      />,
      { wrapper: createWrapper() }
    );

    const textInput = screen.getByPlaceholderText(/What task needs to be done/);
    fireEvent.change(textInput, { target: { value: "Test task" } });

    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    const futureDate = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 16);
    fireEvent.change(dueDateInput, { target: { value: futureDate } });

    const submitButton = screen.getByText("Add Task");
    expect(submitButton).not.toBeDisabled();
  });
});
