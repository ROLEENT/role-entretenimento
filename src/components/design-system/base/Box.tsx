/**
 * Box Component
 * 
 * The most fundamental layout component. All other components build upon Box.
 * Provides consistent spacing, sizing, and layout utilities.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseComponentProps, LayoutProps } from '../types';

const boxVariants = cva('', {
  variants: {
    display: {
      block: 'block',
      'inline-block': 'inline-block',
      inline: 'inline',
      flex: 'flex',
      'inline-flex': 'inline-flex',
      grid: 'grid',
      'inline-grid': 'inline-grid',
      none: 'hidden',
    },
    position: {
      static: 'static',
      relative: 'relative',
      absolute: 'absolute',
      fixed: 'fixed',
      sticky: 'sticky',
    },
    overflow: {
      visible: 'overflow-visible',
      hidden: 'overflow-hidden',
      scroll: 'overflow-scroll',
      auto: 'overflow-auto',
    },
  },
  defaultVariants: {
    display: 'block',
    position: 'static',
    overflow: 'visible',
  },
});

export interface BoxProps 
  extends BaseComponentProps, 
    LayoutProps,
    VariantProps<typeof boxVariants>,
    React.HTMLAttributes<HTMLDivElement> {
  /** HTML element to render as */
  as?: React.ElementType;
}

export const Box = React.forwardRef<HTMLDivElement, BoxProps>(
  ({ 
    className, 
    children, 
    as: Component = 'div', 
    display,
    position,
    overflow,
    padding,
    margin,
    width,
    height,
    maxWidth,
    ...props 
  }, ref) => {
    // Convert spacing props to classes
    const spacingClasses = cn(
      padding && `p-${padding}`,
      margin && `m-${margin}`,
    );

    // Convert size props to inline styles for dynamic values
    const sizeStyles: React.CSSProperties = {};
    if (width) sizeStyles.width = width;
    if (height) sizeStyles.height = height;
    if (maxWidth) sizeStyles.maxWidth = maxWidth;

    return (
      <Component
        ref={ref}
        className={cn(
          boxVariants({ display, position, overflow }),
          spacingClasses,
          className
        )}
        style={sizeStyles}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Box.displayName = 'Box';