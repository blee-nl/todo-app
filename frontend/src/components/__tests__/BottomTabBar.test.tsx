import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BottomTabBar from "../BottomTabBar";

describe("BottomTabBar", () => {
  const mockOnStateChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render all navigation tabs", () => {
    render(
      <BottomTabBar selectedState="pending" onStateChange={mockOnStateChange} />
    );

    expect(screen.getByText("Pending")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("should render icons for each tab", () => {
    render(
      <BottomTabBar selectedState="pending" onStateChange={mockOnStateChange} />
    );

    // Check for Heroicons (they render as SVG elements)
    const icons = document.querySelectorAll("svg");
    expect(icons).toHaveLength(4); // One icon per tab
  });

  it("should highlight selected state", () => {
    render(
      <BottomTabBar selectedState="active" onStateChange={mockOnStateChange} />
    );

    const activeButton = screen.getByText("Active").closest("button");
    expect(activeButton).toHaveClass("text-blue-600", "bg-blue-50");
  });

  it("should call onStateChange when tab is clicked", () => {
    render(
      <BottomTabBar selectedState="pending" onStateChange={mockOnStateChange} />
    );

    const activeButton = screen.getByText("Active");
    fireEvent.click(activeButton);

    expect(mockOnStateChange).toHaveBeenCalledWith("active");
  });

  it("should have correct styling for unselected tabs", () => {
    render(
      <BottomTabBar selectedState="pending" onStateChange={mockOnStateChange} />
    );

    const activeButton = screen.getByText("Active").closest("button");
    expect(activeButton).toHaveClass("text-gray-500", "hover:text-gray-700");
  });

  it("should have correct container styling", () => {
    const { container } = render(
      <BottomTabBar selectedState="pending" onStateChange={mockOnStateChange} />
    );

    const bottomBar = container.firstChild as HTMLElement;
    expect(bottomBar).toHaveClass(
      "lg:hidden",
      "bg-white",
      "border-t",
      "border-gray-200",
      "px-4",
      "py-2"
    );
  });
});
