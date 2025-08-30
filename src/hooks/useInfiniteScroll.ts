import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 0.1,
  rootMargin = '100px'
}: UseInfiniteScrollOptions) {
  const [isEnabled, setIsEnabled] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const lastCallRef = useRef<number>(0);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    const now = Date.now();
    
    // Prevent duplicate calls within 500ms
    if (now - lastCallRef.current < 500) {
      return;
    }
    
    if (entry.isIntersecting && hasMore && !isLoading && isEnabled) {
      lastCallRef.current = now;
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, isEnabled]);

  useEffect(() => {
    const target = targetRef.current;
    if (!target || !isEnabled) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin
    });

    observerRef.current.observe(target);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin, isEnabled]);

  const enableInfiniteScroll = useCallback(() => setIsEnabled(true), []);
  const disableInfiniteScroll = useCallback(() => setIsEnabled(false), []);

  return {
    targetRef,
    isEnabled,
    enableInfiniteScroll,
    disableInfiniteScroll
  };
}