import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import NotificationIndicator from "../NotificationIndicator";
import type { Todo } from "../../services/api";

// Mock icons
vi.mock("../../assets/icons", () => ({
  BellIcon: ({ size, className }: any) => (
    <span data-testid="bell-icon" data-size={size} className={className}>
      🔔
    </span>
  ),
  BellSlashIcon: ({ size, className }: any) => (
    <span data-testid="bell-slash-icon" data-size={size} className={className}>
      🔕
    </span>
  ),
}));

const createMockTodo = (notification?: any): Todo => ({
  id: "1",
  text: "Test todo",
  type: "one-time",
  state: "active",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  notification,
});

describe("NotificationIndicator", () => {
  describe("Rendering", () => {
    it("should return null when todo is not provided", () => {
      const { container } = render(<NotificationIndicator todo={null as any} />);
      expect(container.firstChild).toBeNull();
    });

    it("should render bell slash icon when notifications are disabled", () => {
      const todo = createMockTodo();
      render(<NotificationIndicator todo={todo} />);

      expect(screen.getByTestId("bell-slash-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("bell-icon")).not.toBeInTheDocument();
    });

    it("should render bell icon when notifications are enabled", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} />);

      expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("bell-slash-icon")).not.toBeInTheDocument();
    });

    it("should render bell slash icon when notification object exists but enabled is false", () => {
      const todo = createMockTodo({ enabled: false, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} />);

      expect(screen.getByTestId("bell-slash-icon")).toBeInTheDocument();
      expect(screen.queryByTestId("bell-icon")).not.toBeInTheDocument();
    });
  });

  describe("Icon sizing", () => {
    it("should use default size xs when not specified", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} />);

      const icon = screen.getByTestId("bell-icon");
      expect(icon).toHaveAttribute("data-size", "xs");
    });

    it("should apply custom size", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} size="md" />);

      const icon = screen.getByTestId("bell-icon");
      expect(icon).toHaveAttribute("data-size", "md");
    });

    it("should handle all size variants", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });

      const sizes = ["xs", "sm", "md"] as const;

      sizes.forEach(size => {
        const { unmount } = render(<NotificationIndicator todo={todo} size={size} />);
        const icon = screen.getByTestId("bell-icon");
        expect(icon).toHaveAttribute("data-size", size);
        unmount();
      });
    });
  });

  describe("CSS classes", () => {
    it("should apply enabled styling when notifications are on", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} className="custom-class" />);

      const icon = screen.getByTestId("bell-icon");
      expect(icon).toHaveClass("custom-class", "text-blue-500");
    });

    it("should apply disabled styling when notifications are off", () => {
      const todo = createMockTodo({ enabled: false, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} className="custom-class" />);

      const icon = screen.getByTestId("bell-slash-icon");
      expect(icon).toHaveClass("custom-class", "text-gray-400");
    });

    it("should handle missing className prop", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} />);

      const icon = screen.getByTestId("bell-icon");
      expect(icon).toHaveClass("text-blue-500");
    });
  });

  describe("Time display", () => {
    it("should not show time by default", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} />);

      expect(screen.queryByText("15m")).not.toBeInTheDocument();
    });

    it("should show time when showTime is true and notifications are enabled", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} showTime={true} />);

      expect(screen.getByText("15m")).toBeInTheDocument();
    });

    it("should not show time when showTime is true but notifications are disabled", () => {
      const todo = createMockTodo({ enabled: false, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} showTime={true} />);

      expect(screen.queryByText("15m")).not.toBeInTheDocument();
    });

    it("should not show time when showTime is true but no notification object exists", () => {
      const todo = createMockTodo();
      render(<NotificationIndicator todo={todo} showTime={true} />);

      expect(screen.queryByText(/\d+[mhd]/)).not.toBeInTheDocument();
    });
  });

  describe("Time formatting", () => {
    describe("Minutes format", () => {
      it("should format minutes correctly (< 60)", () => {
        const testCases = [1, 15, 30, 59];

        testCases.forEach(minutes => {
          const todo = createMockTodo({ enabled: true, reminderMinutes: minutes });
          const { unmount } = render(<NotificationIndicator todo={todo} showTime={true} />);

          expect(screen.getByText(`${minutes}m`)).toBeInTheDocument();
          unmount();
        });
      });
    });

    describe("Hours format", () => {
      it("should format hours correctly (>= 60, < 1440)", () => {
        const testCases = [
          { minutes: 60, expected: "1h" },
          { minutes: 120, expected: "2h" },
          { minutes: 480, expected: "8h" },
          { minutes: 1439, expected: "23h" },
        ];

        testCases.forEach(({ minutes, expected }) => {
          const todo = createMockTodo({ enabled: true, reminderMinutes: minutes });
          const { unmount } = render(<NotificationIndicator todo={todo} showTime={true} />);

          expect(screen.getByText(expected)).toBeInTheDocument();
          unmount();
        });
      });
    });

    describe("Days format", () => {
      it("should format days correctly (>= 1440)", () => {
        const testCases = [
          { minutes: 1440, expected: "1d" },
          { minutes: 2880, expected: "2d" },
          { minutes: 10080, expected: "7d" },
        ];

        testCases.forEach(({ minutes, expected }) => {
          const todo = createMockTodo({ enabled: true, reminderMinutes: minutes });
          const { unmount } = render(<NotificationIndicator todo={todo} showTime={true} />);

          expect(screen.getByText(expected)).toBeInTheDocument();
          unmount();
        });
      });
    });

    describe("Edge cases", () => {
      it("should handle zero minutes", () => {
        const todo = createMockTodo({ enabled: true, reminderMinutes: 0 });
        render(<NotificationIndicator todo={todo} showTime={true} />);

        expect(screen.getByText("0m")).toBeInTheDocument();
      });

      it("should handle missing reminderMinutes (defaults to 0)", () => {
        const todo = createMockTodo({ enabled: true });
        render(<NotificationIndicator todo={todo} showTime={true} />);

        expect(screen.getByText("0m")).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility and semantic structure", () => {
    it("should use semantic structure with flex container", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      const { container } = render(<NotificationIndicator todo={todo} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass("flex", "items-center", "space-x-1");
    });

    it("should have proper styling for time display", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 15 });
      render(<NotificationIndicator todo={todo} showTime={true} />);

      const timeText = screen.getByText("15m");
      expect(timeText).toHaveClass("text-xs", "text-gray-500");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle todo with undefined notification", () => {
      const todo = createMockTodo(undefined);
      expect(() => {
        render(<NotificationIndicator todo={todo} />);
      }).not.toThrow();

      expect(screen.getByTestId("bell-slash-icon")).toBeInTheDocument();
    });

    it("should handle todo with null notification", () => {
      const todo = createMockTodo(null);
      expect(() => {
        render(<NotificationIndicator todo={todo} />);
      }).not.toThrow();

      expect(screen.getByTestId("bell-slash-icon")).toBeInTheDocument();
    });

    it("should handle partial notification objects", () => {
      const todo = createMockTodo({ enabled: true }); // Missing reminderMinutes
      render(<NotificationIndicator todo={todo} showTime={true} />);

      expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
      expect(screen.getByText("0m")).toBeInTheDocument();
    });

    it("should handle very large reminder values", () => {
      const todo = createMockTodo({ enabled: true, reminderMinutes: 100000 });
      render(<NotificationIndicator todo={todo} showTime={true} />);

      const expectedDays = Math.floor(100000 / 1440);
      expect(screen.getByText(`${expectedDays}d`)).toBeInTheDocument();
    });
  });

  describe("Integration scenarios", () => {
    it("should work with different todo types", () => {
      const oneTimeTodo = { ...createMockTodo({ enabled: true, reminderMinutes: 30 }), type: "one-time" as const };
      const dailyTodo = { ...createMockTodo({ enabled: true, reminderMinutes: 60 }), type: "daily" as const };

      const { unmount: unmount1 } = render(<NotificationIndicator todo={oneTimeTodo} showTime={true} />);
      expect(screen.getByText("30m")).toBeInTheDocument();
      unmount1();

      render(<NotificationIndicator todo={dailyTodo} showTime={true} />);
      expect(screen.getByText("1h")).toBeInTheDocument();
    });

    it("should work with different todo states", () => {
      const states = ["pending", "active", "completed", "failed"] as const;

      states.forEach(state => {
        const todo = { ...createMockTodo({ enabled: true, reminderMinutes: 15 }), state };
        const { unmount } = render(<NotificationIndicator todo={todo} />);

        expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
        unmount();
      });
    });
  });
});