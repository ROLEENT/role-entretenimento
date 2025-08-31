import React, { useEffect } from 'react';
import { AppErrorFactory, ErrorCategory } from '@/lib/error-types';

interface GlobalErrorHandlerOptions {
  enableConsoleLog?: boolean;
  enableUnhandledPromiseRejection?: boolean;
  enableResourceErrors?: boolean;
  onError?: (error: any) => void;
}

export const useGlobalErrorHandler = (options: GlobalErrorHandlerOptions = {}) => {
  const {
    enableConsoleLog = true,
    enableUnhandledPromiseRejection = true,
    enableResourceErrors = true,
    onError,
  } = options;

  useEffect(() => {
    // Handle uncaught JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const appError = AppErrorFactory.fromJavaScriptError(
        new Error(event.message),
        {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          source: 'window.onerror',
        }
      );

      if (enableConsoleLog) {
        console.error('[Global Error Handler] Uncaught error:', {
          appError,
          originalEvent: event,
        });
      }

      onError?.(appError);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      const appError = AppErrorFactory.fromJavaScriptError(error, {
        source: 'unhandledrejection',
        promise: true,
      });

      if (enableConsoleLog) {
        console.error('[Global Error Handler] Unhandled promise rejection:', {
          appError,
          reason: event.reason,
        });
      }

      onError?.(appError);
      
      // Prevent the default browser behavior (logging to console)
      event.preventDefault();
    };

    // Handle resource loading errors (images, scripts, etc.)
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      const tagName = target?.tagName?.toLowerCase();
      const src = (target as any)?.src || (target as any)?.href;

      const appError = AppErrorFactory.createError(
        `Failed to load ${tagName}: ${src}`,
        ErrorCategory.NETWORK,
        'medium' as any,
        {
          context: {
            tagName,
            src,
            element: target?.outerHTML?.substring(0, 200),
          }
        }
      );

      if (enableConsoleLog) {
        console.error('[Global Error Handler] Resource loading error:', {
          appError,
          element: target,
        });
      }

      onError?.(appError);
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    
    if (enableUnhandledPromiseRejection) {
      window.addEventListener('unhandledrejection', handleUnhandledRejection);
    }
    
    if (enableResourceErrors) {
      window.addEventListener('error', handleResourceError, true); // Use capture phase
    }

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      if (enableUnhandledPromiseRejection) {
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      }
      if (enableResourceErrors) {
        window.removeEventListener('error', handleResourceError, true);
      }
    };
  }, [enableConsoleLog, enableUnhandledPromiseRejection, enableResourceErrors, onError]);
};

// Global error handler provider component
interface GlobalErrorHandlerProviderProps {
  children: React.ReactNode;
  options?: GlobalErrorHandlerOptions;
}

export const GlobalErrorHandlerProvider: React.FC<GlobalErrorHandlerProviderProps> = ({
  children,
  options = {},
}) => {
  useGlobalErrorHandler(options);
  return React.createElement(React.Fragment, null, children);
};

export default useGlobalErrorHandler;