import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorDisplay } from "../ErrorDisplay";
import type { AppError } from "../../utils/errorUtils";

describe("ErrorDisplay", () => {
  const mockError: AppError = {
    message: "Test error message",
    status: 404,
    code: "404",
  };

  it("should not render when error is null", () => {
    render(<ErrorDisplay error={null} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("should render error message", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should render error status when provided", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText("Error 404")).toBeInTheDocument();
  });

  it("should render error code when provided", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(screen.getByText("Code: 404")).toBeInTheDocument();
  });

  it("should call onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorDisplay error={mockError} onRetry={onRetry} />);

    const retryButton = screen.getByRole("button", {
      name: /retry operation/i,
    });
    await user.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });

  it("should call onDismiss when dismiss button is clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ErrorDisplay error={mockError} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole("button", {
      name: /dismiss error/i,
    });
    await user.click(dismissButton);

    expect(onDismiss).toHaveBeenCalled();
  });

  it("should not show retry button when onRetry is not provided", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(
      screen.queryByRole("button", { name: /retry operation/i })
    ).not.toBeInTheDocument();
  });

  it("should not show dismiss button when onDismiss is not provided", () => {
    render(<ErrorDisplay error={mockError} />);

    expect(
      screen.queryByRole("button", { name: /dismiss error/i })
    ).not.toBeInTheDocument();
  });

  it("should apply custom className", () => {
    render(<ErrorDisplay error={mockError} className="custom-class" />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("custom-class");
  });

  it("should handle error without status", () => {
    const errorWithoutStatus: AppError = {
      message: "Error without status",
    };

    render(<ErrorDisplay error={errorWithoutStatus} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Error without status")).toBeInTheDocument();
  });

  it("should handle error without code", () => {
    const errorWithoutCode: AppError = {
      message: "Error without code",
      status: 500,
    };

    render(<ErrorDisplay error={errorWithoutCode} />);

    expect(screen.getByText("Error 500")).toBeInTheDocument();
    expect(screen.queryByText(/code:/i)).not.toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<ErrorDisplay error={mockError} />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "polite");
  });
});
