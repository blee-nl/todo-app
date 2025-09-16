import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Card, { CardProps } from '../Card';

// Mock the classNames utility
vi.mock('../../../utils/styles/classNames', () => ({
  cn: (...classes: (string | undefined | false)[]) =>
    classes.filter(Boolean).join(' ')
}));

describe('Card Component', () => {
  const renderCard = (props?: Partial<CardProps>) => {
    return render(
      <Card {...props}>
        <div data-testid="card-content">Card Content</div>
      </Card>
    );
  };

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      renderCard();

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toHaveTextContent('Card Content');
    });

    it('should render children content', () => {
      render(
        <Card>
          <h2>Card Title</h2>
          <p>Card description</p>
          <button>Action Button</button>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      renderCard({ className: 'custom-card-class' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('custom-card-class');
    });
  });

  describe('Base Classes', () => {
    it('should always include base classes', () => {
      renderCard();

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass(
        'bg-white',
        'rounded-2xl',
        'shadow-lg',
        'border',
        'border-gray-200',
        'p-4'
      );
    });
  });

  describe('Variants', () => {
    it('should apply default variant by default', () => {
      renderCard();

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('bg-white', 'border-gray-200');
      // Default variant has no additional border color classes
      expect(card).not.toHaveClass('border-green-200', 'border-red-200');
    });

    it('should apply default variant explicitly', () => {
      renderCard({ variant: 'default' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('bg-white', 'border-gray-200');
      expect(card).not.toHaveClass('border-green-200', 'border-red-200');
    });

    it('should apply active variant classes', () => {
      renderCard({ variant: 'active' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('border-green-200');
      expect(card).not.toHaveClass('border-red-200');
    });

    it('should apply overdue variant classes', () => {
      renderCard({ variant: 'overdue' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('border-red-200');
      expect(card).not.toHaveClass('border-green-200');
    });

    it('should apply failed variant classes', () => {
      renderCard({ variant: 'failed' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('border-red-200');
      expect(card).not.toHaveClass('border-green-200');
    });
  });

  describe('Hover Behavior', () => {
    it('should include hover classes by default', () => {
      renderCard();

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');
    });

    it('should include hover classes when hover is true', () => {
      renderCard({ hover: true });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');
    });

    it('should not include hover classes when hover is false', () => {
      renderCard({ hover: false });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).not.toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');
    });
  });

  describe('Complex Children Content', () => {
    it('should render complex JSX children', () => {
      render(
        <Card variant="active">
          <div className="card-header">
            <h3>Todo Item</h3>
            <span className="status">Active</span>
          </div>
          <div className="card-body">
            <p>Complete the project documentation</p>
            <div className="tags">
              <span>urgent</span>
              <span>work</span>
            </div>
          </div>
          <div className="card-footer">
            <button type="button">Edit</button>
            <button type="button">Delete</button>
          </div>
        </Card>
      );

      // Verify all nested content is rendered
      expect(screen.getByText('Todo Item')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Complete the project documentation')).toBeInTheDocument();
      expect(screen.getByText('urgent')).toBeInTheDocument();
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();

      // Verify card has active variant
      const card = screen.getByText('Todo Item').closest('div[class*="border-green-200"]');
      expect(card).toBeInTheDocument();
    });

    it('should handle text-only children', () => {
      render(<Card>Simple text content</Card>);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should handle multiple direct text nodes', () => {
      render(
        <Card>
          Text before
          <strong>bold text</strong>
          text after
        </Card>
      );

      // Use partial text matching for text nodes that might be split
      expect(screen.getByText(/Text before/)).toBeInTheDocument();
      expect(screen.getByText('bold text')).toBeInTheDocument();
      expect(screen.getByText(/text after/)).toBeInTheDocument();
    });
  });

  describe('Variant and Hover Combinations', () => {
    it('should combine active variant with hover effects', () => {
      renderCard({ variant: 'active', hover: true });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass(
        'border-green-200',
        'hover:shadow-md',
        'transition-all',
        'duration-200'
      );
    });

    it('should combine overdue variant without hover effects', () => {
      renderCard({ variant: 'overdue', hover: false });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('border-red-200');
      expect(card).not.toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');
    });

    it('should combine failed variant with custom className', () => {
      renderCard({
        variant: 'failed',
        hover: true,
        className: 'urgent-task'
      });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass(
        'border-red-200',
        'hover:shadow-md',
        'transition-all',
        'duration-200',
        'urgent-task'
      );
    });
  });

  describe('Accessibility', () => {
    it('should render as a div element by default', () => {
      renderCard();

      const card = screen.getByTestId('card-content').parentElement;
      expect(card?.tagName.toLowerCase()).toBe('div');
    });

    it('should support ARIA attributes through className or other means', () => {
      render(
        <Card className="aria-label-test">
          <div role="article" aria-labelledby="card-title">
            <h3 id="card-title">Article Title</h3>
            <p>Article content</p>
          </div>
        </Card>
      );

      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-labelledby', 'card-title');
      expect(screen.getByText('Article Title')).toHaveAttribute('id', 'card-title');
    });

    it('should be accessible for screen readers with proper content structure', () => {
      render(
        <Card variant="active">
          <h2>Task: Complete Documentation</h2>
          <p>Status: In Progress</p>
          <p>Due: Tomorrow</p>
        </Card>
      );

      // Content should be properly structured for screen readers
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Task: Complete Documentation');

      expect(screen.getByText('Status: In Progress')).toBeInTheDocument();
      expect(screen.getByText('Due: Tomorrow')).toBeInTheDocument();
    });
  });

  describe('CSS Class Composition', () => {
    it('should properly compose all classes in correct order', () => {
      renderCard({
        variant: 'active',
        hover: true,
        className: 'my-custom-class'
      });

      const card = screen.getByTestId('card-content').parentElement;

      // Should have base classes
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-lg', 'border', 'p-4');

      // Should have variant classes
      expect(card).toHaveClass('border-green-200');

      // Should have hover classes
      expect(card).toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');

      // Should have custom class
      expect(card).toHaveClass('my-custom-class');
    });

    it('should handle empty className gracefully', () => {
      renderCard({ className: '' });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-lg');
    });

    it('should handle undefined className gracefully', () => {
      renderCard({ className: undefined });

      const card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('bg-white', 'rounded-2xl', 'shadow-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle all variants with hover disabled', () => {
      const variants: Array<CardProps['variant']> = ['default', 'active', 'overdue', 'failed'];

      variants.forEach(variant => {
        const { unmount } = render(
          <Card variant={variant} hover={false}>
            <div data-testid={`card-${variant}`}>Content for {variant}</div>
          </Card>
        );

        const card = screen.getByTestId(`card-${variant}`).parentElement;
        expect(card).not.toHaveClass('hover:shadow-md', 'transition-all', 'duration-200');

        unmount();
      });
    });

    it('should handle boolean prop edge cases', () => {
      // Test explicit true
      const { unmount } = renderCard({ hover: true });
      let card = screen.getByTestId('card-content').parentElement;
      expect(card).toHaveClass('hover:shadow-md');

      unmount();

      // Test explicit false with a fresh render
      render(
        <Card hover={false}>
          <div data-testid="card-content-false">Content</div>
        </Card>
      );
      card = screen.getByTestId('card-content-false').parentElement;
      expect(card).not.toHaveClass('hover:shadow-md');
    });

    it('should maintain consistent styling with nested interactive elements', () => {
      render(
        <Card variant="active" hover={true}>
          <button data-testid="card-button">Click me</button>
          <input data-testid="card-input" type="text" placeholder="Type here" />
          <a data-testid="card-link" href="#test">Link</a>
        </Card>
      );

      const card = screen.getByTestId('card-button').closest('div[class*="border-green-200"]');
      expect(card).toHaveClass('hover:shadow-md');

      // Interactive elements should still be functional
      expect(screen.getByTestId('card-button')).toBeInTheDocument();
      expect(screen.getByTestId('card-input')).toBeInTheDocument();
      expect(screen.getByTestId('card-link')).toBeInTheDocument();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('should work as a todo item card', () => {
      render(
        <Card variant="active" hover={true} className="todo-card">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold">Complete project documentation</h3>
              <p className="text-gray-600">Due: Today at 5:00 PM</p>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-500">Edit</button>
              <button className="text-red-500">Delete</button>
            </div>
          </div>
        </Card>
      );

      const card = screen.getByText('Complete project documentation').closest('.todo-card');
      expect(card).toHaveClass('border-green-200', 'hover:shadow-md');
      expect(screen.getByText('Due: Today at 5:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should work as a dashboard widget', () => {
      render(
        <Card variant="default" hover={false} className="dashboard-widget">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">42</div>
            <div className="text-gray-500">Completed Tasks</div>
          </div>
        </Card>
      );

      const card = screen.getByText('42').closest('.dashboard-widget');
      expect(card).not.toHaveClass('hover:shadow-md');
      expect(card).toHaveClass('bg-white', 'rounded-2xl');
      expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    });

    it('should work as an alert/notification card', () => {
      render(
        <Card variant="failed" hover={true} className="alert-card">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">⚠️</div>
            <div>
              <h4 className="font-medium text-red-800">Task Failed</h4>
              <p className="text-red-600">Could not complete within deadline</p>
            </div>
          </div>
        </Card>
      );

      const card = screen.getByText('Task Failed').closest('.alert-card');
      expect(card).toHaveClass('border-red-200', 'hover:shadow-md');
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      expect(screen.getByText('Could not complete within deadline')).toBeInTheDocument();
    });
  });
});