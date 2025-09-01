import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant?: 'skeleton' | 'spinner' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  lines?: number;
  className?: string;
  text?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  variant = 'skeleton',
  size = 'md',
  lines = 3,
  className,
  text
}) => {
  if (variant === 'spinner') {
    const spinnerSize = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    }[size];

    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={cn('animate-spin text-muted-foreground', spinnerSize)} />
          {text && <p className="text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-muted rounded h-4 w-full mb-2" />
        <div className="bg-muted rounded h-4 w-3/4 mb-2" />
        <div className="bg-muted rounded h-4 w-1/2" />
      </div>
    );
  }

  const lineHeight = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  }[size];

  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          className={cn(
            lineHeight,
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )} 
        />
      ))}
    </div>
  );
};