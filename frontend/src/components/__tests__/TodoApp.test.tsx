import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import TodoApp from "../TodoApp";
import type { Todo } from "../../services/api";

// Mock the hooks
const mockGetAllTodos = vi.fn();
const mockCreateTodo = vi.fn();
const mockActivateTodo = vi.fn();
const mockCompleteTodo = vi.fn();
const mockFailTodo = vi.fn();
const mockReactivateTodo = vi.fn();
const mockDeleteTodo = vi.fn();
const mockDeleteCompletedTodos = vi.fn();
const mockDeleteFailedTodos = vi.fn();

// Mock CustomDateTimePicker
vi.mock("../CustomDateTimePicker", () => ({
  default: ({ value, onChange, placeholder, id }: { value: string; onChange: (value: string) => void; placeholder?: string; id?: string }) => (
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

vi.mock("../../hooks/useTodos", () => ({
  useTodos: () => ({
    data: mockGetAllTodos(),
    isLoading: false,
    error: null,
  }),
  useGetAllTodos: () => ({
    data: mockGetAllTodos(),
    isLoading: false,
    error: null,
  }),
  useCreateTodo: () => ({
    mutateAsync: mockCreateTodo,
    isPending: false,
  }),
  useUpdateTodo: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useActivateTodo: () => ({
    mutateAsync: mockActivateTodo,
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
  useReactivateTodo: () => ({
    mutateAsync: mockReactivateTodo,
    isPending: false,
  }),
  useDeleteTodo: () => ({
    mutateAsync: mockDeleteTodo,
    isPending: false,
  }),
  useDeleteCompletedTodos: () => ({
    mutateAsync: mockDeleteCompletedTodos,
    isPending: false,
  }),
  useDeleteFailedTodos: () => ({
    mutateAsync: mockDeleteFailedTodos,
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

const mockTodos: Todo[] = [
  {
    id: "1",
    text: "Pending task",
    type: "one-time",
    state: "pending",
    dueAt: "2024-12-31T23:59:59.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "2",
    text: "Active task",
    type: "daily",
    state: "active",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "3",
    text: "Completed task",
    type: "one-time",
    state: "completed",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    completedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
  {
    id: "4",
    text: "Failed task",
    type: "daily",
    state: "failed",
    dueAt: "2024-12-31T23:59:59.000Z",
    activatedAt: "2024-01-01T00:00:00.000Z",
    failedAt: "2024-01-02T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-02T00:00:00.000Z",
  },
];

describe("TodoApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAllTodos.mockReturnValue({
      pending: mockTodos.filter((t) => t.state === "pending"),
      active: mockTodos.filter((t) => t.state === "active"),
      completed: mockTodos.filter((t) => t.state === "completed"),
      failed: mockTodos.filter((t) => t.state === "failed"),
    });
  });

  it("should render the app", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getByText("TodoApp")).toBeInTheDocument();
  });

  it("should render sidebar", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Pending")).toHaveLength(2); // Sidebar and bottom tab
    expect(screen.getAllByText("Active")).toHaveLength(2); // Sidebar and bottom tab
    expect(screen.getAllByText("Completed")).toHaveLength(1); // Only sidebar
    expect(screen.getByText("Done")).toBeInTheDocument(); // Bottom tab shows "Done"
    expect(screen.getAllByText("Failed")).toHaveLength(2); // Sidebar and bottom tab
  });

  it("should render top bar", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  it("should render task list", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getByText("Pending task")).toBeInTheDocument();
  });

  it("should render bottom tab bar on mobile", () => {
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getAllByText("Pending")).toHaveLength(2); // Sidebar and bottom tab
    expect(screen.getAllByText("Active")).toHaveLength(2); // Sidebar and bottom tab
    expect(screen.getAllByText("Completed")).toHaveLength(1); // Only sidebar
    expect(screen.getByText("Done")).toBeInTheDocument(); // Bottom tab shows "Done"
    expect(screen.getAllByText("Failed")).toHaveLength(2); // Sidebar and bottom tab
  });

  it("should render floating action button on mobile", () => {
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<TodoApp />, { wrapper: createWrapper() });

    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument();
  });

  it("should open task modal when add task button is clicked", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    expect(screen.getByText("Add New Task")).toBeInTheDocument();
  });

  it("should open task modal when floating action button is clicked", () => {
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<TodoApp />, { wrapper: createWrapper() });

    const fabButton = screen.getByRole("button", { name: "" });
    fireEvent.click(fabButton);

    expect(screen.getByText("Add New Task")).toBeInTheDocument();
  });

  it("should close task modal when close button is clicked", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    expect(screen.getByText("Add New Task")).toBeInTheDocument();

    const closeButton = screen.getAllByRole("button", { name: "" })[1]; // Get the modal close button (second one)
    fireEvent.click(closeButton);

    expect(screen.queryByText("Add New Task")).not.toBeInTheDocument();
  });

  it("should change selected state when sidebar item is clicked", () => {
    render(<TodoApp />, { wrapper: createWrapper() });

    const activeButtons = screen.getAllByText("Active");
    const sidebarActiveButton = activeButtons.find((button) =>
      button.closest("button")?.classList.contains("w-full")
    );
    fireEvent.click(sidebarActiveButton!);

    expect(screen.getByText("Active task")).toBeInTheDocument();
  });

  it("should change selected state when bottom tab is clicked", () => {
    // Mock window.innerWidth to simulate mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 768,
    });

    render(<TodoApp />, { wrapper: createWrapper() });

    const activeButtons = screen.getAllByText("Active");
    const bottomTabActiveButton = activeButtons.find((button) =>
      button.closest("button")?.classList.contains("flex-col")
    );
    fireEvent.click(bottomTabActiveButton!);

    expect(screen.getByText("Active task")).toBeInTheDocument();
  });

  it("should handle error from todo operations", async () => {
    const error = new Error("Test error");
    mockCreateTodo.mockRejectedValue(error);

    render(<TodoApp />, { wrapper: createWrapper() });

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    const input = screen.getByPlaceholderText(/what task needs to be done/i);
    const dueDateInput = screen.getByTestId("custom-datetime-picker");
    const submitButton = screen.getAllByText("Add Task")[1]; // Get the modal submit button

    fireEvent.change(input, { target: { value: "Test task" } });
    fireEvent.change(dueDateInput, { target: { value: "2025-12-31T23:59" } });
    fireEvent.click(submitButton);

    await waitFor(
      () => {
        // The error is handled by the mutation, we just verify the mutation was called
        expect(mockCreateTodo).toHaveBeenCalledWith({
          text: "Test task",
          type: "one-time",
          dueAt: "2025-12-31T23:59",
        });
      },
      { timeout: 3000 }
    );
  });
});
