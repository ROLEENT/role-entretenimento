import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Profile } from '@/features/profiles/api';

export function useTabPrefetch(profile: Profile, activeTab: string) {
  const queryClient = useQueryClient();
  const prefetchedRef = useRef<Set<string>>(new Set());
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    if (!profile?.handle || !profile?.user_id) return;

    // Clear existing timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current.clear();

    try {
      const prefetchDelay = 1500; // Reduced delay for better UX

      // Prefetch events if not on agenda tab and not already prefetched
      if (activeTab !== 'agenda' && profile.handle) {
        const eventsKey = `events-${profile.handle}-${profile.type}`;
        
        if (!prefetchedRef.current.has(eventsKey)) {
          const timer = setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey: ['profile-events', profile.handle, profile.type],
              staleTime: 15 * 60 * 1000, // 15 minutes cache
            }).then(() => {
              prefetchedRef.current.add(eventsKey);
            }).catch(() => {
              // Silently fail to prevent errors
            });
          }, prefetchDelay);
          
          timersRef.current.add(timer);
        }
      }

      // Prefetch media if not on media tab and not already prefetched
      if (activeTab !== 'fotos-videos' && profile.user_id) {
        const mediaKey = `media-${profile.user_id}`;
        
        if (!prefetchedRef.current.has(mediaKey)) {
          const timer = setTimeout(() => {
            queryClient.prefetchQuery({
              queryKey: ['profile-media', profile.user_id],
              staleTime: 15 * 60 * 1000, // 15 minutes cache
            }).then(() => {
              prefetchedRef.current.add(mediaKey);
            }).catch(() => {
              // Silently fail to prevent errors
            });
          }, prefetchDelay + 500); // Stagger prefetch to avoid overwhelming
          
          timersRef.current.add(timer);
        }
      }

      return () => {
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current.clear();
      };
    } catch (error) {
      // Silently handle any errors to prevent crashes
      console.debug('Prefetch error:', error);
    }
  }, [activeTab, profile?.handle, profile?.user_id, profile?.type, queryClient]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);
}