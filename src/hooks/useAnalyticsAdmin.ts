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

export const useAnalyticsAdmin = () => {
  const [loading, setLoading] = useState(false);

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
    getTopContent
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