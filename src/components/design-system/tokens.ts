/**
 * Design System Tokens
 * 
 * Centralized design tokens that define the visual language of the application.
 * All components should use these tokens instead of hardcoded values.
 */

// Color system
export const colors = {
  // Brand colors
  primary: {
    50: 'hsl(290 100% 95%)',
    100: 'hsl(285 100% 90%)',
    200: 'hsl(280 100% 85%)',
    300: 'hsl(275 100% 80%)',
    400: 'hsl(270 100% 75%)',
    500: 'hsl(275 100% 75%)', // Main brand color
    600: 'hsl(270 100% 70%)',
    700: 'hsl(265 100% 65%)',
    800: 'hsl(260 100% 60%)',
    900: 'hsl(255 100% 55%)',
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  
  // Semantic colors
  semantic: {
    success: 'hsl(var(--success))',
    warning: 'hsl(var(--warning))',
    error: 'hsl(var(--destructive))',
    info: 'hsl(var(--info))',
  },
  
  // Neutral colors
  neutral: {
    background: 'hsl(var(--background))',
    foreground: 'hsl(var(--foreground))',
    muted: 'hsl(var(--muted))',
    'muted-foreground': 'hsl(var(--muted-foreground))',
    border: 'hsl(var(--border))',
    accent: 'hsl(var(--accent))',
  }
} as const;

// Typography system
export const typography = {
  // Font families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    heading: ['League Spartan', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  },
  
  // Font sizes with responsive scaling
  fontSize: {
    xs: 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
    sm: 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
    base: 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
    lg: 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
    xl: 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
    '2xl': 'clamp(1.5rem, 1.3rem + 1vw, 1.875rem)',
    '3xl': 'clamp(1.875rem, 1.6rem + 1.375vw, 2.25rem)',
    '4xl': 'clamp(2.25rem, 1.9rem + 1.75vw, 3rem)',
    '5xl': 'clamp(3rem, 2.5rem + 2.5vw, 4rem)',
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: '1.2',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  }
} as const;

// Spacing system (8px grid)
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px
  
  // Semantic spacing
  section: 'var(--spacing-section)',    // 64px
  element: 'var(--spacing-element)',    // 24px
  component: 'var(--spacing-component)', // 16px
} as const;

// Border radius system
export const radius = {
  none: '0',
  sm: 'var(--radius-sm)',     // 8px
  DEFAULT: 'var(--radius)',    // 16px
  lg: 'var(--radius-lg)',     // 24px
  full: '9999px',
} as const;

// Shadow system
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: 'var(--shadow-card)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  elevated: 'var(--shadow-elevated)',
  glow: 'var(--shadow-glow)',
  hover: 'var(--shadow-hover)',
} as const;

// Animation and transition system
export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },
  
  // Timing functions
  ease: {
    smooth: 'var(--transition-smooth)',
    bounce: 'var(--transition-bounce)',
    'ease-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
    'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Common animations
  keyframes: {
    'fade-in': 'fade-in 0.6s ease-out forwards',
    'scale-in': 'scale-in 0.4s ease-out forwards',
    'slide-in-right': 'slide-in-right 0.6s ease-out forwards',
    'hover-lift': 'transform translateY(-2px)',
  }
} as const;

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Z-index scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Component variants
export const componentVariants = {
  // Size variants
  size: {
    xs: 'xs',
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  },
  
  // Color variants
  variant: {
    default: 'default',
    primary: 'primary',
    secondary: 'secondary',
    outline: 'outline',
    ghost: 'ghost',
    link: 'link',
    gradient: 'gradient',
    destructive: 'destructive',
  },
  
  // State variants
  state: {
    default: 'default',
    loading: 'loading',
    success: 'success',
    error: 'error',
    disabled: 'disabled',
  }
} as const;