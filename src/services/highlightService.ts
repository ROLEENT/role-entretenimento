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

export interface Highlight {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  summary?: string;
  city: string;
  status: 'draft' | 'published';
  start_at: string;
  end_at: string;
  cover_url?: string;
  alt_text?: string;
  focal_point_x?: number;
  focal_point_y?: number;
  ticket_url?: string;
  tags: string[];
  type?: string;
  patrocinado: boolean;
  anunciante?: string;
  cupom?: string;
  meta_title?: string;
  meta_description?: string;
  noindex: boolean;
  event_id?: string;
  organizer_id?: string;
  venue_id?: string;
  priority: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export const highlightService = {
  async getHighlights(filters?: {
    city?: string;
    status?: string;
    search?: string;
  }): Promise<Highlight[]> {
    let query = supabase
      .from('highlights')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getHighlightById(id: string): Promise<Highlight | null> {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getHighlightBySlug(slug: string): Promise<Highlight | null> {
    const { data, error } = await supabase
      .from('highlights')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    let query = supabase
      .from('highlights')
      .select('id')
      .eq('slug', slug);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  async createHighlight(highlight: Omit<Highlight, 'id' | 'created_at' | 'updated_at'>): Promise<Highlight> {
    const { data, error } = await supabase
      .from('highlights')
      .insert(highlight)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateHighlight(id: string, highlight: Partial<Highlight>): Promise<Highlight> {
    const { data, error } = await supabase
      .from('highlights')
      .update({
        ...highlight,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteHighlight(id: string): Promise<void> {
    const { error } = await supabase
      .from('highlights')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getHighlightForDuplication(search: string): Promise<{ id: string; title: string; city: string; status: string }[]> {
    const { data, error } = await supabase
      .from('highlights')
      .select('id, title, city, status')
      .ilike('title', `%${search}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },
};

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