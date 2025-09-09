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

      // For agenda_itens, use direct insert with is_published flag
      const { data, error } = await supabase
        .from('agenda_itens')
        .insert({
          title: eventData.title,
          subtitle: eventData.subtitle,
          slug: eventData.slug,
          summary: eventData.summary,
          city: eventData.city,
          starts_at: eventData.date_start,
          end_at: eventData.date_end,
          cover_url: eventData.cover_url || eventData.image_url,
          alt_text: eventData.cover_alt,
          venue_id: eventData.venue_id,
          location_name: eventData.location_name,
          address: eventData.address,
          status: 'published',
          is_published: (eventData as any).is_published || false,
          created_by: session?.user?.id
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar evento: ${error.message}`);
      }

      return data.id;
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

      // Update agenda_itens
      const { error: eventError } = await supabase
        .from('agenda_itens')
        .update({
          title: eventData.title,
          subtitle: eventData.subtitle,
          slug: eventData.slug,
          summary: eventData.summary,
          city: eventData.city,
          starts_at: eventData.date_start,
          end_at: eventData.date_end,
          cover_url: eventData.cover_url || eventData.image_url,
          alt_text: eventData.cover_alt,
          venue_id: eventData.venue_id,
          location_name: eventData.location_name,
          address: eventData.address,
          is_published: (eventData as any).is_published || false,
          updated_by: session?.user?.id,
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
      const { error } = await supabase.rpc('soft_delete_event', {
        p_event_id: eventId
      });

      if (error) {
        throw new Error(`Erro ao excluir evento: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteEvent:', error);
      throw error;
    }
  },

  async restoreEvent(eventId: string) {
    try {
      const { error } = await supabase.rpc('restore_event', {
        p_event_id: eventId
      });

      if (error) {
        throw new Error(`Erro ao restaurar evento: ${error.message}`);
      }

      return { success: true };
    } catch (error) {
      console.error('Error in restoreEvent:', error);
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