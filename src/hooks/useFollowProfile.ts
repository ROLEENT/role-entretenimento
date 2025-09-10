import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useFollowProfile(profileId: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is following this profile
  useEffect(() => {
    if (!user?.id || !profileId) return;

    const checkFollowStatus = async () => {
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('entity_uuid', profileId)
          .eq('entity_type', 'profile')
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
      // Use the toggle_follow function from database
      const { data, error } = await supabase.rpc('toggle_follow', {
        p_entity_type: 'profile',
        p_entity_uuid: profileId
      });

      if (error) throw error;

      // Toggle the state
      const newState = !isFollowing;
      setIsFollowing(newState);
      
      toast.success(newState ? 'Agora você segue este perfil' : 'Deixou de seguir');
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