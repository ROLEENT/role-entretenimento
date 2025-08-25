import { useState, useEffect, useMemo, useCallback } from 'react';
import { useResponsive } from './useResponsive';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  getItemHeight?: (index: number) => number;
}

export function useVirtualList<T>(
  items: T[],
  options: UseVirtualListOptions
) {
  const { itemHeight, containerHeight = 400, overscan = 5, getItemHeight } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const { isMobile } = useResponsive();

  // Adjust overscan for mobile
  const adjustedOverscan = isMobile ? Math.max(2, overscan - 2) : overscan;

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = start + visibleCount;

    return {
      start: Math.max(0, start - adjustedOverscan),
      end: Math.min(items.length - 1, end + adjustedOverscan)
    };
  }, [scrollTop, itemHeight, containerHeight, adjustedOverscan, items.length]);

  const visibleItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (items[i]) {
        result.push({
          index: i,
          item: items[i],
          offsetTop: getItemHeight ? 
            Array.from({ length: i }, (_, idx) => getItemHeight(idx)).reduce((a, b) => a + b, 0) :
            i * itemHeight
        });
      }
    }
    return result;
  }, [visibleRange, items, itemHeight, getItemHeight]);

  const totalHeight = useMemo(() => {
    if (getItemHeight) {
      return Array.from({ length: items.length }, (_, i) => getItemHeight(i))
        .reduce((a, b) => a + b, 0);
    }
    return items.length * itemHeight;
  }, [items.length, itemHeight, getItemHeight]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    containerProps: {
      style: { height: containerHeight, overflow: 'auto' },
      onScroll: handleScroll
    },
    scrollElementProps: {
      style: { height: totalHeight, position: 'relative' as const }
    }
  };
}