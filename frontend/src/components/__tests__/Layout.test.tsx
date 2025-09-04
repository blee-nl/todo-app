import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Layout from "../Layout";

describe("Layout", () => {
  it("should render children", () => {
    render(
      <Layout>
        <div data-testid="test-content">Test Content</div>
      </Layout>
    );

    expect(screen.getByTestId("test-content")).toBeInTheDocument();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should have correct CSS classes", () => {
    const { container } = render(
      <Layout>
        <div>Test</div>
      </Layout>
    );

    const layoutElement = container.firstChild as HTMLElement;
    expect(layoutElement).toHaveClass("h-screen", "flex", "bg-gray-50");
  });

  it("should render multiple children", () => {
    render(
      <Layout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </Layout>
    );

    expect(screen.getByTestId("child-1")).toBeInTheDocument();
    expect(screen.getByTestId("child-2")).toBeInTheDocument();
    expect(screen.getByTestId("child-3")).toBeInTheDocument();
  });
});
