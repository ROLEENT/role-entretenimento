import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useFollowEntity(entityType: string, entityId: string) {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if user is following this entity
  useEffect(() => {
    if (!user?.id || !entityId) return;

    const checkFollowStatus = async () => {
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('user_id', user.id)
          .eq('entity_uuid', entityId)
          .eq('entity_type', entityType)
          .maybeSingle();

        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [user?.id, entityId, entityType]);

  const toggleFollow = async () => {
    if (!user?.id || !entityId || loading) return;

    setLoading(true);
    try {
      // Use the toggle_follow function from database
      const { data, error } = await supabase.rpc('toggle_follow', {
        p_entity_type: entityType,
        p_entity_uuid: entityId
      });

      if (error) throw error;

      // Toggle the state
      const newState = !isFollowing;
      setIsFollowing(newState);
      
      const entityTypeText = entityType === 'artist' ? 'artista' : 
                           entityType === 'venue' ? 'local' : 'organizador';
      
      toast.success(newState ? 
        `Agora você segue este ${entityTypeText}` : 
        `Deixou de seguir este ${entityTypeText}`
      );
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