/**
 * Design System Utilities
 * 
 * Helper functions and utilities for working with the design system.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { spacing, breakpoints } from './tokens';
import type { ResponsiveValue, SpacingScale } from './types';

/**
 * Combines class names with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts spacing scale to Tailwind class
 */
export function getSpacingClass(type: 'p' | 'm', scale: SpacingScale): string {
  if (typeof scale === 'string' && ['section', 'element', 'component'].includes(scale)) {
    return `${type}-[var(--spacing-${scale})]`;
  }
  return `${type}-${scale}`;
}

/**
 * Generates responsive classes for a property
 */
export function getResponsiveClasses<T>(
  property: string,
  value: ResponsiveValue<T>,
  transformer?: (val: T) => string
): string {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    const val = transformer ? transformer(value as T) : String(value);
    return `${property}-${val}`;
  }

  const classes: string[] = [];
  const responsiveObj = value as { [key: string]: T };
  
  if ('default' in responsiveObj && responsiveObj.default !== undefined) {
    const val = transformer ? transformer(responsiveObj.default) : String(responsiveObj.default);
    classes.push(`${property}-${val}`);
  }

  Object.entries(breakpoints).forEach(([breakpoint, _]) => {
    const breakpointValue = responsiveObj[breakpoint];
    if (breakpointValue !== undefined) {
      const val = transformer ? transformer(breakpointValue) : String(breakpointValue);
      classes.push(`${breakpoint}:${property}-${val}`);
    }
  });

  return classes.join(' ');
}

/**
 * Generates grid column classes
 */
export function getGridColumns(columns: ResponsiveValue<number>): string {
  return getResponsiveClasses('grid-cols', columns);
}

/**
 * Generates flex direction classes
 */
export function getFlexDirection(
  direction: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>
): string {
  return getResponsiveClasses('flex', direction);
}

/**
 * Creates consistent focus styles
 */
export function focusStyles(): string {
  return cn(
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background'
  );
}

/**
 * Creates consistent hover styles for interactive elements
 */
export function hoverStyles(): string {
  return cn(
    'transition-all',
    'duration-300',
    'hover:-translate-y-0.5',
    'hover:shadow-hover'
  );
}

/**
 * Creates loading state styles
 */
export function loadingStyles(): string {
  return cn(
    'opacity-70',
    'cursor-not-allowed',
    'pointer-events-none'
  );
}

/**
 * Creates disabled state styles
 */
export function disabledStyles(): string {
  return cn(
    'opacity-50',
    'cursor-not-allowed',
    'pointer-events-none'
  );
}

/**
 * Creates animation delay utility
 */
export function animationDelay(delay: number): Record<string, string> {
  return {
    animationDelay: `${delay}ms`,
  };
}

/**
 * Creates responsive container styles
 */
export function containerStyles(): string {
  return cn(
    'mx-auto',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    'max-w-7xl'
  );
}

/**
 * Creates card interaction styles
 */
export function cardInteractionStyles(): string {
  return cn(
    'transition-all',
    'duration-300',
    'hover:shadow-hover',
    'hover:-translate-y-1',
    'active:scale-95',
    focusStyles()
  );
}

/**
 * Creates button interaction styles
 */
export function buttonInteractionStyles(): string {
  return cn(
    'transition-all',
    'duration-300',
    'active:scale-95',
    focusStyles()
  );
}

/**
 * Validates component props at runtime (development only)
 */
export function validateProps<T extends Record<string, any>>(
  props: T,
  validKeys: (keyof T)[],
  componentName: string
): void {
  if (process.env.NODE_ENV === 'development') {
    const invalidProps = Object.keys(props).filter(
      key => !validKeys.includes(key as keyof T)
    );
    
    if (invalidProps.length > 0) {
      console.warn(
        `[${componentName}] Invalid props detected: ${invalidProps.join(', ')}`
      );
    }
  }
}

/**
 * Creates type-safe variant combinations
 */
export function createVariantMatcher<T extends Record<string, any>>(
  variants: T
) {
  return function matchVariant<K extends keyof T>(
    key: K,
    value: T[K]
  ): boolean {
    return variants[key] === value;
  };
}

/**
 * Generates component test IDs
 */
export function createTestId(component: string, variant?: string): string {
  return variant ? `${component}-${variant}` : component;
}

/**
 * Creates consistent elevation shadows
 */
export function elevationShadow(level: 1 | 2 | 3 | 4 | 5): string {
  const shadows = {
    1: 'shadow-sm',
    2: 'shadow',
    3: 'shadow-md',
    4: 'shadow-lg',
    5: 'shadow-xl',
  };
  return shadows[level];
}

/**
 * Creates truncated text with tooltip-ready title
 */
export function truncateText(text: string, maxLength: number): {
  truncated: string;
  isTruncated: boolean;
  title?: string;
} {
  if (text.length <= maxLength) {
    return { truncated: text, isTruncated: false };
  }
  
  return {
    truncated: `${text.slice(0, maxLength)}...`,
    isTruncated: true,
    title: text,
  };
}