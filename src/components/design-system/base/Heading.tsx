/**
 * Heading Component
 * 
 * Semantic heading component with consistent typography hierarchy.
 * Automatically applies appropriate font family and responsive sizing.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseComponentProps } from '../types';

const headingVariants = cva('font-heading tracking-tight', {
  variants: {
    level: {
      1: 'text-4xl md:text-5xl font-bold',
      2: 'text-3xl md:text-4xl font-bold',
      3: 'text-2xl md:text-3xl font-semibold',
      4: 'text-xl md:text-2xl font-semibold',
      5: 'text-lg md:text-xl font-medium',
      6: 'text-base md:text-lg font-medium',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      gradient: 'gradient-text',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
    },
  },
  defaultVariants: {
    level: 1,
    color: 'default',
    align: 'left',
  },
});

export interface HeadingProps
  extends BaseComponentProps,
    VariantProps<typeof headingVariants>,
    React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level (determines semantic HTML element) */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Text color variant */
  color?: VariantProps<typeof headingVariants>['color'];
  /** Text alignment */
  align?: VariantProps<typeof headingVariants>['align'];
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ 
    className,
    children,
    level = 1,
    color,
    align,
    ...props
  }, ref) => {
    const Component = `h${level}` as const;

    return (
      <Component
        ref={ref}
        className={cn(
          headingVariants({ level, color, align }),
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = 'Heading';