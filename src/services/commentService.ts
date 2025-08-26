import { supabase } from '@/integrations/supabase/client';

// Admin interface with email hash for privacy
export interface BlogComment {
  id: string;
  post_id: string;
  author_name: string;
  email_hash: string; // Changed from author_email to email_hash
  content: string;
  is_approved: boolean;
  created_at: string;
  post_title?: string;
}

// Public interface without email exposure
export interface PublicBlogComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  parent_id?: string;
}

export const commentService = {
  // Get all comments for admin
  async getAllComments(): Promise<BlogComment[]> {
    const { data, error } = await supabase.rpc('get_blog_comments_admin_hash');
    
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

  // Add a new comment (for public use) - now uses email hash
  async addComment(postId: string, authorName: string, authorEmail: string, content: string): Promise<void> {
    // Generate email hash using backend function
    const { data: emailHash, error: hashError } = await supabase.rpc('hash_email_for_client', {
      email_input: authorEmail
    });
    
    if (hashError) {
      throw new Error('Erro ao processar email: ' + hashError.message);
    }

    const { error } = await supabase.rpc('add_blog_comment_secure_hash', {
      p_post_id: postId,
      p_author_name: authorName,
      p_email_hash: emailHash,
      p_content: content
    });
    
    if (error) {
      throw new Error('Erro ao adicionar comentário: ' + error.message);
    }
  },

  // Get approved comments for a post (for public viewing) - NO EMAIL EXPOSURE
  async getPostComments(postId: string): Promise<PublicBlogComment[]> {
    const { data, error } = await supabase
      .from('blog_comments_public')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) {
      throw new Error('Erro ao carregar comentários: ' + error.message);
    }
    
    return data || [];
  }
};