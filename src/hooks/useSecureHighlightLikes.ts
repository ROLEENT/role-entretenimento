import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecureHighlightLikes = (highlightId: string) => {
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLikeData = async () => {
    try {
      // Use secure functions that don't expose user IDs
      const [countResult, hasLikedResult] = await Promise.all([
        supabase.rpc('get_highlight_like_count', { p_highlight_id: highlightId }),
        supabase.rpc('user_liked_highlight', { p_highlight_id: highlightId })
      ]);

      if (countResult.error) {
        console.error('Error getting like count:', countResult.error);
        return;
      }

      if (hasLikedResult.error) {
        console.error('Error checking like status:', hasLikedResult.error);
        return;
      }

      setLikeCount(countResult.data || 0);
      setHasLiked(hasLikedResult.data || false);
    } catch (error) {
      console.error('Error fetching like data:', error);
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