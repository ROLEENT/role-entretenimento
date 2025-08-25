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
  // Dados relacionados obtidos via joins
  actor_profile?: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useActivityFeed = () => {
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
          // Buscar dados do perfil do ator para a nova atividade
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
    refetch: fetchActivityFeed
  };
};