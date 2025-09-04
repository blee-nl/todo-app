import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CustomDateTimePicker from "../CustomDateTimePicker";

describe("CustomDateTimePicker", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with placeholder text", () => {
    render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    expect(screen.getByText("Select date and time")).toBeInTheDocument();
  });

  it("should render with calendar and clock icons", () => {
    render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    // Check for calendar icon (CalendarIcon from Heroicons)
    const calendarIcon = document.querySelector("svg");
    expect(calendarIcon).toBeInTheDocument();
  });

  it("should open calendar popup when clicked", async () => {
    render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      // Check for current month and year (e.g., "September 2025")
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentDate.getFullYear();
      expect(screen.getByText(`${monthName} ${year}`)).toBeInTheDocument();
    });
  });

  it("should display formatted date when value is provided", () => {
    const testDate = "2024-12-25T14:30";
    render(
      <CustomDateTimePicker
        value={testDate}
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    expect(screen.getByText(/Dec 25, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/14:30/)).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        disabled={true}
        placeholder="Select date and time"
      />
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should call onChange when date is selected", async () => {
    render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      // Check for current month and year
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentDate.getFullYear();
      expect(screen.getByText(`${monthName} ${year}`)).toBeInTheDocument();
    });

    // Click on a date (get the first enabled date button)
    const dateButtons = screen
      .getAllByRole("button")
      .filter(
        (button) =>
          button.textContent &&
          /^\d+$/.test(button.textContent) &&
          !button.disabled
      );
    const firstEnabledDateButton = dateButtons[0];
    fireEvent.click(firstEnabledDateButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("should close popup when clicking outside", async () => {
    render(
      <div>
        <CustomDateTimePicker
          value=""
          onChange={mockOnChange}
          placeholder="Select date and time"
        />
        <div data-testid="outside">Outside element</div>
      </div>
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      // Check for current month and year
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentDate.getFullYear();
      expect(screen.getByText(`${monthName} ${year}`)).toBeInTheDocument();
    });

    const outsideElement = screen.getByTestId("outside");
    fireEvent.mouseDown(outsideElement);

    await waitFor(() => {
      // Check that the calendar popup is no longer visible
      const currentDate = new Date();
      const monthName = currentDate.toLocaleDateString("en-US", {
        month: "long",
      });
      const year = currentDate.getFullYear();
      expect(
        screen.queryByText(`${monthName} ${year}`)
      ).not.toBeInTheDocument();
    });
  });

  it("should have correct styling classes", () => {
    const { container } = render(
      <CustomDateTimePicker
        value=""
        onChange={mockOnChange}
        placeholder="Select date and time"
      />
    );

    const button = container.querySelector("button");
    expect(button).toHaveClass("w-full", "px-4", "py-3", "rounded-xl");
  });
});
