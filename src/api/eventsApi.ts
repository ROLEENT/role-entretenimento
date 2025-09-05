import { supabase } from '@/integrations/supabase/client';
import type { EventFormData } from '@/schemas/eventSchema';

// Types for API responses
export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  slug: string;
  
  // Event timing
  date_start: string;
  date_end?: string;
  doors_open_utc?: string;
  headliner_starts_utc?: string;
  
  // Location
  venue_id?: string;
  location_name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Media
  image_url?: string;
  cover_url?: string;
  cover_alt?: string;
  gallery?: string[];
  
  // Pricing
  price_min?: number;
  price_max?: number;
  currency?: string;
  
  // Tickets
  ticket_url?: string;
  ticketing?: any;
  ticket_rules?: any[];
  
  // Classifications
  age_rating?: 'livre' | '10' | '12' | '14' | '16' | '18';
  age_notes?: string;
  genres?: string[];
  tags?: string[];
  
  // Highlighting
  highlight_type?: 'none' | 'curatorial' | 'vitrine';
  is_sponsored?: boolean;
  
  // Meta
  links?: any;
  accessibility?: any;
  seo_title?: string;
  seo_description?: string;
  og_image_url?: string;
  
  // Series
  series_id?: string;
  edition_number?: number;
  
  // Status
  status?: 'draft' | 'published' | 'archived';
  visibility?: string;
  
  // Relations
  venue?: any;
  organizer?: any;
  categories?: any[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  stage_name: string;
  artist_type: string;
  city?: string;
  instagram?: string;
  booking_email?: string;
  booking_whatsapp?: string;
  bio_short?: string;
  profile_image_url?: string;
  slug: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  name: string;
  city?: string;
  address?: string;
  type?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Organizer {
  id: string;
  name: string;
  city?: string;
  contact_email?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  city?: string;
  search?: string;
  categories?: string[];
  genres?: string[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
  status?: string;
  highlight_type?: string;
}

export interface CreateEventData {
  event_data: any;
  partners?: any[];
  lineup_slots?: any[];
  performances?: any[];
  visual_artists?: any[];
}

// Events API
export const eventsApi = {
  // Event CRUD operations
  async getEvents(filters: EventFilters = {}, limit = 20, offset = 0): Promise<Event[]> {
    let query = supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*),
        categories:event_categories(category:categories(*))
      `)
      .range(offset, offset + limit - 1)
      .order('date_start', { ascending: true });

    // Apply filters
    if (filters.city) {
      query = query.eq('city', filters.city);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.highlight_type) {
      query = query.eq('highlight_type', filters.highlight_type);
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
      query = query.lte('date_end', filters.dateEnd);
    }

    if (filters.genres && filters.genres.length > 0) {
      query = query.overlaps('genres', filters.genres);
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
        categories:event_categories(category:categories(*)),
        partners:event_partners(
          partner_id,
          partner_type,
          role,
          display_name,
          position,
          is_main,
          partner:partners(*)
        ),
        lineup_slots:event_lineup_slots(
          id,
          slot_name,
          start_time,
          end_time,
          stage,
          position,
          is_headliner,
          notes,
          artists:event_lineup_slot_artists(
            artist_id,
            artist_name,
            position,
            role,
            artist:artists(*)
          )
        ),
        performances:event_performances(*),
        visual_artists:event_visual_artists(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getEventBySlug(slug: string): Promise<Event | null> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*),
        categories:event_categories(category:categories(*))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async createEvent(eventData: CreateEventData): Promise<string> {
    try {
      console.log("📡 Chamando RPC create_event_cascade com dados:", {
        event_data_keys: Object.keys(eventData.event_data || {}),
        partners_count: eventData.partners?.length || 0,
        lineup_slots_count: eventData.lineup_slots?.length || 0,
        performances_count: eventData.performances?.length || 0,
        visual_artists_count: eventData.visual_artists?.length || 0
      });

      const { data, error } = await supabase.rpc('create_event_cascade', {
        event_data: eventData.event_data,
        partners: eventData.partners || [],
        lineup_slots: eventData.lineup_slots || [],
        performances: eventData.performances || [],
        visual_artists: eventData.visual_artists || []
      });

      if (error) {
        console.error("🚨 Erro na RPC create_event_cascade:", {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Erro no banco de dados: ${error.message} (${error.code})`);
      }

      if (!data) {
        throw new Error("RPC não retornou ID do evento criado");
      }

      console.log("✅ RPC create_event_cascade executada com sucesso. ID retornado:", data);
      return data;
    } catch (error) {
      console.error("❌ Erro na função createEvent:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido ao criar evento");
    }
  },

  async updateEvent(id: string, eventData: Partial<EventFormData>): Promise<Event> {
    try {
      console.log("🔄 Atualizando evento:", { 
        id, 
        keys: Object.keys(eventData),
        title: eventData.title,
        status: eventData.status 
      });

      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error("🚨 Erro ao atualizar evento:", {
          error,
          code: error.code,
          message: error.message,
          eventId: id
        });
        throw new Error(`Erro ao atualizar evento: ${error.message} (${error.code})`);
      }

      if (!data) {
        throw new Error("Evento não encontrado para atualização");
      }

      console.log("✅ Evento atualizado com sucesso:", data.id);
      return data;
    } catch (error) {
      console.error("❌ Erro na função updateEvent:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido ao atualizar evento");
    }
  },

  async deleteEvent(id: string): Promise<void> {
    try {
      console.log("🗑️ Iniciando exclusão do evento:", id);
      
      // Get current user session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Usuário não autenticado. Faça login para excluir eventos.');
      }

      console.log("✅ Usuário autenticado:", session.user.email);

      // Direct deletion - RLS policy now allows authenticated users
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("🚨 Erro ao excluir evento:", error);
        if (error.code === 'PGRST116') {
          throw new Error('Evento não encontrado');
        }
        throw new Error(`Erro ao excluir evento: ${error.message}`);
      }

      console.log("✅ Evento excluído com sucesso:", id);
    } catch (error) {
      console.error("❌ Erro na função deleteEvent:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro desconhecido ao excluir evento");
    }
  },

  async getNearbyEvents(lat: number, lng: number, radiusKm = 10): Promise<Event[]> {
    const { data, error } = await supabase.rpc('get_nearby_events', {
      latitude: lat,
      longitude: lng,
      radius_km: radiusKm
    });

    if (error) throw error;
    return data || [];
  },

  async getFeaturedEvents(limit = 10): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        venue:venues(*),
        organizer:organizers(*)
      `)
      .in('highlight_type', ['curatorial', 'vitrine'])
      .eq('status', 'published')
      .order('date_start', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getEventsByCity(city: string, limit = 20): Promise<Event[]> {
    return this.getEvents({ city, status: 'published' }, limit);
  },

  async getTodaysEvents(): Promise<Event[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents({
      dateStart: today,
      dateEnd: today,
      status: 'published'
    });
  }
};

// Artists API
export const artistsApi = {
  async getArtists(search?: string, city?: string, limit = 20): Promise<Artist[]> {
    let query = supabase
      .from('artists')
      .select('*')
      .eq('status', 'active')
      .order('stage_name')
      .limit(limit);

    if (search) {
      query = query.ilike('stage_name', `%${search}%`);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getArtistById(id: string): Promise<Artist | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getArtistBySlug(slug: string): Promise<Artist | null> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async searchArtists(query: string, limit = 20): Promise<Artist[]> {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('status', 'active')
      .or(`stage_name.ilike.%${query}%,city.ilike.%${query}%`)
      .order('stage_name')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// Venues API
export const venuesApi = {
  async getVenues(search?: string, city?: string, limit = 20): Promise<Venue[]> {
    let query = supabase
      .from('venues')
      .select('*')
      .eq('status', 'active')
      .order('name')
      .limit(limit);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getVenueById(id: string): Promise<Venue | null> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async searchVenues(query: string, limit = 20): Promise<Venue[]> {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
      .order('name')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// Organizers API
export const organizersApi = {
  async getOrganizers(search?: string, city?: string, limit = 20): Promise<Organizer[]> {
    let query = supabase
      .from('organizers')
      .select('*')
      .eq('status', 'active')
      .order('name')
      .limit(limit);

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getOrganizerById(id: string): Promise<Organizer | null> {
    const { data, error } = await supabase
      .from('organizers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async searchOrganizers(query: string, limit = 20): Promise<Organizer[]> {
    const { data, error } = await supabase
      .from('organizers')
      .select('*')
      .eq('status', 'active')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
      .order('name')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
};

// Export all APIs
export default {
  events: eventsApi,
  artists: artistsApi,
  venues: venuesApi,
  organizers: organizersApi
};