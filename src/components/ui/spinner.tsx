import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'muted' | 'white';
  withText?: boolean;
  text?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4', 
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const variantClasses = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  muted: 'text-muted-foreground',
  white: 'text-white',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  variant = 'primary',
  withText = false,
  text = 'Carregando...',
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        withText && 'gap-2',
        className
      )}
      role="status"
      aria-label={text}
      {...props}
    >
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {withText && (
        <span className={cn(
          'text-sm font-medium',
          variantClasses[variant]
        )}>
          {text}
        </span>
      )}
    </div>
  );
};