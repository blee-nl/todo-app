import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InlineErrorDisplay } from "../InlineErrorDisplay";
import type { AppError } from "../../utils/errorUtils";

describe("InlineErrorDisplay", () => {
  const mockError: AppError = {
    message: "Inline test error",
    status: 400,
    code: "400",
  };

  it("should not render when error is null", () => {
    render(<InlineErrorDisplay error={null} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should render error message", () => {
    render(<InlineErrorDisplay error={mockError} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Inline test error")).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<InlineErrorDisplay error={mockError} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", {
      name: /retry operation/i,
    });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it("should call onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<InlineErrorDisplay error={mockError} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole("button", {
      name: /dismiss error/i,
    });
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it("should not show retry button when onRetry is not provided", () => {
    render(<InlineErrorDisplay error={mockError} />);

    expect(
      screen.queryByRole("button", { name: /retry operation/i })
    ).not.toBeInTheDocument();
  });

  it("should not show dismiss button when onDismiss is not provided", () => {
    render(<InlineErrorDisplay error={mockError} />);

    expect(
      screen.queryByRole("button", { name: /dismiss error/i })
    ).not.toBeInTheDocument();
  });

  it("should have proper styling classes", () => {
    render(<InlineErrorDisplay error={mockError} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("bg-red-50", "border-l-4", "border-red-400");
  });

  it("should have proper accessibility attributes", () => {
    render(<InlineErrorDisplay error={mockError} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });

  it("should render warning icon", () => {
    render(<InlineErrorDisplay error={mockError} />);

    const icon = screen.getByRole("alert").querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
