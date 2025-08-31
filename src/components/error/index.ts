import React from 'react';

// Error handling exports
export { ErrorBoundary as EnhancedErrorBoundary, ComponentErrorBoundary, PageErrorBoundary, CriticalErrorBoundary } from './ErrorBoundary';
export { ErrorDisplay, ErrorList } from './ErrorDisplay';

// Legacy error boundary (backward compatibility)
export { default as ErrorBoundary } from '../ErrorBoundary';

// Error hooks
export { useErrorHandler } from '../../hooks/useErrorHandler';
export { useGlobalErrorHandler, GlobalErrorHandlerProvider } from '../../hooks/useGlobalErrorHandler';

// Error types and utilities
export { AppErrorFactory, ERROR_CODES, USER_ERROR_MESSAGES, errorUtils } from '../../lib/error-types';
export type { AppError } from '../../lib/error-types';
export { ErrorSeverity, ErrorCategory } from '../../lib/error-types';

// Error handling utilities
export const errorHandlingUtils = {
  // Create a higher-order component that wraps components with error boundaries
  withErrorBoundary: <P extends object>(
    Component: React.ComponentType<P>,
    level: 'component' | 'page' | 'critical' = 'component'
  ) => {
    const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
      // Import components dynamically to avoid circular dependencies
      const { ComponentErrorBoundary, PageErrorBoundary, CriticalErrorBoundary } = require('./ErrorBoundary');
      
      const BoundaryComponent = level === 'critical' ? CriticalErrorBoundary :
                               level === 'page' ? PageErrorBoundary :
                               ComponentErrorBoundary;
      
      return React.createElement(
        BoundaryComponent,
        {},
        React.createElement(Component, { ref, ...props })
      );
    });
    
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
    return WrappedComponent;
  },

  // Async error handler for promises
  handleAsyncError: async <T>(
    promise: Promise<T>,
    fallback?: T,
    onError?: (error: any) => void
  ): Promise<T | undefined> => {
    try {
      return await promise;
    } catch (error) {
      onError?.(error);
      console.error('Async operation failed:', error);
      return fallback;
    }
  },

  // Safe function executor
  safeExecute: <T extends any[], R>(
    fn: (...args: T) => R,
    fallback?: R,
    onError?: (error: any) => void
  ) => {
    return (...args: T): R | undefined => {
      try {
        return fn(...args);
      } catch (error) {
        onError?.(error);
        console.error('Function execution failed:', error);
        return fallback;
      }
    };
  },
};