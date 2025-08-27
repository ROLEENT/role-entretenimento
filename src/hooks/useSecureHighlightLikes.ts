import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecureHighlightLikes = (highlightId: string) => {
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLikeData = async () => {
    try {
      setLoading(true);
      
      // Buscar contagem de likes diretamente da tabela
      const { count: likeCountData, error: likeCountError } = await supabase
        .from('highlight_likes')
        .select('*', { count: 'exact', head: true })
        .eq('highlight_id', highlightId);

      // Verificar se usuário curtiu (se autenticado)
      const { data: { user } } = await supabase.auth.getUser();
      let hasLikedData = false;
      
      if (user) {
        const { data: userLikeData, error: userLikeError } = await supabase
          .from('highlight_likes')
          .select('*')
          .eq('highlight_id', highlightId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        hasLikedData = !!userLikeData && !userLikeError;
      }

      if (likeCountError) {
        console.error('Erro ao buscar contagem de likes:', likeCountError);
        return;
      }

      setLikeCount(likeCountData || 0);
      setHasLiked(hasLikedData);
    } catch (error) {
      console.error('Erro ao buscar dados de likes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikeData();
  }, [highlightId]);

  const toggleLike = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      if (hasLiked) {
        // Remove like
        const { error } = await supabase
          .from('highlight_likes')
          .delete()
          .eq('highlight_id', highlightId)
          .eq('user_id', user.user.id);

        if (error) throw error;
      } else {
        // Add like
        const { error } = await supabase
          .from('highlight_likes')
          .insert({
            highlight_id: highlightId,
            user_id: user.user.id
          });

        if (error) throw error;
      }

      // Refresh data
      await fetchLikeData();
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  };

  return {
    likeCount,
    hasLiked,
    loading,
    toggleLike,
    refetch: fetchLikeData
  };
};