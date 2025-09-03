import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Profile } from '@/features/profiles/api';

export function useTabPrefetch(profile: Profile, activeTab: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile?.handle || !profile?.user_id) return;

    try {
      const prefetchDelay = 2000; // Increased delay to prevent errors

      const timer = setTimeout(() => {
        // Only prefetch if profile is valid and handle exists
        if (activeTab !== 'agenda' && profile.handle) {
          queryClient.prefetchQuery({
            queryKey: ['profile-events', profile.handle, profile.type],
            staleTime: 10 * 60 * 1000, // Increased to 10 minutes
          }).catch(() => {
            // Silently fail to prevent errors
          });
        }

        if (activeTab !== 'midia' && profile.user_id) {
          queryClient.prefetchQuery({
            queryKey: ['profile-media', profile.user_id],
            staleTime: 10 * 60 * 1000, // Increased to 10 minutes
          }).catch(() => {
            // Silently fail to prevent errors
          });
        }
      }, prefetchDelay);

      return () => clearTimeout(timer);
    } catch (error) {
      // Silently handle any errors to prevent crashes
      console.debug('Prefetch error:', error);
    }
  }, [activeTab, profile?.handle, profile?.user_id, profile?.type, queryClient]);
}