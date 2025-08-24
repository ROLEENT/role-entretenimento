import { supabase } from '@/integrations/supabase/client';

export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title?: string;
}

export const commentService = {
  // Get all comments for admin
  async getAllComments(): Promise<BlogComment[]> {
    const { data, error } = await supabase.rpc('get_blog_comments_admin');
    
    if (error) {
      throw new Error('Erro ao carregar comentários: ' + error.message);
    }
    
    return data || [];
  },

  // Approve a comment
  async approveComment(commentId: string): Promise<void> {
    const { error } = await supabase.rpc('approve_blog_comment', {
      p_comment_id: commentId
    });
    
    if (error) {
      throw new Error('Erro ao aprovar comentário: ' + error.message);
    }
  },

  // Reject a comment
  async rejectComment(commentId: string): Promise<void> {
    const { error } = await supabase.rpc('reject_blog_comment', {
      p_comment_id: commentId
    });
    
    if (error) {
      throw new Error('Erro ao rejeitar comentário: ' + error.message);
    }
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase.rpc('delete_blog_comment', {
      p_comment_id: commentId
    });
    
    if (error) {
      throw new Error('Erro ao deletar comentário: ' + error.message);
    }
  },

  // Add a new comment (for public use)
  async addComment(postId: string, authorName: string, authorEmail: string, content: string): Promise<void> {
    const { error } = await supabase
      .from('blog_comments')
      .insert({
        post_id: postId,
        author_name: authorName,
        author_email: authorEmail,
        content: content
      });
    
    if (error) {
      throw new Error('Erro ao adicionar comentário: ' + error.message);
    }
  },

  // Get approved comments for a post (for public viewing)
  async getPostComments(postId: string): Promise<BlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error('Erro ao carregar comentários: ' + error.message);
    }
    
    return data || [];
  }
};