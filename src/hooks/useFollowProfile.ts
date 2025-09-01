import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from './usePublicAuth';
import { toast } from 'sonner';

export const useFollowProfile = (profileId?: string) => {
  const { user, isAuthenticated } = usePublicAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Verificar status de seguir
  useEffect(() => {
    if (!profileId || !user) return;

    const checkFollowStatus = async () => {
      try {
        const { data: followData } = await supabase
          .from('followers')
          .select('id')
          .eq('user_id', user.id)
          .eq('profile_id', profileId)
          .single();

        setIsFollowing(!!followData);

        // Buscar contagem de seguidores
        const { count } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('profile_id', profileId);

        setFollowerCount(count || 0);
      } catch (error) {
        console.error('Erro ao verificar status de seguir:', error);
      }
    };

    checkFollowStatus();
  }, [profileId, user]);

  const toggleFollow = async () => {
    if (!user || !profileId) {
      toast.error('Você precisa estar logado para seguir perfis');
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        // Deixar de seguir
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profileId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        toast.success('Você deixou de seguir este perfil');
      } else {
        // Seguir
        const { error } = await supabase
          .from('followers')
          .insert({
            user_id: user.id,
            profile_id: profileId,
            followed_at: new Date().toISOString()
          });

        if (error) throw error;

        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success('Você agora está seguindo este perfil');
      }
    } catch (error: any) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      toast.error('Erro ao atualizar status de seguimento');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followerCount,
    loading,
    toggleFollow,
    isAuthenticated,
    canFollow: isAuthenticated && !!profileId
  };
};