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

export const useSecureBlogComments = (postId: string) => {
  const [comments, setComments] = useState<SecureComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      // Use the secure view that doesn't expose emails
      const { data, error } = await supabase
        .from('blog_comments_safe')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }

      setComments(data || []);
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
      // Use the secure function to add comments
      const { data, error } = await supabase.rpc('add_blog_comment_secure', {
        p_post_id: postId,
        p_author_name: authorName,
        p_author_email: authorEmail,
        p_content: content,
        p_parent_id: parentId || null
      });

      if (error) {
        throw error;
      }

      // Refresh comments after adding
      await fetchComments();
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