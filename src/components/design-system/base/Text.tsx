/**
 * Text Component
 * 
 * Standardized text component with consistent typography scale.
 * Handles responsive text sizing and semantic color variants.
 */

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseComponentProps, TypographyProps } from '../types';

const textVariants = cva('', {
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
      '5xl': 'text-5xl',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
    color: {
      default: 'text-foreground',
      muted: 'text-muted-foreground',
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      success: 'text-success',
      warning: 'text-warning',
      destructive: 'text-destructive',
      info: 'text-info',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    lineHeight: {
      tight: 'leading-tight',
      snug: 'leading-snug',
      normal: 'leading-normal',
      relaxed: 'leading-relaxed',
      loose: 'leading-loose',
    },
    decoration: {
      none: 'no-underline',
      underline: 'underline',
      'line-through': 'line-through',
    },
    transform: {
      none: '',
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      capitalize: 'capitalize',
    },
  },
  defaultVariants: {
    size: 'base',
    weight: 'normal',
    color: 'default',
    align: 'left',
    lineHeight: 'normal',
    decoration: 'none',
    transform: 'none',
  },
});

export interface TextProps
  extends BaseComponentProps,
    VariantProps<typeof textVariants>,
    React.HTMLAttributes<HTMLElement> {
  /** HTML element to render as */
  as?: 'p' | 'span' | 'div' | 'label' | 'strong' | 'em' | 'small' | 'code';
  /** Text size variant */
  size?: VariantProps<typeof textVariants>['size'];
  /** Font weight */
  weight?: VariantProps<typeof textVariants>['weight'];
  /** Text color */
  color?: VariantProps<typeof textVariants>['color'];
  /** Text alignment */
  align?: VariantProps<typeof textVariants>['align'];
  /** Line height */
  lineHeight?: VariantProps<typeof textVariants>['lineHeight'];
  /** Text decoration */
  decoration?: VariantProps<typeof textVariants>['decoration'];
  /** Text transform */
  transform?: VariantProps<typeof textVariants>['transform'];
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Maximum number of lines to show */
  lineClamp?: number;
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ 
    className,
    children,
    as: Component = 'p',
    size,
    weight,
    color,
    align,
    lineHeight,
    decoration,
    transform,
    truncate,
    lineClamp,
    ...props
  }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(
          textVariants({
            size,
            weight,
            color,
            align,
            lineHeight,
            decoration,
            transform,
          }),
          truncate && 'truncate',
          lineClamp && `line-clamp-${lineClamp}`,
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';