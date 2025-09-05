import { supabase } from '@/integrations/supabase/client';
import { EventFormData } from '@/schemas/eventSchema';

export const eventsApi = {
  async createEvent(eventData: EventFormData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email;
      
      if (!adminEmail) {
        throw new Error('Admin não autenticado');
      }

      const { data, error } = await supabase.rpc('create_event_cascade', {
        event_data: eventData,
        partners: eventData.partners || [],
        lineup_slots: eventData.lineup_slots || [],
        performances: eventData.performances || [],
        visual_artists: eventData.visual_artists || []
      });

      if (error) {
        throw new Error(`Erro ao criar evento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in createEvent:', error);
      throw error;
    }
  },

  async updateEvent(eventId: string, eventData: EventFormData) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email;
      
      if (!adminEmail) {
        throw new Error('Admin não autenticado');
      }

      // Update main event
      const { error: eventError } = await supabase
        .from('events')
        .update({
          title: eventData.title,
          subtitle: eventData.subtitle,
          summary: eventData.summary,
          description: eventData.description,
          venue_id: eventData.venue_id,
          location_name: eventData.location_name,
          address: eventData.address,
          city: eventData.city,
          state: eventData.state,
          country: eventData.country,
          date_start: eventData.date_start,
          date_end: eventData.date_end,
          doors_open_utc: eventData.doors_open_utc,
          headliner_starts_utc: eventData.headliner_starts_utc,
          image_url: eventData.image_url,
          cover_url: eventData.cover_url,
          cover_alt: eventData.cover_alt,
          gallery: eventData.gallery,
          price_min: eventData.price_min,
          price_max: eventData.price_max,
          currency: eventData.currency,
          ticket_url: eventData.ticket_url,
          ticketing: eventData.ticketing,
          ticket_rules: eventData.ticket_rules,
          age_rating: eventData.age_rating,
          age_notes: eventData.age_notes,
          genres: eventData.genres,
          tags: eventData.tags,
          highlight_type: eventData.highlight_type,
          is_sponsored: eventData.is_sponsored,
          links: eventData.links,
          accessibility: eventData.accessibility,
          seo_title: eventData.seo_title,
          seo_description: eventData.seo_description,
          og_image_url: eventData.og_image_url,
          series_id: eventData.series_id,
          edition_number: eventData.edition_number,
          status: eventData.status,
          visibility: eventData.visibility,
          slug: eventData.slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (eventError) {
        throw new Error(`Erro ao atualizar evento: ${eventError.message}`);
      }

      return eventId;
    } catch (error) {
      console.error('Error in updateEvent:', error);
      throw error;
    }
  },

  async deleteEvent(eventId: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = session?.user?.email;
      
      if (!adminEmail) {
        throw new Error('Admin não autenticado');
      }

      const { data, error } = await supabase.rpc('admin_delete_event', {
        p_admin_email: adminEmail,
        p_event_id: eventId
      });

      if (error) {
        throw new Error(`Erro ao excluir evento: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Erro desconhecido ao excluir evento');
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  },

  async getEvent(eventId: string) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venue:venues(id, name, address, city),
          organizer:organizers(id, name),
          event_partners(*),
          event_lineup_slots(*),
          event_performances(*),
          event_visual_artists(*)
        `)
        .eq('id', eventId)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar evento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getEvent:', error);
      throw error;
    }
  },

  async getEvents(filters: any = {}) {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          venue:venues(id, name, address, city),
          organizer:organizers(id, name)
        `)
        .order('date_start', { ascending: true });

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.city) {
        query = query.eq('city', filters.city);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar eventos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
  }
};