import { useEffect } from 'react';
import { queryClient } from '@/lib/queryClient';
import { Profile } from '@/features/profiles/api';

export function useTabPrefetch(profile: Profile | null | undefined, activeTab: string) {
  useEffect(() => {
    if (!profile?.id) return;

    // Prefetch related data based on current tab
    const prefetchKeys = {
      'agenda': [`profile-events`, profile.id],
      'conteudos': [`profile-content`, profile.id],
      'fotos-videos': [`profile-media`, profile.id],
      'avaliacoes': [`profile-reviews`, profile.id],
    };

    Object.entries(prefetchKeys).forEach(([tab, queryKey]) => {
      if (tab !== activeTab) {
        // Prefetch other tabs with lower priority
        setTimeout(() => {
          queryClient.prefetchQuery({
            queryKey,
            queryFn: () => Promise.resolve([]), // Placeholder
            staleTime: 5 * 60 * 1000,
          });
        }, 1000);
      }
    });
  }, [profile?.id, activeTab]);
}
