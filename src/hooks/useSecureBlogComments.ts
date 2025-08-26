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
      // Criar hash SHA256 do email
      const encoder = new TextEncoder();
      const data = encoder.encode(email);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const emailHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          display_name: displayName.trim(),
          email_hash: emailHash,
          content: content.trim(),
          parent_id: parentId || null,
          is_hidden: false, // Comentários começam visíveis
          user_id: null // Para comentários anônimos
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