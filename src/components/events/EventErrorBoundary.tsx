import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface EventErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

class EventErrorBoundary extends React.Component<EventErrorBoundaryProps, EventErrorBoundaryState> {
  constructor(props: EventErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): EventErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 EventErrorBoundary caught an error:', {
      error,
      errorInfo,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} retry={this.handleRetry} />;
      }

      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro no Componente de Evento</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p>Ocorreu um erro inesperado:</p>
              <code className="block bg-destructive/10 p-2 rounded text-sm">
                {this.state.error?.message || 'Erro desconhecido'}
              </code>
              
              {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Detalhes técnicos (desenvolvimento)
                  </summary>
                  <pre className="mt-2 bg-destructive/5 p-2 rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={this.handleRetry}
                className="mt-2"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Hook para detectar erros em hooks
export const useEventErrorHandler = () => {
  const handleError = React.useCallback((error: Error, context: string) => {
    console.error(`🚨 Erro em ${context}:`, {
      error,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }, []);

  return { handleError };
};

export default EventErrorBoundary;