// Loading components
export { Spinner } from '../spinner';
export { Skeleton } from '../skeleton';
export { LoadingOverlay, ComponentLoadingOverlay, InlineLoading } from '../loading-overlay';
export { LoadingButton, AsyncButton } from '../loading-button';
export { LoadingState, LoadingCard, LoadingList, LoadingTable, withLoadingState } from '../loading-state';

// Loading hooks
export { useLoading, useSimpleLoading, useDebouncedLoading } from '../../../hooks/useLoading';

// Loading types
export interface LoadingProps {
  isLoading?: boolean;
  loadingText?: string;
  skeleton?: React.ReactNode;
}

export interface AsyncActionProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  loadingText?: string;
}

// Loading utilities
export const loadingUtils = {
  // Delay helper to prevent loading flicker
  delay: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Minimum loading time helper
  withMinimumDuration: async <T>(
    promise: Promise<T>, 
    minDuration: number = 500
  ): Promise<T> => {
    const [result] = await Promise.all([
      promise,
      loadingUtils.delay(minDuration)
    ]);
    return result;
  },

  // Loading state manager for multiple async operations
  createLoadingManager: () => {
    const states = new Map<string, boolean>();
    const listeners = new Set<() => void>();
    
    return {
      setLoading: (key: string, loading: boolean) => {
        states.set(key, loading);
        listeners.forEach(listener => listener());
      },
      isLoading: (key: string) => states.get(key) || false,
      hasAnyLoading: () => Array.from(states.values()).some(Boolean),
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      getStates: () => Object.fromEntries(states),
    };
  },
};