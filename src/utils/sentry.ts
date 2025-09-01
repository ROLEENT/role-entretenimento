import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://your-sentry-dsn@o4507234567890.ingest.sentry.io/4507234567890',
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing({
        // Capturar interações de usuário e navegação
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
    ],
    // Capturar 10% das transações em produção, 100% em desenvolvimento
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    // Capturar erros de replay em sessões com erro
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      // Filtrar erros conhecidos/irrelevantes
      if (event.exception) {
        const error = hint.originalException;
        
        // Filtrar erros de extensões do navegador
        if (error && error.toString().includes('Extension context invalidated')) {
          return null;
        }
        
        // Filtrar erros de rede comuns que não são críticos
        if (error && (
          error.toString().includes('ChunkLoadError') ||
          error.toString().includes('Loading chunk') ||
          error.toString().includes('Network Error')
        )) {
          return null;
        }
      }
      
      return event;
    },
    // Tags globais para identificar sessões
    initialScope: {
      tags: {
        component: 'role-entretenimento',
        version: '1.0.0'
      }
    }
  });
};

// Hook para reportar erros de API
export const useSentryErrorReporting = () => {
  const reportError = (error: Error, context?: Record<string, any>) => {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  };

  const reportApiError = (error: Error, endpoint: string, method: string) => {
    Sentry.withScope((scope) => {
      scope.setTag('api.endpoint', endpoint);
      scope.setTag('api.method', method);
      scope.setContext('api', {
        endpoint,
        method,
        timestamp: new Date().toISOString()
      });
      Sentry.captureException(error);
    });
  };

  return { reportError, reportApiError };
};

// HOC para capturar erros de componentes
export const withSentryErrorBoundary = (Component: React.ComponentType<any>) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Algo deu errado</h2>
          <p className="text-muted-foreground mb-4">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          <button 
            onClick={resetError}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    ),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true);
    }
  });
};