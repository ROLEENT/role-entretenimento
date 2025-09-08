import { useEffect } from 'react';
import { preloadCriticalResources, addResourceHints } from '@/utils/performanceOptimizations';

export function CriticalResourcesOptimizer() {
  useEffect(() => {
    // Preload critical images that affect LCP
    const criticalImages = [
      '/images/banner-home.png',
      '/images/logo-role.png',
      '/icons/icon-192.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.fetchPriority = 'high';
      document.head.appendChild(link);
    });

    // Preload critical fonts to reduce FOIT/FOUT
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700;800;900&display=swap',
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ];

    criticalFonts.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });

    // Initialize other performance optimizations
    preloadCriticalResources();
    addResourceHints();

    // Prefetch critical API endpoints to reduce TTFB
    const criticalEndpoints = [
      '/api/agenda',
      '/api/highlights',
      '/api/destaques'
    ];

    criticalEndpoints.forEach(endpoint => {
      fetch(endpoint, { method: 'HEAD' }).catch(() => {
        // Silent fail for prefetch
      });
    });

  }, []);

  return null;
}