import React from 'react';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'muted' | 'white';
  className?: string;
  text?: string;
}

// Legacy component for backward compatibility
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'lg',
  variant = 'primary',
  className,
  text,
}) => {
  return (
    <div className={cn('flex items-center justify-center p-8', className)}>
      <Spinner 
        size={size}
        variant={variant}
        withText={!!text}
        text={text}
      />
    </div>
  );
};