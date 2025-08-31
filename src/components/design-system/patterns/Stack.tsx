/**
 * Stack Pattern
 * 
 * Flexible container for arranging items in a column or row with consistent spacing.
 * Replaces manual flexbox configurations with semantic spacing.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils';
import type { BaseComponentProps, SpacingScale, ResponsiveValue } from '../types';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      column: 'flex-col',
      row: 'flex-row',
      'column-reverse': 'flex-col-reverse',
      'row-reverse': 'flex-row-reverse',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
    wrap: {
      nowrap: 'flex-nowrap',
      wrap: 'flex-wrap',
      'wrap-reverse': 'flex-wrap-reverse',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      5: 'gap-5',
      6: 'gap-6',
      8: 'gap-8',
      10: 'gap-10',
      12: 'gap-12',
      16: 'gap-16',
      20: 'gap-20',
      24: 'gap-24',
      32: 'gap-32',
    },
  },
  defaultVariants: {
    direction: 'column',
    align: 'stretch',
    justify: 'start',
    wrap: 'nowrap',
    gap: 4,
  },
});

export interface StackProps
  extends BaseComponentProps,
    React.HTMLAttributes<HTMLDivElement> {
  /** Stack direction */
  direction?: 'column' | 'row' | 'column-reverse' | 'row-reverse';
  /** Align items */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  /** Justify content */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  /** Flex wrap */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Gap between items */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32;
  /** HTML element to render as */
  as?: React.ElementType;
  /** Divider between items */
  divider?: React.ReactNode;
}

export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className,
    children,
    direction,
    align,
    justify,
    wrap,
    gap,
    as: Component = 'div',
    divider,
    ...props
  }, ref) => {
    // Handle simple string/number props
    const directionClass = direction || 'column';
    const alignClass = align || 'stretch';
    const justifyClass = justify || 'start';
    const wrapClass = wrap || 'nowrap';

    const childrenArray = React.Children.toArray(children);
    
    return (
      <Component
        ref={ref}
        className={cn(
          stackVariants({
            direction: directionClass,
            align: alignClass,
            justify: justifyClass,
            wrap: wrapClass,
            gap,
          }),
          className
        )}
        {...props}
      >
        {divider
          ? childrenArray.map((child, index) => (
              <React.Fragment key={index}>
                {child}
                {index < childrenArray.length - 1 && divider}
              </React.Fragment>
            ))
          : children
        }
      </Component>
    );
  }
);

Stack.displayName = 'Stack';

// Convenience components
export const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="column" {...props} />
);

export const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack ref={ref} direction="row" {...props} />
);

VStack.displayName = 'VStack';
HStack.displayName = 'HStack';