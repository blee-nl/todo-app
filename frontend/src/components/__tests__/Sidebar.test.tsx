import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "../Sidebar";
import type { GroupedTodos } from "../../services/api";

const mockTodos: GroupedTodos = {
  pending: [
    {
      id: "1",
      text: "Pending task",
      type: "one-time",
      state: "pending",
      dueAt: "2024-12-31T23:59:59.000Z",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  active: [
    {
      id: "2",
      text: "Active task",
      type: "daily",
      state: "active",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  completed: [
    {
      id: "3",
      text: "Completed task",
      type: "one-time",
      state: "completed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      completedAt: "2024-01-01T01:00:00.000Z",
    },
  ],
  failed: [
    {
      id: "4",
      text: "Failed task",
      type: "daily",
      state: "failed",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      activatedAt: "2024-01-01T00:00:00.000Z",
      failedAt: "2024-01-01T01:00:00.000Z",
    },
  ],
};

describe("Sidebar", () => {
  const mockOnStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render app logo and name", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    expect(screen.getByText("TodoApp")).toBeInTheDocument();
    expect(screen.getByText("4 tasks")).toBeInTheDocument();
  });

  it("should render navigation items", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("should display correct task counts", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    // Check that all task counts are displayed (there are multiple "1" elements)
    const countElements = screen.getAllByText("1");
    expect(countElements.length).toBeGreaterThanOrEqual(4); // At least 4 task counts
  });

  it("should highlight selected state", () => {
    render(
      <Sidebar
        selectedState="active"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    const activeButton = screen.getByText("Active").closest("button");
    expect(activeButton).toHaveClass("bg-green-100", "text-green-600");
  });

  it("should call onStateChange when navigation item is clicked", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    const activeButton = screen.getByText("Active");
    fireEvent.click(activeButton);

    expect(mockOnStateChange).toHaveBeenCalledWith("active");
  });

  it("should display statistics", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByText("Completion Rate")).toBeInTheDocument();
    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
    expect(screen.getByText("Timezone")).toBeInTheDocument();
  });

  it("should calculate completion rate correctly", () => {
    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={mockTodos}
      />
    );

    // 1 completed out of 4 total = 25%
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("should handle empty todos", () => {
    const emptyTodos: GroupedTodos = {
      pending: [],
      active: [],
      completed: [],
      failed: [],
    };

    render(
      <Sidebar
        selectedState="pending"
        onStateChange={mockOnStateChange}
        todos={emptyTodos}
      />
    );

    expect(screen.getByText("0 tasks")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument(); // Completion rate
  });
});
