import { useEffect } from 'react';
import { cache } from '@/utils/performanceOptimizations';

export function CacheOptimizer() {
  useEffect(() => {
    // Implement aggressive caching for API responses
    const originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      
      // Only cache GET requests to API endpoints
      if (method === 'GET' && (url.includes('/api/') || url.includes('supabase.co'))) {
        const cacheKey = `fetch:${url}`;
        
        // Check cache first
        const cached = cache.get(cacheKey);
        if (cached) {
          return new Response(JSON.stringify(cached), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        // Fetch and cache response
        try {
          const response = await originalFetch(input, init);
          const clonedResponse = response.clone();
          
          if (response.ok) {
            const data = await clonedResponse.json();
            // Cache for 5 minutes for API responses
            cache.set(cacheKey, data, 5 * 60 * 1000);
          }
          
          return response;
        } catch (error) {
          return originalFetch(input, init);
        }
      }
      
      return originalFetch(input, init);
    };

    // Pre-warm cache with critical data
    const criticalUrls = [
      `${window.location.origin}/api/agenda?limit=10`,
      `${window.location.origin}/api/highlights?limit=5`,
    ];

    criticalUrls.forEach(url => {
      fetch(url).catch(() => {
        // Silent fail for pre-warming
      });
    });

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}