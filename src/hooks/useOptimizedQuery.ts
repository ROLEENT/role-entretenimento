import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { cachedFetch, generateCacheKey } from '@/utils/apiCache';
import { usePerformanceOptimizations } from './usePerformanceOptimizations';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  params?: Record<string, any>;
  cacheTTL?: number;
  priority?: 'high' | 'medium' | 'low';
}

export function useOptimizedQuery<T>({
  endpoint,
  params,
  cacheTTL = 5 * 60 * 1000, // 5 minutes default
  priority = 'medium',
  ...queryOptions
}: OptimizedQueryOptions<T>) {
  const { config } = usePerformanceOptimizations();
  
  const queryKey = [endpoint, params];
  const cacheKey = generateCacheKey(endpoint, params);

  // Adjust stale time based on connection quality
  const getStaleTime = () => {
    if (config.enableDataSaver) return 10 * 60 * 1000; // 10 minutes
    if (priority === 'high') return 1 * 60 * 1000; // 1 minute
    if (priority === 'low') return 15 * 60 * 1000; // 15 minutes
    return 5 * 60 * 1000; // 5 minutes default
  };

  // Adjust refetch interval based on priority and connection
  const getRefetchInterval = () => {
    if (config.enableDataSaver) return false;
    if (priority === 'high') return 2 * 60 * 1000; // 2 minutes
    if (priority === 'medium') return 5 * 60 * 1000; // 5 minutes
    return false; // No auto-refetch for low priority
  };

  return useQuery({
    queryKey,
    queryFn: async () => {
      return cachedFetch(cacheKey, async () => {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Query failed: ${response.statusText}`);
        }

        return response.json();
      }, cacheTTL);
    },
    staleTime: getStaleTime(),
    gcTime: cacheTTL * 2,
    refetchInterval: getRefetchInterval(),
    refetchOnWindowFocus: priority === 'high',
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Reduce retries on slow connections
      if (config.enableDataSaver) return failureCount < 1;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => {
      // Progressive delay
      return Math.min(1000 * 2 ** attemptIndex, 30000);
    },
    ...queryOptions,
  });
}