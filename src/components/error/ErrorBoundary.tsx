import React, { Component, ReactNode } from 'react';
import { AppErrorFactory, ErrorCategory, ErrorSeverity } from '@/lib/error-types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw, AlertTriangle, Bug, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorBoundaryFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  resetKeys?: Array<string | number>;
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
}

export interface ErrorBoundaryFallbackProps {
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  resetError: () => void;
  retryCount: number;
  level: 'page' | 'component' | 'critical';
}

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Create structured error
    const appError = AppErrorFactory.fromJavaScriptError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      level: this.props.level || 'component',
      retryCount: this.state.retryCount,
    });

    this.setState({ errorInfo });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Log error details
    console.error('[Error Boundary] Caught error:', {
      error,
      errorInfo,
      appError,
      level: this.props.level,
    });

    // Report critical errors
    if (this.props.level === 'critical') {
      this.reportCriticalError(appError, error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    // Reset on prop changes if enabled
    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetError();
    }

    // Reset when resetKeys change
    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasResetKeyChanged = resetKeys.some((key, index) => 
        key !== prevProps.resetKeys![index]
      );
      
      if (hasResetKeyChanged) {
        this.resetError();
      }
    }
  }

  private reportCriticalError = (appError: any, error: Error, errorInfo: React.ErrorInfo) => {
    // This could integrate with error reporting services
    console.error('[CRITICAL ERROR]', {
      appError,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  };

  private resetError = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleRetry = () => {
    this.resetError();
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, level = 'component' } = this.props;

      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            resetError={this.resetError}
            retryCount={this.state.retryCount}
            level={level}
          />
        );
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          retryCount={this.state.retryCount}
          level={level}
        />
      );
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  errorInfo,
  resetError,
  retryCount,
  level,
}) => {
  const isCritical = level === 'critical';
  const isPage = level === 'page';
  const maxRetries = 3;
  const canRetry = retryCount < maxRetries;

  const getErrorTitle = () => {
    if (isCritical) return 'Erro Crítico da Aplicação';
    if (isPage) return 'Erro na Página';
    return 'Algo deu errado';
  };

  const getErrorDescription = () => {
    if (isCritical) {
      return 'Um erro crítico ocorreu que afeta toda a aplicação. Por favor, recarregue a página.';
    }
    if (isPage) {
      return 'Ocorreu um erro ao carregar esta página. Você pode tentar novamente ou voltar ao início.';
    }
    return 'Este componente encontrou um erro inesperado. Você pode tentar recarregar.';
  };

  const containerClassName = cn(
    'flex items-center justify-center p-6',
    isCritical && 'min-h-screen bg-background',
    isPage && 'min-h-[50vh]',
    !isCritical && !isPage && 'min-h-[200px]'
  );

  return (
    <div className={containerClassName}>
      <Card className={cn('w-full max-w-lg', isCritical && 'border-destructive')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            {isCritical ? <AlertTriangle className="h-5 w-5" /> : <Bug className="h-5 w-5" />}
            {getErrorTitle()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant={isCritical ? 'destructive' : 'default'}>
            <AlertDescription>{getErrorDescription()}</AlertDescription>
          </Alert>

          {/* Error details (only in development) */}
          {process.env.NODE_ENV === 'development' && error && (
            <details className="text-sm">
              <summary className="cursor-pointer font-medium text-muted-foreground mb-2">
                Detalhes técnicos (desenvolvimento)
              </summary>
              <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-32">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          {/* Retry info */}
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Tentativas: {retryCount}/{maxRetries}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            {canRetry && (
              <Button onClick={resetError} variant="default" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            
            {isCritical || !canRetry ? (
              <Button onClick={() => window.location.reload()} variant="default" size="sm">
                <RefreshCcw className="h-4 w-4 mr-2" />
                Recarregar Página
              </Button>
            ) : null}

            {isPage && (
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline" 
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Ir ao Início
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Component-level error boundary
export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">
    {children}
  </ErrorBoundary>
);

// Page-level error boundary
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page">
    {children}
  </ErrorBoundary>
);

// Critical-level error boundary
export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical">
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;