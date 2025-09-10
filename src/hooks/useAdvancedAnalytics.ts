import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { telemetry } from '@/lib/telemetry';

interface ConversionFunnel {
  step: string;
  count: number;
  conversionRate?: number;
}

interface UserCohort {
  period: string;
  newUsers: number;
  returningUsers: number;
  retentionRate: number;
}

interface TopPerformer {
  id: string;
  name: string;
  type: 'event' | 'artist' | 'venue';
  metrics: {
    views: number;
    saves: number;
    shares: number;
    clicks: number;
  };
}

export const useAdvancedAnalytics = () => {
  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [userCohorts, setUserCohorts] = useState<UserCohort[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, []);

  const fetchAdvancedAnalytics = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchConversionFunnel(),
        fetchUserCohorts(),
        fetchTopPerformers()
      ]);
    } catch (error) {
      console.error('Error fetching advanced analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversionFunnel = async () => {
    try {
      // Fetch analytics events for funnel analysis
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, event_data')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process funnel data
      const funnelSteps = [
        { step: 'Visualizações', events: ['pageview', 'event_page_view'] },
        { step: 'Eventos salvos', events: ['event_save'] },
        { step: 'Cliques em ingressos', events: ['ticket_click', 'cta_click'] },
        { step: 'Compartilhamentos', events: ['event_share'] }
      ];

      const funnelData = funnelSteps.map((step, index) => {
        const count = events?.filter(e => step.events.includes(e.event_name)).length || 0;
        const previousCount = index > 0 ? conversionFunnel[index - 1]?.count : count;
        const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 100;
        
        return {
          step: step.step,
          count,
          conversionRate: index > 0 ? conversionRate : undefined
        };
      });

      setConversionFunnel(funnelData);
    } catch (error) {
      console.error('Error fetching conversion funnel:', error);
    }
  };

  const fetchUserCohorts = async () => {
    try {
      // Simulate cohort data - in real implementation, this would analyze user behavior patterns
      const mockCohorts: UserCohort[] = [
        { period: 'Esta semana', newUsers: 124, returningUsers: 89, retentionRate: 71.8 },
        { period: 'Semana passada', newUsers: 98, returningUsers: 76, retentionRate: 77.6 },
        { period: 'Há 2 semanas', newUsers: 156, returningUsers: 95, retentionRate: 60.9 },
        { period: 'Há 3 semanas', newUsers: 134, returningUsers: 82, retentionRate: 61.2 }
      ];

      setUserCohorts(mockCohorts);
    } catch (error) {
      console.error('Error fetching user cohorts:', error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      // Fetch analytics events and aggregate by content
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('event_name, event_data')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Process top performers data
      const performersMap = new Map();

      events?.forEach(event => {
        const eventData = event.event_data as any;
        const id = eventData.event_id || eventData.artist_id || eventData.venue_id;
        const name = eventData.event_title || eventData.artist_name || eventData.venue_name;
        const type = eventData.event_id ? 'event' : eventData.artist_id ? 'artist' : 'venue';

        if (id && name) {
          if (!performersMap.has(id)) {
            performersMap.set(id, {
              id,
              name,
              type,
              metrics: { views: 0, saves: 0, shares: 0, clicks: 0 }
            });
          }

          const performer = performersMap.get(id);
          switch (event.event_name) {
            case 'pageview':
            case 'event_page_view':
              performer.metrics.views++;
              break;
            case 'event_save':
              performer.metrics.saves++;
              break;
            case 'event_share':
              performer.metrics.shares++;
              break;
            case 'ticket_click':
            case 'cta_click':
              performer.metrics.clicks++;
              break;
          }
        }
      });

      const topPerformersArray = Array.from(performersMap.values())
        .sort((a, b) => {
          const scoreA = a.metrics.views + a.metrics.saves * 2 + a.metrics.shares * 3 + a.metrics.clicks * 5;
          const scoreB = b.metrics.views + b.metrics.saves * 2 + b.metrics.shares * 3 + b.metrics.clicks * 5;
          return scoreB - scoreA;
        })
        .slice(0, 10);

      setTopPerformers(topPerformersArray);
    } catch (error) {
      console.error('Error fetching top performers:', error);
    }
  };

  // Enhanced tracking functions
  const trackEventSaved = (eventId: string, eventTitle: string) => {
    telemetry.track('event_save', {
      event_id: eventId,
      event_title: eventTitle,
      timestamp: new Date().toISOString()
    });
  };

  const trackArtistFollowed = (artistId: string, artistName: string) => {
    telemetry.track('artist_follow', {
      artist_id: artistId,
      artist_name: artistName,
      timestamp: new Date().toISOString()
    });
  };

  const trackAlertActivated = (type: string, targetId: string, targetName: string) => {
    telemetry.track('alert_activated', {
      alert_type: type,
      target_id: targetId,
      target_name: targetName,
      timestamp: new Date().toISOString()
    });
  };

  const trackShare = (type: string, id: string, platform: string) => {
    telemetry.track('content_share', {
      content_type: type,
      content_id: id,
      platform,
      timestamp: new Date().toISOString()
    });
  };

  return {
    conversionFunnel,
    userCohorts,
    topPerformers,
    loading,
    refetch: fetchAdvancedAnalytics,
    // Enhanced tracking methods
    trackEventSaved,
    trackArtistFollowed,
    trackAlertActivated,
    trackShare
  };
};