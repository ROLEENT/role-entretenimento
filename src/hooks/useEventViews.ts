import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EventView {
  id: string;
  event_id: string;
  user_id?: string;
  session_id: string;
  created_at: string;
}

export const useEventViews = (eventId: string) => {
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      registerView();
      fetchViewCount();
    }
  }, [eventId]);

  const registerView = async () => {
    try {
      // Get or create session ID
      let sessionId = localStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID();
        localStorage.setItem('session_id', sessionId);
      }

      // Check if this session already viewed this event today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingView } = await supabase
        .from('analytics_events')
        .select('id')
        .eq('event_name', 'event_view')
        .eq('session_id', sessionId)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .eq('event_data->>event_id', eventId)
        .maybeSingle();

      // Only register view if not already viewed today
      if (!existingView) {
        await supabase
          .from('analytics_events')
          .insert({
            event_name: 'event_view',
            session_id: sessionId,
            event_data: { event_id: eventId },
            page_url: window.location.href,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent,
          });
      }
    } catch (error) {
      console.error('Error registering event view:', error);
    }
  };

  const fetchViewCount = async () => {
    try {
      setLoading(true);
      
      const { count, error } = await supabase
        .from('analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_name', 'event_view')
        .eq('event_data->>event_id', eventId);

      if (error) throw error;
      
      setViewCount(count || 0);
    } catch (error) {
      console.error('Error fetching view count:', error);
      setViewCount(0);
    } finally {
      setLoading(false);
    }
  };

  return {
    viewCount,
    loading,
    refetch: fetchViewCount,
  };
};