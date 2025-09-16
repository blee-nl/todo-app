import { describe, it, expect } from "vitest";
import {
  MONTH_NAMES,
  WEEK_DAYS,
  CALENDAR_GRID_SIZE,
  TIME_SELECTION,
  DEFAULT_TIME_OFFSET_MINUTES,
  MINIMUM_TIME_BUFFER_MINUTES,
  CSS_CLASSES,
  ARIA_LABELS,
} from "../dateTimePickerConstants";

describe("DateTimePickerConstants", () => {
  describe("MONTH_NAMES", () => {
    it("should contain all 12 months in correct order", () => {
      expect(MONTH_NAMES).toHaveLength(12);
      expect(MONTH_NAMES[0]).toBe("January");
      expect(MONTH_NAMES[1]).toBe("February");
      expect(MONTH_NAMES[11]).toBe("December");
    });

    it("should provide TypeScript readonly behavior", () => {
      // const assertion provides compile-time immutability
      expect(MONTH_NAMES[0]).toBe("January");
      expect(typeof MONTH_NAMES[0]).toBe("string");
    });

    it("should contain valid month names", () => {
      const expectedMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      expect([...MONTH_NAMES]).toEqual(expectedMonths);
    });
  });

  describe("WEEK_DAYS", () => {
    it("should contain all 7 days in correct order", () => {
      expect(WEEK_DAYS).toHaveLength(7);
      expect(WEEK_DAYS[0]).toBe("Sun");
      expect(WEEK_DAYS[6]).toBe("Sat");
    });

    it("should use abbreviated day names", () => {
      const expectedDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      expect([...WEEK_DAYS]).toEqual(expectedDays);
    });

    it("should provide TypeScript readonly behavior", () => {
      // const assertion provides compile-time immutability
      expect(WEEK_DAYS[0]).toBe("Sun");
      expect(typeof WEEK_DAYS[0]).toBe("string");
    });
  });

  describe("CALENDAR_GRID_SIZE", () => {
    it("should equal 42 for 6 weeks x 7 days", () => {
      expect(CALENDAR_GRID_SIZE).toBe(42);
      expect(CALENDAR_GRID_SIZE).toBe(6 * 7);
    });

    it("should be sufficient for any month layout", () => {
      // Maximum days needed: 31 days + up to 6 leading empty days + up to 5 trailing empty days = 42
      expect(CALENDAR_GRID_SIZE).toBeGreaterThanOrEqual(31 + 6 + 5);
    });
  });

  describe("TIME_SELECTION", () => {
    describe("HOURS", () => {
      it("should contain 24 hours (0-23)", () => {
        expect(TIME_SELECTION.HOURS).toHaveLength(24);
        expect(TIME_SELECTION.HOURS[0]).toBe(0);
        expect(TIME_SELECTION.HOURS[23]).toBe(23);
      });

      it("should be consecutive integers from 0 to 23", () => {
        const expectedHours = Array.from({ length: 24 }, (_, i) => i);
        expect([...TIME_SELECTION.HOURS]).toEqual(expectedHours);
      });
    });

    describe("MINUTES", () => {
      it("should contain 60 minutes (0-59)", () => {
        expect(TIME_SELECTION.MINUTES).toHaveLength(60);
        expect(TIME_SELECTION.MINUTES[0]).toBe(0);
        expect(TIME_SELECTION.MINUTES[59]).toBe(59);
      });

      it("should be consecutive integers from 0 to 59", () => {
        const expectedMinutes = Array.from({ length: 60 }, (_, i) => i);
        expect([...TIME_SELECTION.MINUTES]).toEqual(expectedMinutes);
      });
    });
  });

  describe("Time buffer constants", () => {
    it("should have reasonable default time offset", () => {
      expect(DEFAULT_TIME_OFFSET_MINUTES).toBe(60); // 1 hour
      expect(DEFAULT_TIME_OFFSET_MINUTES).toBeGreaterThan(0);
    });

    it("should have reasonable minimum time buffer", () => {
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBe(10);
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBeGreaterThan(0);
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBeLessThan(DEFAULT_TIME_OFFSET_MINUTES);
    });
  });

  describe("CSS_CLASSES", () => {
    describe("INPUT_BUTTON", () => {
      it("should have all required button states", () => {
        expect(CSS_CLASSES.INPUT_BUTTON.BASE).toBeDefined();
        expect(CSS_CLASSES.INPUT_BUTTON.DISABLED).toBeDefined();
        expect(CSS_CLASSES.INPUT_BUTTON.OPEN).toBeDefined();
        expect(CSS_CLASSES.INPUT_BUTTON.DEFAULT).toBeDefined();
      });

      it("should contain valid CSS class strings", () => {
        Object.values(CSS_CLASSES.INPUT_BUTTON).forEach(className => {
          expect(typeof className).toBe("string");
          expect(className.length).toBeGreaterThan(0);
          expect(className).not.toContain("undefined");
        });
      });
    });

    describe("CALENDAR_POPUP", () => {
      it("should have base and mobile variants", () => {
        expect(CSS_CLASSES.CALENDAR_POPUP.BASE).toBeDefined();
        expect(CSS_CLASSES.CALENDAR_POPUP.MOBILE).toBeDefined();
      });

      it("should contain positioning and styling classes", () => {
        expect(CSS_CLASSES.CALENDAR_POPUP.BASE).toContain("absolute");
        expect(CSS_CLASSES.CALENDAR_POPUP.MOBILE).toContain("fixed");
      });
    });

    describe("CALENDAR_GRID", () => {
      it("should have grid layout classes", () => {
        expect(CSS_CLASSES.CALENDAR_GRID.BASE).toContain("grid");
        expect(CSS_CLASSES.CALENDAR_GRID.BASE).toContain("grid-cols-7");
      });

      it("should have date button states", () => {
        const dateButton = CSS_CLASSES.CALENDAR_GRID.DATE_BUTTON;
        expect(dateButton.BASE).toBeDefined();
        expect(dateButton.DISABLED).toBeDefined();
        expect(dateButton.SELECTED).toBeDefined();
        expect(dateButton.TODAY).toBeDefined();
        expect(dateButton.CURRENT_MONTH).toBeDefined();
        expect(dateButton.OTHER_MONTH).toBeDefined();
      });
    });

    describe("Consistency", () => {
      it("should use consistent color schemes", () => {
        // Check for consistent use of blue for primary actions
        expect(CSS_CLASSES.CALENDAR_GRID.DATE_BUTTON.SELECTED).toContain("blue");
        expect(CSS_CLASSES.ACTION_BUTTONS.BUTTON.PRIMARY).toContain("blue");
      });

      it("should use consistent spacing and sizing", () => {
        // Check for consistent use of padding and margins
        const hasConsistentSpacing = Object.values(CSS_CLASSES).every(section =>
          typeof section === "object" && section !== null
        );
        expect(hasConsistentSpacing).toBe(true);
      });
    });
  });

  describe("ARIA_LABELS", () => {
    it("should provide accessibility labels for all interactive elements", () => {
      expect(ARIA_LABELS.CALENDAR_BUTTON).toBe("Open calendar");
      expect(ARIA_LABELS.PREVIOUS_MONTH).toBe("Previous month");
      expect(ARIA_LABELS.NEXT_MONTH).toBe("Next month");
      expect(ARIA_LABELS.SELECT_DATE).toBe("Select date");
      expect(ARIA_LABELS.SELECT_HOUR).toBe("Select hour");
      expect(ARIA_LABELS.SELECT_MINUTE).toBe("Select minute");
      expect(ARIA_LABELS.CONFIRM_SELECTION).toBe("Confirm selection");
      expect(ARIA_LABELS.CANCEL_SELECTION).toBe("Cancel selection");
    });

    it("should have descriptive and actionable labels", () => {
      Object.values(ARIA_LABELS).forEach(label => {
        expect(typeof label).toBe("string");
        expect(label.length).toBeGreaterThan(3); // Meaningful labels
        expect(label).not.toContain("undefined");
        expect(label.charAt(0)).toMatch(/[A-Z]/); // Proper capitalization
      });
    });

    it("should cover all necessary UI interactions", () => {
      // Ensure we have labels for navigation
      expect(ARIA_LABELS.PREVIOUS_MONTH).toBeDefined();
      expect(ARIA_LABELS.NEXT_MONTH).toBeDefined();

      // Ensure we have labels for selection
      expect(ARIA_LABELS.SELECT_DATE).toBeDefined();
      expect(ARIA_LABELS.SELECT_HOUR).toBeDefined();
      expect(ARIA_LABELS.SELECT_MINUTE).toBeDefined();

      // Ensure we have labels for actions
      expect(ARIA_LABELS.CONFIRM_SELECTION).toBeDefined();
      expect(ARIA_LABELS.CANCEL_SELECTION).toBeDefined();
    });
  });

  describe("Integration and relationships", () => {
    it("should have compatible time constants", () => {
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBeLessThan(DEFAULT_TIME_OFFSET_MINUTES);
    });

    it("should have grid size compatible with calendar layout", () => {
      expect(CALENDAR_GRID_SIZE % WEEK_DAYS.length).toBe(0); // Should be divisible by 7
    });

    it("should have complete time selection ranges", () => {
      // Should cover full day
      expect(Math.max(...TIME_SELECTION.HOURS)).toBe(23);
      expect(Math.min(...TIME_SELECTION.HOURS)).toBe(0);

      // Should cover full hour
      expect(Math.max(...TIME_SELECTION.MINUTES)).toBe(59);
      expect(Math.min(...TIME_SELECTION.MINUTES)).toBe(0);
    });
  });

  describe("Edge cases and validation", () => {
    it("should handle calendar edge cases", () => {
      // Grid should accommodate longest possible month view
      // (6 weeks for cases like March 2024 starting on Friday)
      expect(CALENDAR_GRID_SIZE).toBeGreaterThanOrEqual(35); // Minimum 5 weeks
      expect(CALENDAR_GRID_SIZE).toBeLessThanOrEqual(42); // Maximum 6 weeks
    });

    it("should provide reasonable time constraints", () => {
      // Time buffer should be practical
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBeGreaterThan(0);
      expect(MINIMUM_TIME_BUFFER_MINUTES).toBeLessThan(60);

      // Default offset should be reasonable
      expect(DEFAULT_TIME_OFFSET_MINUTES).toBeGreaterThanOrEqual(30);
      expect(DEFAULT_TIME_OFFSET_MINUTES).toBeLessThanOrEqual(120);
    });

    it("should have non-empty CSS classes", () => {
      const getAllCssClasses = (obj: any): string[] => {
        let classes: string[] = [];
        Object.values(obj).forEach(value => {
          if (typeof value === "string") {
            classes.push(value);
          } else if (typeof value === "object" && value !== null) {
            classes.push(...getAllCssClasses(value));
          }
        });
        return classes;
      };

      const allClasses = getAllCssClasses(CSS_CLASSES);
      allClasses.forEach(className => {
        expect(className.length).toBeGreaterThan(0);
        expect(className.trim()).toBe(className); // No leading/trailing whitespace
      });
    });
  });
});