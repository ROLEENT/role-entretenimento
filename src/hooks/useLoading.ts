import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingReturn {
  isLoading: (key?: string) => boolean;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  toggleLoading: (key?: string) => void;
  withLoading: <T extends any[]>(
    fn: (...args: T) => Promise<any>,
    key?: string
  ) => (...args: T) => Promise<any>;
  loadingStates: LoadingState;
  hasAnyLoading: boolean;
}

export const useLoading = (defaultKey: string = 'default'): UseLoadingReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const isLoading = useCallback((key: string = defaultKey): boolean => {
    return !!loadingStates[key];
  }, [loadingStates, defaultKey]);

  const startLoading = useCallback((key: string = defaultKey) => {
    // Clear any existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }

    setLoadingStates(prev => ({ ...prev, [key]: true }));
  }, [defaultKey]);

  const stopLoading = useCallback((key: string = defaultKey) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });

    // Clear timeout reference
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }
  }, [defaultKey]);

  const toggleLoading = useCallback((key: string = defaultKey) => {
    if (isLoading(key)) {
      stopLoading(key);
    } else {
      startLoading(key);
    }
  }, [isLoading, startLoading, stopLoading, defaultKey]);

  // Auto-stop loading after a timeout (prevents stuck loading states)
  const startLoadingWithTimeout = useCallback((key: string = defaultKey, timeout: number = 30000) => {
    startLoading(key);
    
    timeoutRefs.current[key] = setTimeout(() => {
      console.warn(`Loading timeout reached for key: ${key}`);
      stopLoading(key);
    }, timeout);
  }, [startLoading, stopLoading, defaultKey]);

  // Higher-order function to wrap async functions with loading states
  const withLoading = useCallback(<T extends any[]>(
    fn: (...args: T) => Promise<any>,
    key: string = defaultKey
  ) => {
    return async (...args: T) => {
      try {
        startLoadingWithTimeout(key);
        const result = await fn(...args);
        return result;
      } catch (error) {
        throw error;
      } finally {
        stopLoading(key);
      }
    };
  }, [startLoadingWithTimeout, stopLoading, defaultKey]);

  const hasAnyLoading = Object.keys(loadingStates).length > 0;

  return {
    isLoading,
    startLoading: startLoadingWithTimeout,
    stopLoading,
    toggleLoading,
    withLoading,
    loadingStates,
    hasAnyLoading,
  };
};

// Hook for simple single loading state
export const useSimpleLoading = (initialLoading: boolean = false) => {
  const [isLoading, setIsLoading] = useState(initialLoading);

  const withLoading = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | undefined> => {
    try {
      setIsLoading(true);
      const result = await fn();
      return result;
    } catch (error) {
      console.error('Loading operation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    withLoading,
  };
};

// Hook for debounced loading (useful for search/filter operations)
export const useDebouncedLoading = (delay: number = 300) => {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsLoading(true);
    
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
    }, delay);
  }, [delay]);

  const stopLoading = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    startLoading,
    stopLoading,
  };
};

export default useLoading;