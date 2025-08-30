import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useFocusManagement = () => {
  const location = useLocation();

  useEffect(() => {
    // Focus management for different page types
    const path = location.pathname;
    
    // Skip focus management on initial load
    if (location.state?.skipFocus) return;

    setTimeout(() => {
      let focusElement: HTMLElement | null = null;

      // Article pages - focus on main heading
      if (path.startsWith('/revista/') && path !== '/revista') {
        focusElement = document.querySelector('h1[id^="article-title"]') || 
                     document.querySelector('main h1') ||
                     document.querySelector('[role="main"] h1');
      }
      
      // Other content pages - focus on main heading
      else if (path.startsWith('/blog/') || path.startsWith('/agenda/')) {
        focusElement = document.querySelector('h1') ||
                     document.querySelector('main h1');
      }
      
      // Homepage and other pages - focus on main content
      else {
        focusElement = document.querySelector('[role="main"]') ||
                     document.querySelector('main') ||
                     document.getElementById('main-content');
      }

      // Apply focus if element found
      if (focusElement) {
        // Make it focusable if it isn't already
        if (!focusElement.hasAttribute('tabindex')) {
          focusElement.setAttribute('tabindex', '-1');
        }
        
        // Focus with a small delay to ensure rendering is complete
        focusElement.focus();
        
        // Announce the page change to screen readers
        focusElement.setAttribute('aria-live', 'polite');
        setTimeout(() => {
          focusElement?.removeAttribute('aria-live');
        }, 1000);
      }
    }, 100);
  }, [location.pathname, location.state]);
};
