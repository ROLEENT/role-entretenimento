import { useEffect, useCallback } from 'react';
import { onLCP } from 'web-vitals';

export function LCPOptimizer() {
  const optimizeLCPElement = useCallback(() => {
    // Find and optimize the LCP element
    const potentialLCPElements = [
      'img[src*="banner"]',
      'img[src*="hero"]',
      '.hero-section img',
      'main img:first-child',
      '[data-lcp="true"]'
    ];

    potentialLCPElements.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLImageElement) {
          // Mark as high priority
          element.loading = 'eager';
          element.fetchPriority = 'high';
          element.decoding = 'sync';
          
          // Ensure it's not lazy loaded
          element.classList.remove('lazy-loading');
          
          // If it has a data-src, load immediately
          if (element.dataset.src && !element.src) {
            element.src = element.dataset.src;
          }
        }
      });
    });

    // Optimize hero sections
    const heroSections = document.querySelectorAll('.hero-section, [class*="hero"]');
    heroSections.forEach(section => {
      const img = section.querySelector('img');
      if (img) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }
    });

  }, []);

  useEffect(() => {
    // Monitor LCP and optimize on first load
    onLCP((metric) => {
      console.log('LCP:', metric.value);
      if (metric.value > 2500) {
        // LCP is too slow, try to optimize
        optimizeLCPElement();
      }
    });

    // Run optimization immediately
    optimizeLCPElement();

    // Re-run when DOM changes (for dynamic content)
    const observer = new MutationObserver(() => {
      setTimeout(optimizeLCPElement, 100);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [optimizeLCPElement]);

  return null;
}