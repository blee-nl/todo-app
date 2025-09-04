import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoInput } from "../TodoInput";

describe("TodoInput", () => {
  const defaultProps = {
    value: "",
    onChange: vi.fn(),
    onAdd: vi.fn(),
    onKeyDown: vi.fn(),
    isLoading: false,
  };

  it("should render input and button", () => {
    render(<TodoInput {...defaultProps} />);

    expect(
      screen.getByPlaceholderText("What needs to be done?")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("should call onChange when input value changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TodoInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Test todo");

    // Check that onChange was called for each character
    expect(onChange).toHaveBeenCalledTimes(9); // One call per character
    // Check that the first and last characters were called correctly
    expect(onChange).toHaveBeenNthCalledWith(1, "T");
    expect(onChange).toHaveBeenNthCalledWith(9, "o"); // Last character is 'o'
  });

  it("should call onAdd when button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(<TodoInput {...defaultProps} value="Test todo" onAdd={onAdd} />);

    const button = screen.getByRole("button", { name: /add/i });
    await user.click(button);

    expect(onAdd).toHaveBeenCalled();
  });

  it("should call onKeyDown when Enter is pressed", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(<TodoInput {...defaultProps} onKeyDown={onKeyDown} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    await user.type(input, "Test todo{enter}");

    expect(onKeyDown).toHaveBeenCalled();
  });

  it("should disable button when loading", () => {
    render(<TodoInput {...defaultProps} isLoading={true} />);

    const button = screen.getByRole("button", { name: /add todo/i });
    expect(button).toBeDisabled();
  });

  it("should disable button when input is empty", () => {
    render(<TodoInput {...defaultProps} value="" />);

    const button = screen.getByRole("button", { name: /add/i });
    expect(button).toBeDisabled();
  });

  it("should enable button when input has value and not loading", () => {
    render(<TodoInput {...defaultProps} value="Test todo" isLoading={false} />);

    const button = screen.getByRole("button", { name: /add/i });
    expect(button).not.toBeDisabled();
  });

  it("should show loading text when loading", () => {
    render(<TodoInput {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Adding...")).toBeInTheDocument();
  });

  it("should show add text when not loading", () => {
    render(<TodoInput {...defaultProps} isLoading={false} />);

    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<TodoInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    const button = screen.getByRole("button", { name: /add/i });

    expect(input).toHaveAttribute("aria-label", "Add new todo");
    expect(button).toHaveAttribute("aria-label", "Add todo");
  });

  it("should limit input to 500 characters", () => {
    render(<TodoInput {...defaultProps} />);

    const input = screen.getByPlaceholderText("What needs to be done?");
    expect(input).toHaveAttribute("maxLength", "500");
  });
});
