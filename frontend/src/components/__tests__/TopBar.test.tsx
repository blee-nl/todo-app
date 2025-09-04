import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TopBar from "../TopBar";

describe("TopBar", () => {
  const mockOnAddTask = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render pending tasks title", () => {
    render(<TopBar selectedState="pending" onAddTask={mockOnAddTask} />);

    expect(screen.getByText("Pending Tasks")).toBeInTheDocument();
    expect(screen.getByText("Manage your tasks")).toBeInTheDocument();
  });

  it("should render active tasks title", () => {
    render(<TopBar selectedState="active" onAddTask={mockOnAddTask} />);

    expect(screen.getByText("Active Tasks")).toBeInTheDocument();
  });

  it("should render completed tasks title", () => {
    render(<TopBar selectedState="completed" onAddTask={mockOnAddTask} />);

    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
  });

  it("should render failed tasks title", () => {
    render(<TopBar selectedState="failed" onAddTask={mockOnAddTask} />);

    expect(screen.getByText("Failed Tasks")).toBeInTheDocument();
  });

  it("should render Add Task button", () => {
    render(<TopBar selectedState="pending" onAddTask={mockOnAddTask} />);

    const addButton = screen.getByText("Add Task");
    expect(addButton).toBeInTheDocument();
    expect(addButton.closest("button")).toHaveClass("bg-blue-500");
  });

  it("should call onAddTask when Add Task button is clicked", () => {
    render(<TopBar selectedState="pending" onAddTask={mockOnAddTask} />);

    const addButton = screen.getByText("Add Task");
    fireEvent.click(addButton);

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
  });

  it("should have correct styling", () => {
    const { container } = render(
      <TopBar selectedState="pending" onAddTask={mockOnAddTask} />
    );

    const topBar = container.firstChild as HTMLElement;
    expect(topBar).toHaveClass(
      "bg-white",
      "border-b",
      "border-gray-200",
      "px-4",
      "lg:px-6",
      "py-4",
      "flex",
      "items-center",
      "justify-between"
    );
  });
});
