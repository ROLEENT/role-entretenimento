import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecureComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

export const useSecureComments = (postId: string) => {
  const [comments, setComments] = useState<SecureComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      // Use nova política RLS que protege emails dos autores
      const { data, error } = await supabase
        .from('blog_comments')
        .select('id, post_id, author_name, content, created_at, parent_id')
        .eq('post_id', postId as any)
        .eq('is_approved', true as any)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments((data as any) || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const addComment = async (authorName: string, authorEmail: string, content: string, parentId?: string) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          author_name: authorName,
          author_email: authorEmail,
          content: content,
          parent_id: parentId || null
        } as any);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding comment:', error);
      return { success: false, error };
    }
  };

  return {
    comments,
    loading,
    addComment,
    refetch: fetchComments
  };
};