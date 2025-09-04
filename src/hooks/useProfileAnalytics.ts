import { useEffect, useRef } from 'react';
import { Profile } from '@/features/profiles/api';

interface AnalyticsEvent {
  event: string;
  profile_id: string;
  profile_handle: string;
  tab?: string;
  timestamp: number;
}

export function useProfileAnalytics(profile: Profile, activeTab: string) {
  const lastTrackedTabRef = useRef<string>('');
  const profileViewTrackedRef = useRef<string>('');

  useEffect(() => {
    if (!profile?.id || !profile?.handle) return;

    try {
      // Track profile view only once per profile
      if (profileViewTrackedRef.current !== profile.id) {
        profileViewTrackedRef.current = profile.id;
        
        const viewEvent: AnalyticsEvent = {
          event: 'profile_view',
          profile_id: profile.id,
          profile_handle: profile.handle,
          timestamp: Date.now()
        };

        // In a real app, this would send to analytics service
        console.debug('Analytics:', viewEvent);
      }
    } catch (error) {
      // Silently handle analytics errors
      console.debug('Analytics error:', error);
    }
  }, [profile?.id, profile?.handle]);

  useEffect(() => {
    if (!profile?.id || !profile?.handle) return;
    
    try {
      // Track tab change only when tab actually changes
      if (activeTab !== 'visao-geral' && lastTrackedTabRef.current !== activeTab) {
        lastTrackedTabRef.current = activeTab;
        
        const tabEvent: AnalyticsEvent = {
          event: 'profile_tab_change',
          profile_id: profile.id,
          profile_handle: profile.handle,
          tab: activeTab,
          timestamp: Date.now()
        };

        console.debug('Analytics:', tabEvent);
      }
    } catch (error) {
      // Silently handle analytics errors
      console.debug('Analytics error:', error);
    }
  }, [profile?.id, profile?.handle, activeTab]);
}