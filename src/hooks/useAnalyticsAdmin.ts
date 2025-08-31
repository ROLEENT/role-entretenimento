import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AnalyticsBasicData {
  date: string;
  page_views: number;
  unique_visitors: number;
  event_views: number;
  blog_views: number;
  top_events: { title: string; views: number }[];
  top_posts: { title: string; views: number }[];
  user_signups: number;
  highlights_likes: number;
}

export interface ComprehensiveAnalytics {
  events: {
    total_events: number;
    published_events: number;
    draft_events: number;
    events_in_period: number;
    total_views: number;
  };
  blog: {
    total_posts: number;
    published_posts: number;
    total_views: number;
    posts_in_period: number;
  };
  users: {
    total_favorites: number;
    total_checkins: number;
    total_comments: number;
    total_likes: number;
  };
  performance: {
    avg_page_load: number;
    avg_ttfb: number;
    total_sessions: number;
    error_rate: number;
  };
  popular_cities: Array<{ city: string; count: number }>;
  top_events: Array<{ title: string; views: number; city: string; created_at: string }>;
  analytics: {
    total_events: number;
    unique_sessions: number;
    unique_users: number;
    page_views: number;
    event_views: number;
  };
  period: {
    start_date: string;
    end_date: string;
    generated_at: string;
  };
}

export interface RealtimeMetrics {
  active_users_last_hour: number;
  page_views_last_hour: number;
  avg_load_time_last_hour: number;
  errors_last_hour: number;
  system_uptime: number;
  database_health: string;
}

export const useAnalyticsAdmin = () => {
  const [loading, setLoading] = useState(false);

  const getComprehensiveAnalytics = useCallback(async (
    adminEmail: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<ComprehensiveAnalytics | null> => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_comprehensive_analytics', {
        p_admin_email: adminEmail,
        p_start_date: startDate || undefined,
        p_end_date: endDate || undefined
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching comprehensive analytics:', error);
      toast.error(error.message || 'Erro ao carregar analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRealtimeMetrics = useCallback(async (adminEmail: string): Promise<RealtimeMetrics | null> => {
    try {
      const { data, error } = await supabase.rpc('get_realtime_metrics', {
        p_admin_email: adminEmail
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching realtime metrics:', error);
      toast.error(error.message || 'Erro ao carregar métricas em tempo real');
      return null;
    }
  }, []);

  const getAnalyticsData = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      
      // Get analytics events
      const { data: events, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (eventsError) throw eventsError;

      // Process analytics data
      const analytics = processAnalyticsData(events || []);
      
      return analytics;
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast.error(error.message || 'Erro ao carregar analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBasicStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get basic counts
      const [
        { count: eventsCount },
        { count: venuesCount },
        { count: organizersCount },
        { count: postsCount },
        { count: highlightsCount },
        { count: commentsCount }
      ] = await Promise.all([
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('venues').select('*', { count: 'exact', head: true }),
        supabase.from('organizers').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }),
        supabase.from('highlights').select('*', { count: 'exact', head: true }),
        supabase.from('blog_comments').select('*', { count: 'exact', head: true })
      ]);

      return {
        events: eventsCount || 0,
        venues: venuesCount || 0,
        organizers: organizersCount || 0,
        posts: postsCount || 0,
        highlights: highlightsCount || 0,
        comments: commentsCount || 0
      };
    } catch (error: any) {
      console.error('Error fetching basic stats:', error);
      toast.error(error.message || 'Erro ao carregar estatísticas');
      return {
        events: 0,
        venues: 0,
        organizers: 0,
        posts: 0,
        highlights: 0,
        comments: 0
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const getTopContent = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get top events and posts by views
      const { data: topEvents } = await supabase
        .from('events')
        .select('title, views')
        .order('views', { ascending: false })
        .limit(5);

      const { data: topPosts } = await supabase
        .from('blog_posts')
        .select('title, views')
        .order('views', { ascending: false })
        .limit(5);

      const { data: topHighlights } = await supabase
        .from('highlights')
        .select('event_title, like_count')
        .order('like_count', { ascending: false })
        .limit(5);

      return {
        events: topEvents || [],
        posts: topPosts || [],
        highlights: topHighlights || []
      };
    } catch (error: any) {
      console.error('Error fetching top content:', error);
      return {
        events: [],
        posts: [],
        highlights: []
      };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getAnalyticsData,
    getBasicStats,
    getTopContent,
    getComprehensiveAnalytics,
    getRealtimeMetrics
  };
};

// Helper function to process analytics data
function processAnalyticsData(events: any[]): AnalyticsBasicData[] {
  const dailyData: { [key: string]: AnalyticsBasicData } = {};
  
  events.forEach(event => {
    const date = event.created_at.split('T')[0];
    
    if (!dailyData[date]) {
      dailyData[date] = {
        date,
        page_views: 0,
        unique_visitors: 0,
        event_views: 0,
        blog_views: 0,
        top_events: [],
        top_posts: [],
        user_signups: 0,
        highlights_likes: 0
      };
    }
    
    switch (event.event_name) {
      case 'page_view':
        dailyData[date].page_views++;
        break;
      case 'event_view':
        dailyData[date].event_views++;
        break;
      case 'blog_view':
        dailyData[date].blog_views++;
        break;
      case 'user_signup':
        dailyData[date].user_signups++;
        break;
      case 'highlight_like':
        dailyData[date].highlights_likes++;
        break;
    }
  });
  
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date));
}