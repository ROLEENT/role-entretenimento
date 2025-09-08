import { useEffect } from 'react';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';

export function ResourceOptimizer() {
  const { config, preloadResource } = usePerformanceOptimizations();

  useEffect(() => {
    // Sempre preload de fonts críticas para reduzir LCP
    preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', 'style');

    // Add resource hints for external domains
    const resourceHints = [
      { rel: 'preconnect', href: 'https://nutlcbnruabjsxecqpnd.supabase.co' },
      { rel: 'preconnect', href: 'https://images.unsplash.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    ];

    resourceHints.forEach(hint => {
      const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
      if (!existing) {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.rel === 'preconnect' && hint.href.includes('fonts.gstatic.com')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });

    // Optimize third-party scripts loading
    const optimizeScripts = () => {
      // Defer non-critical scripts
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.includes('vite') && !script.hasAttribute('defer') && !script.hasAttribute('async')) {
          script.setAttribute('defer', '');
        }
      });
    };

    // Run after initial load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', optimizeScripts);
    } else {
      optimizeScripts();
    }

    // Preload critical images more aggressively for LCP
    const preloadCriticalImages = () => {
      const currentPath = window.location.pathname;
      
      // Always preload critical images
      const criticalImages = [
        '/banner-home.png',
        '/role-logo.png',
        '/placeholder.svg'
      ];
      
      criticalImages.forEach(src => {
        if (!document.querySelector(`link[rel="preload"][href="${src}"]`)) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'image';
          link.href = src;
          link.fetchPriority = 'high';
          document.head.appendChild(link);
        }
      });
      
      // Warm up API endpoints to reduce TTFB
      if (currentPath === '/') {
        // Prefetch data for home page
        fetch('/rest/v1/site_metrics?is_current=eq.true').catch(() => {});
        fetch('/rest/v1/events?select=id,title&status=eq.published&limit=1').catch(() => {});
      }
    };

    // Always preload critical images for better performance
    preloadCriticalImages();

    // Service Worker registration - immediate for better caching
    if ('serviceWorker' in navigator) {
      // Register immediately if DOM ready, otherwise on load
      if (document.readyState === 'complete') {
        navigator.serviceWorker.register('/sw.js').then(registration => {
          // Force activation of new SW
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }).catch(() => {});
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {});
        });
      }
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeScripts);
    };
  }, [config, preloadResource]);

  return null;
}