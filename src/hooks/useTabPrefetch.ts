import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Profile } from '@/features/profiles/api';

export function useTabPrefetch(profile: Profile, activeTab: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profile) return;

    const prefetchDelay = 1000; // 1 second delay

    const timer = setTimeout(() => {
      // Prefetch events if not on agenda tab
      if (activeTab !== 'agenda') {
        queryClient.prefetchQuery({
          queryKey: ['profile-events', profile.handle, profile.type],
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }

      // Prefetch media if not on midia tab
      if (activeTab !== 'midia') {
        queryClient.prefetchQuery({
          queryKey: ['profile-media', profile.user_id],
          staleTime: 5 * 60 * 1000, // 5 minutes
        });
      }
    }, prefetchDelay);

    return () => clearTimeout(timer);
  }, [activeTab, profile, queryClient]);
}