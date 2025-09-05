/**
 * Utility for handling className concatenation and conditional classes
 */

export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean>;

/**
 * Combines class names with conditional logic
 * Similar to clsx but lightweight and tailored for our needs
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(' ');
}

/**
 * Creates a className builder with predefined base classes
 */
export function createClassNameBuilder(baseClasses: string) {
  return {
    base: baseClasses,
    extend: (additionalClasses: string) => cn(baseClasses, additionalClasses),
    conditional: (condition: boolean, trueClasses: string, falseClasses?: string) =>
      cn(baseClasses, condition ? trueClasses : falseClasses),
    variant: (variant: string, variants: Record<string, string>) =>
      cn(baseClasses, variants[variant]),
  };
}
