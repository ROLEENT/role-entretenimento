import { supabase } from '@/integrations/supabase/client';

export interface HighlightReview {
  id: string;
  highlight_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export const highlightReviewService = {
  async getHighlightReviews(highlightId: string): Promise<HighlightReview[]> {
    const { data, error } = await supabase
      .from('highlight_reviews')
      .select(`
        *,
        user:profiles(display_name, avatar_url)
      `)
      .eq('highlight_id', highlightId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addHighlightReview(highlightId: string, rating: number, comment?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('highlight_reviews')
      .insert({
        highlight_id: highlightId,
        user_id: user.id,
        rating,
        comment
      });

    if (error) throw error;
  },

  async updateHighlightReview(reviewId: string, rating: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('highlight_reviews')
      .update({ 
        rating, 
        comment, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', reviewId);

    if (error) throw error;
  },

  async deleteHighlightReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('highlight_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  async getUserReview(highlightId: string, userId: string): Promise<HighlightReview | null> {
    const { data, error } = await supabase
      .from('highlight_reviews')
      .select('*')
      .eq('highlight_id', highlightId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
};