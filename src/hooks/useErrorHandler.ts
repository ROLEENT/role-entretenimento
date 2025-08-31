import { useState, useCallback, useRef } from 'react';
import { AppError, AppErrorFactory, ErrorCategory, ErrorSeverity } from '@/lib/error-types';
import { toast } from 'sonner';

interface ErrorState {
  errors: AppError[];
  lastError: AppError | null;
  isCleared: boolean;
}

interface UseErrorHandlerOptions {
  enableToast?: boolean;
  enableConsoleLog?: boolean;
  enableReporting?: boolean;
  maxStoredErrors?: number;
  toastDuration?: number;
}

interface UseErrorHandlerReturn {
  // State
  errors: AppError[];
  lastError: AppError | null;
  hasErrors: boolean;
  errorCount: number;

  // Actions
  handleError: (error: any, context?: Record<string, any>) => AppError;
  clearErrors: () => void;
  clearError: (errorId: string) => void;
  retryLastError: () => void;

  // Utilities
  getErrorsByCategory: (category: ErrorCategory) => AppError[];
  getErrorsBySeverity: (severity: ErrorSeverity) => AppError[];
  withErrorHandling: <T extends any[]>(
    fn: (...args: T) => Promise<any>,
    context?: Record<string, any>
  ) => (...args: T) => Promise<any>;
}

export const useErrorHandler = (
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn => {
  const {
    enableToast = true,
    enableConsoleLog = true,
    enableReporting = true,
    maxStoredErrors = 50,
    toastDuration = 5000,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    errors: [],
    lastError: null,
    isCleared: false,
  });

  const retryFunctionRef = useRef<(() => Promise<any>) | null>(null);

  // Handle different types of errors
  const handleError = useCallback((
    error: any,
    context?: Record<string, any>
  ): AppError => {
    let appError: AppError;

    // Determine error type and create appropriate AppError
    if (error instanceof Error) {
      if (error.name === 'ValidationError' || (error as any).errors) {
        appError = AppErrorFactory.fromValidationError(error as any, context);
      } else {
        appError = AppErrorFactory.fromJavaScriptError(error, context);
      }
    } else if (error?.code || error?.status) {
      // Supabase or API error
      appError = AppErrorFactory.fromSupabaseError(error, context);
    } else if (error?.name === 'NetworkError' || !navigator.onLine) {
      appError = AppErrorFactory.fromNetworkError(error, context);
    } else if (typeof error === 'string') {
      appError = AppErrorFactory.createError(error, ErrorCategory.UNKNOWN, ErrorSeverity.MEDIUM, { context });
    } else {
      appError = AppErrorFactory.createError(
        error?.message || 'Erro desconhecido',
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        { context }
      );
    }

    // Update state
    setErrorState(prev => {
      const newErrors = [appError, ...prev.errors].slice(0, maxStoredErrors);
      return {
        errors: newErrors,
        lastError: appError,
        isCleared: false,
      };
    });

    // Console logging
    if (enableConsoleLog) {
      console.error('[Error Handler]', {
        error: appError,
        originalError: error,
        context,
      });
    }

    // Toast notification
    if (enableToast && appError.userMessage) {
      const toastOptions = {
        duration: toastDuration,
        action: appError.retryable ? {
          label: 'Tentar novamente',
          onClick: () => retryLastError(),
        } : undefined,
      };

      switch (appError.severity) {
        case ErrorSeverity.LOW:
          toast.info(appError.userMessage, toastOptions);
          break;
        case ErrorSeverity.MEDIUM:
          toast.warning(appError.userMessage, toastOptions);
          break;
        case ErrorSeverity.HIGH:
        case ErrorSeverity.CRITICAL:
          toast.error(appError.userMessage, toastOptions);
          break;
      }
    }

    // Error reporting (could be integrated with Sentry, LogRocket, etc.)
    if (enableReporting && (appError.severity === ErrorSeverity.HIGH || appError.severity === ErrorSeverity.CRITICAL)) {
      // Report to external service
      reportError(appError);
    }

    return appError;
  }, [enableToast, enableConsoleLog, enableReporting, maxStoredErrors, toastDuration]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorState({
      errors: [],
      lastError: null,
      isCleared: true,
    });
    retryFunctionRef.current = null;
  }, []);

  // Clear specific error
  const clearError = useCallback((errorId: string) => {
    setErrorState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.id !== errorId),
    }));
  }, []);

  // Retry last error (if retryable)
  const retryLastError = useCallback(async () => {
    if (retryFunctionRef.current && errorState.lastError?.retryable) {
      try {
        await retryFunctionRef.current();
        // Clear the error if retry succeeds
        if (errorState.lastError) {
          clearError(errorState.lastError.id);
        }
      } catch (retryError) {
        // Handle retry failure
        handleError(retryError, { isRetry: true });
      }
    }
  }, [errorState.lastError, clearError, handleError]);

  // Get errors by category
  const getErrorsByCategory = useCallback((category: ErrorCategory) => {
    return errorState.errors.filter(error => error.category === category);
  }, [errorState.errors]);

  // Get errors by severity
  const getErrorsBySeverity = useCallback((severity: ErrorSeverity) => {
    return errorState.errors.filter(error => error.severity === severity);
  }, [errorState.errors]);

  // Higher-order function to wrap async functions with error handling
  const withErrorHandling = useCallback(<T extends any[]>(
    fn: (...args: T) => Promise<any>,
    context?: Record<string, any>
  ) => {
    return async (...args: T) => {
      try {
        // Store the function for potential retry
        retryFunctionRef.current = () => fn(...args);
        
        const result = await fn(...args);
        
        // Clear any existing errors on success
        if (errorState.errors.length > 0) {
          clearErrors();
        }
        
        return result;
      } catch (error) {
        throw handleError(error, context);
      }
    };
  }, [handleError, clearErrors, errorState.errors.length]);

  return {
    // State
    errors: errorState.errors,
    lastError: errorState.lastError,
    hasErrors: errorState.errors.length > 0,
    errorCount: errorState.errors.length,

    // Actions
    handleError,
    clearErrors,
    clearError,
    retryLastError,

    // Utilities
    getErrorsByCategory,
    getErrorsBySeverity,
    withErrorHandling,
  };
};

// Error reporting function (placeholder for external service integration)
const reportError = (error: AppError) => {
  // This could be integrated with services like:
  // - Sentry: Sentry.captureException(error)
  // - LogRocket: LogRocket.captureException(error)
  // - Custom logging endpoint
  
  console.warn('[Error Reporting] Error would be sent to external service:', error);
  
  // Example: Send to custom endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorUtils.formatForLogging(error))
  // }).catch(console.error);
};

export default useErrorHandler;