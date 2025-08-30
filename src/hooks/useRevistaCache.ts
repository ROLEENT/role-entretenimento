import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface RevistaCacheData {
  posts: any[];
  totalCount: number;
  hasMore: boolean;
  scrollPosition: number;
  searchParams: string;
  timestamp: number;
}

const CACHE_KEY = 'revista_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRevistaCache() {
  const [searchParams] = useSearchParams();
  const scrollPositionRef = useRef<number>(0);
  
  const currentParamsString = searchParams.toString();

  // Save scroll position periodically
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getCachedData = (): RevistaCacheData | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: RevistaCacheData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      const paramsMismatch = data.searchParams !== currentParamsString;

      if (isExpired || paramsMismatch) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.warn('Error reading revista cache:', error);
      return null;
    }
  };

  const setCachedData = (
    posts: any[],
    totalCount: number,
    hasMore: boolean
  ) => {
    try {
      const data: RevistaCacheData = {
        posts,
        totalCount,
        hasMore,
        scrollPosition: scrollPositionRef.current,
        searchParams: currentParamsString,
        timestamp: Date.now()
      };

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving revista cache:', error);
    }
  };

  const restoreScrollPosition = (position: number) => {
    // Restore scroll after a short delay to ensure content is rendered
    setTimeout(() => {
      window.scrollTo({ top: position, behavior: 'auto' });
    }, 100);
  };

  const clearCache = () => {
    sessionStorage.removeItem(CACHE_KEY);
  };

  return {
    getCachedData,
    setCachedData,
    restoreScrollPosition,
    clearCache
  };
}