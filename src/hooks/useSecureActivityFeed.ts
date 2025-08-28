import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  actor_id: string;
  type: 'follow' | 'event_favorite' | 'highlight_like' | 'comment' | 'profile_update';
  object_type?: 'user' | 'event' | 'highlight' | 'comment';
  object_id?: string;
  data: any;
  created_at: string;
  actor_profile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useSecureActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    fetchActivityFeed();

    // Configurar realtime para atividades
    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          fetchActivityWithProfile(payload.new as ActivityFeedItem);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchActivityFeed = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          actor_profile:profiles!activity_feed_actor_id_fkey(
            display_name,
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Erro ao buscar feed de atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityWithProfile = async (activity: ActivityFeedItem) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, username, avatar_url')
        .eq('user_id', activity.actor_id)
        .single();

      const activityWithProfile = {
        ...activity,
        actor_profile: profile
      };

      setActivities(prev => [activityWithProfile, ...prev]);
    } catch (error) {
      console.error('Erro ao buscar perfil do ator:', error);
      setActivities(prev => [activity, ...prev]);
    }
  };

  const createTestData = async () => {
    if (!user) return;

    const testActivities = [
      {
        user_id: user.id,
        actor_id: user.id,
        type: 'event_favorite',
        object_type: 'event',
        object_id: crypto.randomUUID(),
        data: { event_title: 'Festival de Rock no Parque' }
      },
      {
        user_id: user.id,
        actor_id: user.id,
        type: 'highlight_like',
        object_type: 'highlight',
        object_id: crypto.randomUUID(),
        data: {}
      },
      {
        user_id: user.id,
        actor_id: user.id,
        type: 'follow',
        object_type: 'user',
        object_id: crypto.randomUUID(),
        data: {}
      }
    ];

    try {
      const { error } = await supabase
        .from('activity_feed')
        .insert(testActivities);

      if (error) throw error;
      fetchActivityFeed();
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
    }
  };

  const getActivityMessage = (activity: ActivityFeedItem): string => {
    const actorName = activity.actor_profile?.display_name || 
                     activity.actor_profile?.username || 
                     'Usuário';

    switch (activity.type) {
      case 'follow':
        return `${actorName} começou a te seguir`;
      case 'event_favorite':
        const eventTitle = activity.data?.event_title || 'um evento';
        return `${actorName} marcou interesse em ${eventTitle}`;
      case 'highlight_like':
        return `${actorName} curtiu um destaque`;
      case 'comment':
        return `${actorName} comentou`;
      case 'profile_update':
        return `${actorName} atualizou o perfil`;
      default:
        return `${actorName} fez uma ação`;
    }
  };

  return {
    activities,
    loading,
    getActivityMessage,
    refetch: fetchActivityFeed,
    createTestData
  };
};