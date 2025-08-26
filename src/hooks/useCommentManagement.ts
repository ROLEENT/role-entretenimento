import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  is_hidden: boolean;
  created_at: string;
  post_title?: string;
}

export const useCommentManagement = () => {
  const [loading, setLoading] = useState(false);

  const getComments = useCallback(async (filters: { approved?: boolean; search?: string } = {}) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_blog_comments_admin');

      if (error) throw error;
      
      let filteredData = data || [];
      
      if (filters.approved !== undefined) {
        filteredData = filteredData.filter((comment: Comment) => comment.is_approved === filters.approved);
      }
      
      if (filters.search) {
        filteredData = filteredData.filter((comment: Comment) => 
          comment.content.toLowerCase().includes(filters.search!.toLowerCase()) ||
          comment.author_name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          (comment.post_title && comment.post_title.toLowerCase().includes(filters.search!.toLowerCase()))
        );
      }
      
      return filteredData;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      toast.error(error.message || 'Erro ao carregar comentários');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const approveComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('approve_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;
      
      toast.success('Comentário aprovado!');
      return true;
    } catch (error: any) {
      console.error('Error approving comment:', error);
      toast.error(error.message || 'Erro ao aprovar comentário');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('reject_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;
      
      toast.success('Comentário rejeitado!');
      return true;
    } catch (error: any) {
      console.error('Error rejecting comment:', error);
      toast.error(error.message || 'Erro ao rejeitar comentário');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('delete_blog_comment', {
        p_comment_id: commentId
      });

      if (error) throw error;
      
      toast.success('Comentário removido!');
      return true;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast.error(error.message || 'Erro ao remover comentário');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getComments,
    approveComment,
    rejectComment,
    deleteComment
  };
};