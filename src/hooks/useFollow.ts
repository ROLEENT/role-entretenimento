import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface FollowStats {
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<FollowStats>({
    followers_count: 0,
    following_count: 0,
    is_following: false
  });
  const [loading, setLoading] = useState(false);

  const checkFollowStatus = async () => {
    if (!user || !targetUserId) return;

    try {
      // Verificar se está seguindo
      const { data: followData } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single();

      // Buscar contadores
      const { data: profileData } = await supabase
        .from('profiles')
        .select('followers_count, following_count')
        .eq('user_id', targetUserId)
        .single();

      setStats({
        followers_count: profileData?.followers_count || 0,
        following_count: profileData?.following_count || 0,
        is_following: !!followData
      });
    } catch (error) {
      console.error('Erro ao verificar status de seguir:', error);
    }
  };

  const toggleFollow = async () => {
    if (!user || !targetUserId || loading) return;

    setLoading(true);
    try {
      if (stats.is_following) {
        // Deixar de seguir
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        setStats(prev => ({
          ...prev,
          followers_count: prev.followers_count - 1,
          is_following: false
        }));
        
        toast.success('Deixou de seguir');
      } else {
        // Seguir
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        setStats(prev => ({
          ...prev,
          followers_count: prev.followers_count + 1,
          is_following: true
        }));
        
        toast.success('Agora você está seguindo');
      }
    } catch (error: any) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error('Erro ao atualizar relacionamento');
    } finally {
      setLoading(false);
    }
  };

  const getFollowers = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('follows')
        .select(`
          follower_id,
          profiles!follows_follower_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('following_id', userId);

      return data?.map(item => item.profiles) || [];
    } catch (error) {
      console.error('Erro ao buscar seguidores:', error);
      return [];
    }
  };

  const getFollowing = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('follows')
        .select(`
          following_id,
          profiles!follows_following_id_fkey (
            user_id,
            username,
            display_name,
            avatar_url,
            is_verified
          )
        `)
        .eq('follower_id', userId);

      return data?.map(item => item.profiles) || [];
    } catch (error) {
      console.error('Erro ao buscar seguindo:', error);
      return [];
    }
  };

  useEffect(() => {
    if (targetUserId) {
      checkFollowStatus();
    }
  }, [targetUserId, user]);

  return {
    stats,
    loading,
    toggleFollow,
    getFollowers,
    getFollowing,
    refetch: checkFollowStatus
  };
};