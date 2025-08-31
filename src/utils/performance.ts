/**
 * Performance Utilities
 */

import React, { useRef, useEffect } from 'react';

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

export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());
  
  useEffect(() => {
    urls.forEach(url => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => new Set([...prev, url]));
      img.src = url;
    });
  }, [urls]);
  
  return loadedImages;
}

export function useOptimizedList<T>(
  items: T[],
  filterFn?: (item: T) => boolean,
  sortFn?: (a: T, b: T) => number
) {
  return React.useMemo(() => {
    let result = items;
    if (filterFn) result = result.filter(filterFn);
    if (sortFn) result = [...result].sort(sortFn);
    return result;
  }, [items, filterFn, sortFn]);
}

export class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  set<T>(key: string, data: T, ttl = 300000): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }
  
  invalidate(pattern?: string): void {
    if (!pattern) return this.cache.clear();
    const regex = new RegExp(pattern);
    for (const [key] of this.cache) {
      if (regex.test(key)) this.cache.delete(key);
    }
  }
}

export const queryCache = new QueryCache();