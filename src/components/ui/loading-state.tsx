import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  loadingClassName?: string;
  delay?: number; // Delay before showing loading state (prevents flicker)
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  skeleton,
  fallback,
  className,
  loadingClassName,
  delay = 100,
}) => {
  const [showLoading, setShowLoading] = React.useState(false);

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLoading && delay > 0) {
      timeout = setTimeout(() => setShowLoading(true), delay);
    } else {
      setShowLoading(isLoading);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
      if (!isLoading) setShowLoading(false);
    };
  }, [isLoading, delay]);

  if (showLoading) {
    return (
      <div className={cn('animate-fade-in', loadingClassName)}>
        {skeleton || fallback || <Skeleton className="h-20 w-full" />}
      </div>
    );
  }

  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  );
};

// Predefined loading states for common components
export const LoadingCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 border rounded-lg space-y-3 animate-pulse', className)}>
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export const LoadingList: React.FC<{ 
  items?: number; 
  className?: string; 
}> = ({ items = 3, className }) => (
  <div className={cn('space-y-3', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3 border rounded animate-pulse">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const LoadingTable: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('space-y-3', className)}>
    {/* Header */}
    <div className="grid gap-4 p-3 border-b animate-pulse" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <Skeleton key={index} className="h-4" />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div 
        key={rowIndex} 
        className="grid gap-4 p-3 border-b animate-pulse"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-3" />
        ))}
      </div>
    ))}
  </div>
);

// HOC for adding loading states to any component
export function withLoadingState<P extends object>(
  Component: React.ComponentType<P>,
  LoadingSkeleton?: React.ComponentType
) {
  return React.forwardRef<any, P & { isLoading?: boolean }>((props, ref) => {
    const { isLoading, ...componentProps } = props;

    if (isLoading) {
      return LoadingSkeleton ? <LoadingSkeleton /> : <Skeleton className="h-20 w-full" />;
    }

    return <Component ref={ref} {...(componentProps as P)} />;
  });
}