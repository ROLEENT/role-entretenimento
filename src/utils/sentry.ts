import * as Sentry from '@sentry/react';
import React from 'react';

export const initSentry = () => {
  Sentry.init({
    dsn: 'https://your-sentry-dsn@o4507234567890.ingest.sentry.io/4507234567890',
    environment: import.meta.env.MODE || 'development',
    integrations: [],
    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException;
        
        if (error && error.toString().includes('Extension context invalidated')) {
          return null;
        }
        
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
    initialScope: {
      tags: {
        component: 'role-entretenimento',
        version: '1.0.0'
      }
    }
  });
};

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

export const withSentryErrorBoundary = (Component: React.ComponentType<any>) => {
  return Sentry.withErrorBoundary(Component, {
    fallback: ({ error, resetError }) => React.createElement('div', {
      className: "min-h-screen flex items-center justify-center"
    }, React.createElement('div', {
      className: "text-center"
    }, [
      React.createElement('h2', {
        key: 'title',
        className: "text-xl font-semibold mb-2"
      }, 'Algo deu errado'),
      React.createElement('p', {
        key: 'description',
        className: "text-muted-foreground mb-4"
      }, 'Ocorreu um erro inesperado. Nossa equipe foi notificada.'),
      React.createElement('button', {
        key: 'button',
        onClick: resetError,
        className: "px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      }, 'Tentar novamente')
    ])),
    beforeCapture: (scope) => {
      scope.setTag('errorBoundary', true);
    }
  });
};