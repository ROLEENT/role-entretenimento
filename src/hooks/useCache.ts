import { useState, useEffect, useCallback } from 'react';

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  maxSize?: number;
  defaultTTL?: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CachedData<any>>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(config: CacheConfig = {}) {
    this.maxSize = config.maxSize || 100;
    this.defaultTTL = config.defaultTTL || 5 * 60 * 1000; // 5 minutes
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    
    // Check if entry has expired
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    const now = Date.now();
    
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      maxSize: this.maxSize
    };
  }
}

// Global cache instance
const globalCache = new MemoryCache({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000 // 5 minutes
});

// Cleanup expired entries every 2 minutes
setInterval(() => {
  globalCache.cleanup();
}, 2 * 60 * 1000);

interface UseCacheOptions {
  ttl?: number;
  enabled?: boolean;
}

export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseCacheOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { ttl, enabled = true } = options;

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache first (unless forcing refresh)
      if (!forceRefresh) {
        const cachedData = globalCache.get<T>(key);
        if (cachedData !== null) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const freshData = await fetcher();
      
      // Cache the result
      globalCache.set(key, freshData, ttl);
      setData(freshData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Cache fetch error for key ${key}:`, error);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl, enabled]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
  }, [key]);

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [fetchData, enabled]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale: data !== null && !globalCache.has(key)
  };
}

// Export cache instance for direct usage
export { globalCache as cache };

// Hook for cache statistics
export function useCacheStats() {
  const [stats, setStats] = useState(globalCache.getStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(globalCache.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}