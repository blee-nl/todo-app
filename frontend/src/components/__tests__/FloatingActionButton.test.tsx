import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FloatingActionButton from "../FloatingActionButton";

describe("FloatingActionButton", () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render floating action button", () => {
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("should have correct styling", () => {
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "w-14",
      "h-14",
      "rounded-full",
      "shadow-lg",
      "bg-blue-500",
      "hover:bg-blue-600"
    );
  });

  it("should render plus icon", () => {
    render(<FloatingActionButton onClick={mockOnClick} />);

    const icon = screen.getByRole("button").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("should call onClick when clicked", () => {
    render(<FloatingActionButton onClick={mockOnClick} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("should have correct positioning", () => {
    const { container } = render(
      <FloatingActionButton onClick={mockOnClick} />
    );

    const fabContainer = container.firstChild as HTMLElement;
    expect(fabContainer).toHaveClass("fixed", "bottom-20", "right-4", "z-50");
  });
});
