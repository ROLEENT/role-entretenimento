/**
 * Performance Utilities
 */

import React, { useRef, useEffect } from 'react';

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  callback: () => void,
  options: IntersectionObserverInit = {}
) {
  const ref = useRef<T | null>(null);
  
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

// VirtualizedList component for large lists
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    items.length - 1,
    visibleStart + Math.ceil(containerHeight / itemHeight) + 2
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;
  
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);
  
  return React.createElement('div', {
    style: { height: containerHeight, overflow: 'auto' },
    onScroll: handleScroll
  }, 
    React.createElement('div', {
      style: { height: totalHeight, position: 'relative' }
    },
      React.createElement('div', {
        style: { transform: `translateY(${offsetY}px)` }
      },
        visibleItems.map((item, index) => 
          React.createElement('div', {
            key: keyExtractor(item, visibleStart + index)
          }, renderItem(item, visibleStart + index))
        )
      )
    )
  );
}