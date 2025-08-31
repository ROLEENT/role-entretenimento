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
    // Validate scroll position
    if (!position || position < 0) return;
    
    // Restore scroll after content is rendered with fallback
    const restoreScroll = () => {
      const maxScroll = Math.max(
        document.body.scrollHeight - window.innerHeight,
        document.documentElement.scrollHeight - window.innerHeight
      );
      
      const validPosition = Math.min(position, maxScroll);
      if (validPosition > 0) {
        window.scrollTo({ top: validPosition, behavior: 'auto' });
      }
    };

    // Multiple attempts for better reliability
    setTimeout(restoreScroll, 100);
    setTimeout(restoreScroll, 300);
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