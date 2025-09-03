import { useEffect } from 'react';
import { Profile } from '@/features/profiles/api';

interface AnalyticsEvent {
  event: string;
  profile_id: string;
  profile_handle: string;
  tab?: string;
  timestamp: number;
}

export function useProfileAnalytics(profile: Profile, activeTab: string) {
  useEffect(() => {
    if (!profile) return;

    // Track profile view
    const viewEvent: AnalyticsEvent = {
      event: 'profile_view',
      profile_id: profile.id,
      profile_handle: profile.handle,
      timestamp: Date.now()
    };

    // In a real app, this would send to analytics service
    console.log('Analytics:', viewEvent);

    // Track tab change
    if (activeTab !== 'visao') {
      const tabEvent: AnalyticsEvent = {
        event: 'profile_tab_change',
        profile_id: profile.id,
        profile_handle: profile.handle,
        tab: activeTab,
        timestamp: Date.now()
      };

      console.log('Analytics:', tabEvent);
    }
  }, [profile, activeTab]);
}