import { useState, useEffect } from 'react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useFollowProfile(profileId: string) {
  const { user, isAuthenticated } = useUserAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is following this profile
  useEffect(() => {
    if (!user?.id || !profileId) return;

    const checkFollowStatus = async () => {
      try {
        const { data } = await supabase
          .from('profile_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('profile_id', profileId)
          .maybeSingle();

        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user?.id, profileId]);

  const toggleFollow = async () => {
    if (!user?.id || !profileId || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('profile_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('profile_id', profileId);

        if (error) throw error;

        setIsFollowing(false);
        toast.success('Deixou de seguir');
      } else {
        // Follow
        const { error } = await supabase
          .from('profile_follows')
          .insert({
            follower_id: user.id,
            profile_id: profileId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast.success('Agora você segue este perfil');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Erro ao atualizar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    toggleFollow,
    isAuthenticated
  };
}