import React from 'react';
import { cn } from '@/lib/utils';

type ChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  as?: 'button' | 'a' | 'span';
  href?: string;
};

export default function Chip({ 
  active, 
  as = 'button', 
  href, 
  className = '', 
  children,
  ...rest 
}: ChipProps) {
  const baseClasses = cn(
    'inline-flex items-center h-8 px-3 rounded-full text-sm border transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    active
      ? 'bg-foreground text-background border-foreground'
      : 'bg-background text-foreground border-border hover:bg-muted',
    className
  );
  
  if (as === 'a') {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }
  
  if (as === 'span') {
    return (
      <span className={baseClasses}>
        {children}
      </span>
    );
  }
  
  return (
    <button className={baseClasses} {...rest}>
      {children}
    </button>
  );
}