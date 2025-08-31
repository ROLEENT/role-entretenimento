import React from 'react';
import { cn } from '@/lib/utils';
import { Spinner } from './spinner';

interface LoadingOverlayProps {
  isVisible: boolean;
  text?: string;
  variant?: 'backdrop' | 'transparent' | 'solid';
  blur?: boolean;
  spinnerSize?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  text = 'Carregando...',
  variant = 'backdrop',
  blur = true,
  spinnerSize = 'lg',
  className,
  children,
}) => {
  if (!isVisible) return null;

  const variantClasses = {
    backdrop: 'bg-background/80',
    transparent: 'bg-transparent',
    solid: 'bg-background',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        variantClasses[variant],
        blur && 'backdrop-blur-sm',
        'animate-fade-in',
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label={text}
    >
      <div className="flex flex-col items-center space-y-4 p-6 rounded-lg bg-card border shadow-lg animate-scale-in">
        <Spinner size={spinnerSize} variant="primary" />
        <p className="text-sm text-muted-foreground font-medium">
          {text}
        </p>
        {children}
      </div>
    </div>
  );
};

// Component-level loading overlay
export const ComponentLoadingOverlay: React.FC<{
  isVisible: boolean;
  text?: string;
  className?: string;
}> = ({ isVisible, text = 'Carregando...', className }) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-10 flex items-center justify-center',
        'bg-background/50 backdrop-blur-sm rounded-md',
        'animate-fade-in',
        className
      )}
    >
      <Spinner size="md" withText text={text} />
    </div>
  );
};

// Inline loading component
export const InlineLoading: React.FC<{
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ text = 'Carregando...', size = 'sm', className }) => (
  <div className={cn('flex items-center justify-center py-4', className)}>
    <Spinner size={size} withText text={text} />
  </div>
);