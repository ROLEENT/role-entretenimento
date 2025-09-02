import { QueryClient } from "@tanstack/react-query";

// Configure React Query with optimized settings for admin performance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Increase cache times to reduce skeleton flashing
      staleTime: 5 * 60 * 1000, // 5 minutes (data considered fresh)
      gcTime: 30 * 60 * 1000, // 30 minutes (keep in cache)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403 errors (auth issues)
        if (error?.status === 401 || error?.status === 403) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance settings to reduce flashing
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnReconnect: true,
      refetchIntervalInBackground: false,
      refetchOnMount: true, // Only refetch if data is stale
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Query key factory for consistent cache keys
export const queryKeys = {
  // Base keys
  admin: ['admin'] as const,
  
  // Entity keys
  organizers: (page?: number, search?: string) => 
    ['admin', 'organizers', { page, search }] as const,
  organizer: (id: string) => 
    ['admin', 'organizers', id] as const,
    
  venues: (page?: number, search?: string) => 
    ['admin', 'venues', { page, search }] as const,
  venue: (id: string) => 
    ['admin', 'venues', id] as const,
    
  categories: (page?: number, search?: string) => 
    ['admin', 'categories', { page, search }] as const,
  category: (id: string) => 
    ['admin', 'categories', id] as const,
    
  events: (page?: number, search?: string, status?: string) => 
    ['admin', 'events', { page, search, status }] as const,
  event: (id: string) => 
    ['admin', 'events', id] as const,
    
  blogPosts: (page?: number, search?: string, status?: string) => 
    ['admin', 'blog-posts', { page, search, status }] as const,
  blogPost: (id: string) => 
    ['admin', 'blog-posts', id] as const,
    
  comments: (page?: number, status?: string) => 
    ['admin', 'comments', { page, status }] as const,
    
  contactMessages: (page?: number, handled?: boolean) => 
    ['admin', 'contact-messages', { page, handled }] as const,
    
  highlights: (page?: number, published?: boolean) => 
    ['admin', 'highlights', { page, published }] as const,
  highlight: (id: string) => 
    ['admin', 'highlights', id] as const,
    
  analytics: (startDate?: string, endDate?: string, granularity?: string) => 
    ['admin', 'analytics', { startDate, endDate, granularity }] as const,
    
  performance: (days?: number) => 
    ['admin', 'performance', { days }] as const,
    
  notifications: (page?: number, type?: string) => 
    ['admin', 'notifications', { page, type }] as const,
};

// Cache invalidation helpers
export const adminQueryInvalidation = {
  // Invalidate all admin queries
  invalidateAll: () => queryClient.invalidateQueries({ queryKey: queryKeys.admin }),
  
  // Invalidate specific entity lists
  invalidateOrganizers: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'organizers'] 
  }),
  invalidateVenues: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'venues'] 
  }),
  invalidateCategories: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'categories'] 
  }),
  invalidateEvents: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'events'] 
  }),
  invalidateBlogPosts: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'blog-posts'] 
  }),
  invalidateComments: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'comments'] 
  }),
  invalidateHighlights: () => queryClient.invalidateQueries({ 
    queryKey: ['admin', 'highlights'] 
  }),
  
  // Remove specific items from cache
  removeOrganizer: (id: string) => queryClient.removeQueries({ 
    queryKey: queryKeys.organizer(id) 
  }),
  removeVenue: (id: string) => queryClient.removeQueries({ 
    queryKey: queryKeys.venue(id) 
  }),
  removeEvent: (id: string) => queryClient.removeQueries({ 
    queryKey: queryKeys.event(id) 
  }),
};

// Prefetch helpers for better UX
export const adminQueryPrefetch = {
  organizers: (page: number = 1) => queryClient.prefetchQuery({
    queryKey: queryKeys.organizers(page),
    staleTime: 60 * 1000, // 1 minute
  }),
  
  venues: (page: number = 1) => queryClient.prefetchQuery({
    queryKey: queryKeys.venues(page),
    staleTime: 60 * 1000,
  }),
  
  events: (page: number = 1) => queryClient.prefetchQuery({
    queryKey: queryKeys.events(page),
    staleTime: 30 * 1000, // Events change more frequently
  }),
};