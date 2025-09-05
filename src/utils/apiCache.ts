interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly maxSize = 100;

  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // Clean old entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entriesToDelete: string[] = [];
    
    // Remove expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        entriesToDelete.push(key);
      }
    }
    
    entriesToDelete.forEach(key => this.cache.delete(key));
    
    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = Array.from(this.cache.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);
      
      const toRemove = sortedEntries.slice(0, this.maxSize * 0.3);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
      hitRate: active / (active + expired) || 0,
    };
  }
}

export const apiCache = new APICache();

// Cache key generators
export const generateCacheKey = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  const paramString = params ? JSON.stringify(params) : '';
  return `${endpoint}:${paramString}`;
};

// Cached fetch wrapper
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Check cache first
  const cached = apiCache.get<T>(key);
  if (cached) {
    return cached;
  }

  // Fetch and cache
  try {
    const data = await fetcher();
    apiCache.set(key, data, ttl);
    return data;
  } catch (error) {
    // Don't cache errors
    throw error;
  }
}

// React Query cache integration
export const queryCache = {
  get: (key: string) => apiCache.get(key),
  set: (key: string, data: any, ttl?: number) => apiCache.set(key, data, ttl),
  invalidate: (pattern: string) => {
    const keysToDelete: string[] = [];
    for (const key of apiCache['cache'].keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => apiCache.delete(key));
  },
};