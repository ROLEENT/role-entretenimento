import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EngagementData {
  interests: any[];
  tickets: any[];
  attendance: any[];
  likes: any[];
  loading: boolean;
}

export const useUserEngagement = () => {
  const { user } = useAuth();
  const [data, setData] = useState<EngagementData>({
    interests: [],
    tickets: [],
    attendance: [],
    likes: [],
    loading: true,
  });

  const fetchUserEngagement = async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, loading: true }));

      // Buscar interesses do usuário
      const { data: interests, error: interestsError } = await supabase
        .from('event_engagement')
        .select(`
          *,
          events (id, title, image_url, date_start, city, venue:venues(name))
        `)
        .eq('user_id', user.id)
        .eq('engagement_type', 'interest')
        .order('created_at', { ascending: false });

      if (interestsError) throw interestsError;

      // Buscar ingressos comprados
      const { data: tickets, error: ticketsError } = await supabase
        .from('event_engagement')
        .select(`
          *,
          events (id, title, image_url, date_start, city, venue:venues(name))
        `)
        .eq('user_id', user.id)
        .eq('engagement_type', 'bought_ticket')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      // Buscar eventos que vai comparecer
      const { data: attendance, error: attendanceError } = await supabase
        .from('event_engagement')
        .select(`
          *,
          events (id, title, image_url, date_start, city, venue:venues(name))
        `)
        .eq('user_id', user.id)
        .eq('engagement_type', 'will_attend')
        .order('created_at', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Buscar highlights curtidos
      const { data: likes, error: likesError } = await supabase
        .from('highlight_likes')
        .select(`
          *,
          highlights (id, event_title, venue, image_url, event_date, city)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (likesError) throw likesError;

      setData({
        interests: interests || [],
        tickets: tickets || [],
        attendance: attendance || [],
        likes: likes || [],
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching user engagement:', error);
      setData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchUserEngagement();
  }, [user]);

  return {
    ...data,
    refetch: fetchUserEngagement,
  };
};