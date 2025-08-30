import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle scroll restoration on route changes
 * Specifically optimized for mobile browsers (iOS Safari, Chrome Android)
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable automatic scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      // Multiple strategies for reliable scroll to top
      // Strategy 1: Immediate scroll
      window.scrollTo(0, 0);
      
      // Strategy 2: Using requestAnimationFrame chain for better timing
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          requestAnimationFrame(() => {
            window.scrollTo(0, 0);
          });
        });
      });
    };

    // Execute scroll immediately
    scrollToTop();

    // Fallback timeout for slower devices or heavy layouts
    const timeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);

    // Additional fallback for very slow devices
    const slowTimeoutId = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(slowTimeoutId);
    };
  }, [location.pathname, location.search, location.hash]);
};

export default useScrollToTop;