import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Event = Database['public']['Tables']['events']['Row'] & {
  venue?: Database['public']['Tables']['venues']['Row'];
  organizer?: Database['public']['Tables']['organizers']['Row'];
  categories?: { category: Database['public']['Tables']['categories']['Row'] }[];
  favorites_count?: number;
  is_favorited?: boolean;
  reviews_avg?: number;
  reviews_count?: number;
};

export interface EventFilters {
  city?: string;
  search?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
}

export const eventService = {
  async getEvents(filters: EventFilters = {}, limit = 20, offset = 0): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*),
        categories:event_categories(category:categories(*))
      `)
      .eq('status', 'published')
      .order('date_start', { ascending: true })
      .range(offset, offset + limit - 1);

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.priceMin !== undefined) {
      query = query.gte('price_min', filters.priceMin);
    }

    if (filters.priceMax !== undefined) {
      query = query.lte('price_max', filters.priceMax);
    }

    if (filters.dateStart) {
      query = query.gte('date_start', filters.dateStart);
    }

    if (filters.dateEnd) {
      query = query.lte('date_start', filters.dateEnd);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getEventById(id: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*),
        categories:event_categories(category:categories(*))
      `)
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (error) return null;
    return data;
  },

  async getNearbyEvents(lat: number, lng: number, radiusKm = 50): Promise<any[]> {
    const { data, error } = await supabase.rpc('get_nearby_events', {
      lat,
      lng,
      radius_km: radiusKm
    });

    if (error) throw error;
    return data || [];
  },

  async getFeaturedEvents(limit = 6): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*),
        categories:event_categories(category:categories(*))
      `)
      .eq('status', 'published')
      .gte('date_start', new Date().toISOString())
      .order('date_start', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getEventsByCity(city: string, limit = 20): Promise<Event[]> {
    return this.getEvents({ city }, limit);
  },

  async getTodaysEvents(): Promise<Event[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    return this.getEvents({
      dateStart: startOfDay,
      dateEnd: endOfDay
    });
  }
};

export const favoriteService = {
  async getFavorites(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('event_favorites')
      .select(`
        event:events(
          *,
          venue:venues(*),
          organizer:organizers(*),
          categories:event_categories(category:categories(*))
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return (data as any)?.map((item: any) => item.event).filter(Boolean) || [];
  },

  async addFavorite(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('event_favorites')
      .insert({ event_id: eventId, user_id: (await supabase.auth.getUser()).data.user?.id });

    if (error) throw error;
  },

  async removeFavorite(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('event_favorites')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (error) throw error;
  },

  async isFavorited(eventId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('event_favorites')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    return !error && !!data;
  }
};

export const reviewService = {
  async getEventReviews(eventId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles(display_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addReview(eventId: string, rating: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .insert({
        event_id: eventId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        rating,
        comment
      });

    if (error) throw error;
  },

  async updateReview(reviewId: string, rating: number, comment?: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) throw error;
  },

  async deleteReview(reviewId: string): Promise<void> {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  }
};