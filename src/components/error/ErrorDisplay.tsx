import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppError, ErrorSeverity, ErrorCategory } from '@/lib/error-types';
import { AlertTriangle, X, RefreshCcw, Info, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  error: AppError;
  onDismiss?: () => void;
  onRetry?: () => void;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onDismiss,
  onRetry,
  showDetails = false,
  compact = false,
  className,
}) => {
  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return <Info className="h-4 w-4" />;
      case ErrorSeverity.MEDIUM:
        return <AlertCircle className="h-4 w-4" />;
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'default';
      case ErrorSeverity.MEDIUM:
        return 'secondary';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getCategoryColor = () => {
    switch (error.category) {
      case ErrorCategory.NETWORK:
        return 'bg-blue-100 text-blue-800';
      case ErrorCategory.VALIDATION:
        return 'bg-yellow-100 text-yellow-800';
      case ErrorCategory.AUTHENTICATION:
        return 'bg-red-100 text-red-800';
      case ErrorCategory.NOT_FOUND:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <Alert variant={getSeverityVariant()} className={cn('relative', className)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            {getSeverityIcon()}
            <div className="min-w-0 flex-1">
              <AlertDescription className="text-sm">
                {error.userMessage || error.message}
              </AlertDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            {error.retryable && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="h-6 w-6 p-0"
              >
                <RefreshCcw className="h-3 w-3" />
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Card className={cn('relative', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {getSeverityIcon()}
            <CardTitle className="text-sm font-medium">
              {error.code ? `Erro ${error.code}` : 'Erro'}
            </CardTitle>
            <Badge variant="outline" className={getCategoryColor()}>
              {error.category}
            </Badge>
          </div>
          
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-6 w-6 p-0 -mt-1 -mr-1"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <p className="text-sm text-foreground">
          {error.userMessage || error.message}
        </p>

        {showDetails && (
          <details className="text-xs">
            <summary className="cursor-pointer font-medium text-muted-foreground mb-2">
              Detalhes técnicos
            </summary>
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              <div>
                <span className="font-medium">ID:</span> {error.id}
              </div>
              <div>
                <span className="font-medium">Timestamp:</span> {error.timestamp.toLocaleString()}
              </div>
              {error.context && Object.keys(error.context).length > 0 && (
                <div>
                  <span className="font-medium">Contexto:</span>
                  <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </div>
              )}
              {error.stack && (
                <div>
                  <span className="font-medium">Stack trace:</span>
                  <pre className="mt-1 bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {error.retryable && onRetry && (
          <div className="flex items-center gap-2 pt-2">
            <Button onClick={onRetry} variant="outline" size="sm">
              <RefreshCcw className="h-3 w-3 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Error list component
interface ErrorListProps {
  errors: AppError[];
  onDismiss?: (errorId: string) => void;
  onRetry?: (error: AppError) => void;
  onClearAll?: () => void;
  maxVisible?: number;
  showDetails?: boolean;
  className?: string;
}

export const ErrorList: React.FC<ErrorListProps> = ({
  errors,
  onDismiss,
  onRetry,
  onClearAll,
  maxVisible = 5,
  showDetails = false,
  className,
}) => {
  const visibleErrors = errors.slice(0, maxVisible);
  const hiddenCount = Math.max(0, errors.length - maxVisible);

  if (errors.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          Erros ({errors.length})
        </h3>
        {onClearAll && errors.length > 0 && (
          <Button onClick={onClearAll} variant="ghost" size="sm">
            Limpar todos
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {visibleErrors.map((error) => (
          <ErrorDisplay
            key={error.id}
            error={error}
            onDismiss={onDismiss ? () => onDismiss(error.id) : undefined}
            onRetry={onRetry ? () => onRetry(error) : undefined}
            showDetails={showDetails}
            compact={true}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="text-center">
          <Badge variant="secondary">
            +{hiddenCount} erro{hiddenCount !== 1 ? 's' : ''} oculto{hiddenCount !== 1 ? 's' : ''}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;