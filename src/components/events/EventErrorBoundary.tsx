import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventErrorNotification from './EventErrorNotification';

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
        <div className="m-4">
          <EventErrorNotification
            error={this.state.error!}
            onRetry={this.handleRetry}
            showTechnicalDetails={process.env.NODE_ENV === 'development'}
          />
        </div>
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