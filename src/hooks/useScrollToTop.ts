import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle scroll restoration on route changes
 * Specifically optimized for mobile browsers and city pages
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Disable automatic scroll restoration to prevent conflicts
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const scrollToTop = () => {
      // Strategy 1: Scroll all possible containers
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Strategy 2: Find and scroll any scrollable containers
      const scrollableElements = document.querySelectorAll('[data-scroll="true"], .overflow-auto, .overflow-y-auto, .overflow-scroll');
      scrollableElements.forEach((element) => {
        if (element instanceof HTMLElement) {
          element.scrollTop = 0;
        }
      });
      
      // Strategy 3: Using requestAnimationFrame chain for better timing
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        });
      });
    };

    // Execute scroll immediately when route changes
    scrollToTop();

    // Additional fallbacks for different loading scenarios
    const timeouts: NodeJS.Timeout[] = [];
    
    // Quick fallback for fast renders
    timeouts.push(setTimeout(scrollToTop, 50));
    
    // Medium fallback for normal loading
    timeouts.push(setTimeout(scrollToTop, 150));
    
    // Slow fallback for heavy layouts or slow devices
    timeouts.push(setTimeout(scrollToTop, 500));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [location.pathname, location.search, location.hash]);
};

export default useScrollToTop;