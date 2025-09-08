import { useEffect } from 'react';
import { usePerformanceOptimizations } from '@/hooks/usePerformanceOptimizations';

export function ResourceOptimizer() {
  const { config, preloadResource } = usePerformanceOptimizations();

  useEffect(() => {
    // Preload critical fonts
    if (config.preloadCritical) {
      preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', 'style');
    }

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

    // Preload critical images based on route
    const preloadCriticalImages = () => {
      const currentPath = window.location.pathname;
      
      // Home page critical images
      if (currentPath === '/') {
        const heroImages = [
          '/banner-home.png',
          '/role-logo.png'
        ];
        
        heroImages.forEach(src => {
          // Check if already preloaded to avoid duplicates
          if (!document.querySelector(`link[rel="preload"][href="${src}"]`)) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            link.fetchPriority = 'high';
            document.head.appendChild(link);
          }
        });
      }
    };

    // Always preload critical images for better performance
    preloadCriticalImages();

    // Service Worker registration for caching - re-enabled for performance
    if ('serviceWorker' in navigator && config.preloadCritical) {
      // Delay SW registration to not block initial load
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          // Silently fail - SW is optional
        });
      }, 2000);
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', optimizeScripts);
    };
  }, [config, preloadResource]);

  return null;
}