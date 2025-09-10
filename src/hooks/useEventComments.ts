import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface EventComment {
  id: string;
  content: string;
  user_id: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  like_count: number;
  is_edited: boolean;
  edited_at?: string;
  user_liked?: boolean;
  user_profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
  replies?: EventComment[];
}

export function useEventComments(eventId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<EventComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchComments();
      subscribeToComments();
    }
  }, [eventId, user?.id]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Fetch top-level comments first
      const { data: topLevelComments, error } = await supabase
        .from('event_comments')
        .select(`
          id,
          content,
          user_id,
          parent_id,
          created_at,
          updated_at,
          like_count,
          is_edited,
          edited_at,
          user_profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch replies for each top-level comment
      const commentsWithReplies = await Promise.all(
        (topLevelComments || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('event_comments')
            .select(`
              id,
              content,
              user_id,
              parent_id,
              created_at,
              updated_at,
              like_count,
              is_edited,
              edited_at,
              user_profiles!inner (
                display_name,
                avatar_url
              )
            `)
            .eq('parent_id', comment.id)
            .order('created_at', { ascending: true });

          // Check if user liked each comment/reply
          let userLikedStatus = {};
          if (user?.id) {
            const allCommentIds = [comment.id, ...(replies || []).map(r => r.id)];
            const { data: userLikes } = await supabase
              .from('comment_likes')
              .select('comment_id')
              .eq('user_id', user.id)
              .in('comment_id', allCommentIds);

            userLikedStatus = Object.fromEntries(
              (userLikes || []).map(like => [like.comment_id, true])
            );
          }

          return {
            ...comment,
            user_liked: userLikedStatus[comment.id] || false,
            user_profiles: Array.isArray(comment.user_profiles) ? comment.user_profiles[0] : comment.user_profiles,
            replies: (replies || []).map(reply => ({
              ...reply,
              user_liked: userLikedStatus[reply.id] || false,
              user_profiles: Array.isArray(reply.user_profiles) ? reply.user_profiles[0] : reply.user_profiles
            }))
          } as EventComment;
        })
      );

      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Erro ao carregar comentários');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`event-comments-${eventId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'event_comments',
        filter: `event_id=eq.${eventId}`
      }, () => {
        fetchComments();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comment_likes'
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addComment = async (content: string, parentId?: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para comentar');
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_comments')
        .insert({
          event_id: eventId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId || null
        });

      if (error) throw error;

      toast.success(parentId ? 'Resposta adicionada!' : 'Comentário adicionado!');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const editComment = async (commentId: string, newContent: string): Promise<boolean> => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_comments')
        .update({
          content: newContent.trim(),
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comentário editado');
      return true;
    } catch (error) {
      console.error('Error editing comment:', error);
      toast.error('Erro ao editar comentário');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Comentário removido');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Erro ao remover comentário');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCommentLike = async (commentId: string) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado para curtir');
      return false;
    }

    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Remove like
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id);
      } else {
        // Add like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          });
      }

      return true;
    } catch (error) {
      console.error('Error toggling comment like:', error);
      toast.error('Erro ao curtir comentário');
      return false;
    }
  };

  return {
    comments,
    loading,
    submitting,
    addComment,
    editComment,
    deleteComment,
    toggleCommentLike,
    refetch: fetchComments
  };
}