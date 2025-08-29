import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({ 
  message = 'Algo deu errado', 
  onRetry,
  className = ''
}: ErrorStateProps) => {
  return (
    <div className={`error-state ${className}`} role="alert">
      <Card className="max-w-md mx-auto p-6 text-center shadow-card">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" aria-hidden="true" />
        <h3 className="text-heading-3 mb-2">Ops!</h3>
        <p className="error-message text-subtitle">{message}</p>
        {onRetry && (
          <Button 
            onClick={onRetry}
            className="mt-4 focus-visible"
            aria-label="Tentar novamente"
          >
            <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
            Tentar de novo
          </Button>
        )}
      </Card>
    </div>
  );
};

interface LoadingStateProps {
  count?: number;
  className?: string;
}

export const EventCardSkeleton = ({ className = '' }: { className?: string }) => {
  return (
    <Card className={`overflow-hidden shadow-card ${className}`}>
      <div className="aspect-[3/2] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
          <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-muted animate-pulse rounded w-full" />
          <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted animate-pulse rounded w-16" />
          <div className="h-6 bg-muted animate-pulse rounded w-20" />
        </div>
      </div>
    </Card>
  );
};

export const LoadingState = ({ count = 6, className = '' }: LoadingStateProps) => {
  return (
    <div 
      className={`accessible-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      role="status"
      aria-label="Carregando eventos"
    >
      {Array.from({ length: count }, (_, i) => (
        <EventCardSkeleton key={i} />
      ))}
    </div>
  );
};