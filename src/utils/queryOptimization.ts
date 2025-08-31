/**
 * Query Optimization and Caching System
 * 
 * Provides caching, batching, and optimization utilities for database queries.
 */

import React, { useCallback, useRef, useEffect } from 'react';

// ========== Query Optimization Utilities ==========

/**
 * Batched query executor for reducing database calls
 */
export class QueryBatcher {
  private static instance: QueryBatcher;
  private batchedQueries: Map<string, Promise<any>> = new Map();
  private batchTimeout: number = 10; // ms
  
  static getInstance(): QueryBatcher {
    if (!QueryBatcher.instance) {
      QueryBatcher.instance = new QueryBatcher();
    }
    return QueryBatcher.instance;
  }
  
  async batchQuery<T>(
    key: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    if (this.batchedQueries.has(key)) {
      return this.batchedQueries.get(key);
    }
    
    const promise = new Promise<T>((resolve, reject) => {
      setTimeout(async () => {
        try {
          const result = await queryFn();
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          this.batchedQueries.delete(key);
        }
      }, this.batchTimeout);
    });
    
    this.batchedQueries.set(key, promise);
    return promise;
  }
}

/**
 * Query cache with TTL support
 */
export class QueryCache {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  
  set<T>(key: string, data: T, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Global query cache instance
export const queryCache = new QueryCache();

/**
 * Optimized data fetching hook with caching and deduplication
 */
export function useOptimizedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number;
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    retryOnError?: boolean;
    retryDelay?: number;
    retryCount?: number;
  } = {}
) {
  const {
    ttl = 300000,
    enabled = true,
    refetchOnWindowFocus = false,
    retryOnError = true,
    retryDelay = 1000,
    retryCount = 3
  } = options;
  
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const retryCountRef = useRef(0);
  
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cachedData = queryCache.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const batcher = QueryBatcher.getInstance();
      const result = await batcher.batchQuery(key, queryFn);
      
      queryCache.set(key, result, ttl);
      setData(result);
      retryCountRef.current = 0;
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      // Retry logic
      if (retryOnError && retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(fetchData, retryDelay * retryCountRef.current);
      }
    } finally {
      setLoading(false);
    }
  }, [key, queryFn, enabled, ttl, retryOnError, retryDelay, retryCount]);
  
  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;
    
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);
  
  const refetch = useCallback(() => {
    queryCache.invalidate(key);
    return fetchData();
  }, [key, fetchData]);
  
  return {
    data,
    loading,
    error,
    refetch
  };
}

// ========== Render Optimization Utilities ==========

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<Element | null>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback();
        }
      },
      options
    );
    
    observer.observe(ref.current);
    
    return () => observer.disconnect();
  }, [callback, options]);
  
  return ref;
}

/**
 * Image preloader for performance
 */
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());
  
  useEffect(() => {
    const preloadImage = (url: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
          resolve();
        };
        img.onerror = () => resolve(); // Still resolve to continue
        img.src = url;
      });
    };
    
    Promise.all(urls.map(preloadImage));
  }, [urls]);
  
  return loadedImages;
}

/**
 * Performance monitoring hook
 */
export function usePerformanceMonitor(componentName: string) {
  const renderStartTime = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);
  
  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: renderCount.current
      });
    }
    
    renderStartTime.current = performance.now();
  });
  
  return {
    renderCount: renderCount.current
  };
}