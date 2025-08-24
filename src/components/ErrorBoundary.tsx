import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Clear potentially corrupted localStorage on error
    try {
      const authKeys = ['sb-nutlcbnruabjsxecqpnd-auth-token', 'admin_session'];
      authKeys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                Ocorreu um erro inesperado. Limpe o cache do navegador ou tente recarregar a página.
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                Recarregar Página
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full"
              >
                Limpar Cache e Recarregar
              </Button>
            </div>
            {this.state.error && (
              <details className="text-sm text-muted-foreground">
                <summary>Detalhes do erro</summary>
                <pre className="mt-2 text-xs overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;