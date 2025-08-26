import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  post_id: string;
  user_id: string | null;
  display_name: string;
  email_hash: string;
  content: string;
  created_at: string;
  is_hidden: boolean;
  parent_id: string | null;
}

export const useSecureBlogComments = (postId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      setLoading(true);
      
      // Buscar apenas comentários visíveis (is_hidden = false)
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('post_id', postId)
        .eq('is_hidden', false)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error("Erro ao carregar comentários:", error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const addComment = async (
    displayName: string, 
    email: string, 
    content: string, 
    parentId?: string
  ) => {
    try {
      // Use backend function to generate email hash
      const { data: emailHash, error: hashError } = await supabase.rpc('hash_email_for_client', {
        email_input: email
      });
      
      if (hashError) throw hashError;

      const { error } = await supabase.rpc('add_blog_comment_secure_hash', {
        p_post_id: postId,
        p_author_name: displayName.trim(),
        p_email_hash: emailHash,
        p_content: content.trim(),
        p_parent_id: parentId || null
      });

      if (error) throw error;

      // Recarregar comentários
      await loadComments();
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      return { success: false, error };
    }
  };

  return {
    comments,
    loading,
    addComment,
    refresh: loadComments
  };
};