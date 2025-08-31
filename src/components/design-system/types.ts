/**
 * Design System Types
 * 
 * TypeScript definitions for design system components and patterns.
 */

import { type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes, type ReactNode } from 'react';

// Base component props that all components should extend
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Children elements */
  children?: ReactNode;
  /** Test ID for testing */
  'data-testid'?: string;
}

// Common size variants
export type SizeVariant = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Common color variants
export type ColorVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'outline' 
  | 'ghost' 
  | 'link' 
  | 'gradient' 
  | 'destructive'
  | 'success'
  | 'warning'
  | 'info'
  | 'muted';

// State variants
export type StateVariant = 'default' | 'loading' | 'success' | 'error' | 'disabled';

// Spacing scale type
export type SpacingScale = 
  | 0 | 'px' | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24 | 32
  | 'section' | 'element' | 'component';

// Animation duration type
export type AnimationDuration = 'fast' | 'normal' | 'slow' | 'slower';

// Responsive values
export type ResponsiveValue<T> = T | {
  default?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
};

// Interactive element props
export interface InteractiveProps {
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Click handler */
  onClick?: () => void | Promise<void>;
}

// Form element props
export interface FormElementProps {
  /** Element name */
  name?: string;
  /** Element ID */
  id?: string;
  /** Required field */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Placeholder text */
  placeholder?: string;
}

// Layout props
export interface LayoutProps {
  /** Padding */
  padding?: ResponsiveValue<SpacingScale>;
  /** Margin */
  margin?: ResponsiveValue<SpacingScale>;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Maximum width */
  maxWidth?: string | number;
}

// Typography props
export interface TypographyProps {
  /** Font size */
  fontSize?: keyof typeof import('./tokens').typography.fontSize;
  /** Font weight */
  fontWeight?: keyof typeof import('./tokens').typography.fontWeight;
  /** Line height */
  lineHeight?: keyof typeof import('./tokens').typography.lineHeight;
  /** Text alignment */
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  /** Text color */
  color?: ColorVariant;
}

// Animation props
export interface AnimationProps {
  /** Animation name */
  animation?: string;
  /** Animation duration */
  duration?: AnimationDuration;
  /** Animation delay */
  delay?: number;
  /** Animation direction */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

// Card component props
export interface CardProps extends BaseComponentProps, LayoutProps {
  /** Card variant */
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  /** Interactive card */
  interactive?: boolean;
  /** Hover effects */
  hover?: boolean;
}

// Button component props
export interface ButtonProps extends BaseComponentProps, InteractiveProps {
  /** Button variant */
  variant?: ColorVariant;
  /** Button size */
  size?: SizeVariant;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon only button */
  iconOnly?: boolean;
  /** Icon position */
  iconPosition?: 'left' | 'right';
}

// Input component props
export interface InputProps extends BaseComponentProps, FormElementProps {
  /** Input variant */
  variant?: 'default' | 'outlined' | 'filled';
  /** Input size */
  size?: SizeVariant;
  /** Input type */
  type?: string;
  /** Input value */
  value?: string;
  /** Change handler */
  onChange?: (value: string) => void;
}

// Modal component props
export interface ModalProps extends BaseComponentProps {
  /** Modal open state */
  open?: boolean;
  /** Close handler */
  onClose?: () => void;
  /** Modal size */
  size?: SizeVariant;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
}

// Toast notification props
export interface ToastProps extends BaseComponentProps {
  /** Toast variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /** Toast duration */
  duration?: number;
  /** Auto dismiss */
  autoDismiss?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
}

// Navigation props
export interface NavigationProps extends BaseComponentProps {
  /** Navigation items */
  items?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    badge?: string | number;
  }>;
  /** Navigation orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Active item key */
  activeKey?: string;
}

// Grid system props
export interface GridProps extends BaseComponentProps, LayoutProps {
  /** Number of columns */
  columns?: ResponsiveValue<number>;
  /** Grid gap */
  gap?: SpacingScale;
  /** Grid items alignment */
  align?: 'start' | 'center' | 'end' | 'stretch';
  /** Grid items justification */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

// Flex system props
export interface FlexProps extends BaseComponentProps, LayoutProps {
  /** Flex direction */
  direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
  /** Flex wrap */
  wrap?: ResponsiveValue<'nowrap' | 'wrap' | 'wrap-reverse'>;
  /** Align items */
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /** Justify content */
  justify?: ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  /** Gap between items */
  gap?: SpacingScale;
}