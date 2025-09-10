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

      // Extract organizers from partners
      const partners = (eventData as any).partners || [];
      const organizers = partners.filter((p: any) => p.role === 'organizer');
      
      console.log('🔍 Debug organizers:', {
        partners: partners.length,
        organizers: organizers.length,
        organizerData: organizers.map(o => ({ 
          partner_id: o.partner_id, 
          role: o.role, 
          is_main: o.is_main 
        }))
      });
      
      // Ensure we have at least one organizer if publishing
      const isPublished = (eventData as any).is_published || false;
      if (isPublished && organizers.length === 0) {
        throw new Error('Eventos publicados devem ter pelo menos um organizador definido');
      }

      // Extract main organizer
      const mainOrganizer = organizers.find((o: any) => o.is_main) || organizers[0];
      const organizerIds = organizers.map((o: any) => o.partner_id).filter(Boolean);

      // For agenda_itens, use direct insert with organizer data
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
          is_published: isPublished,
          organizer_id: mainOrganizer?.id || null,
          organizer_ids: organizerIds,
          created_by: session?.user?.id,
          // Novos campos de promoção
          promo_type: (eventData as any).promo_type || 'none',
          vitrine_package: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_package : null,
          vitrine_order_id: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_order_id : null,
          vitrine_notes: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_notes : null,
          featured_reasons: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_reasons : [],
          featured_note: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_note : null,
          featured_until: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_until : null,
          featured_weight: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_weight : 0,
          event_genres: (eventData as any).event_genres || []
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar evento: ${error.message}`);
      }

      // Create organizer relationships in agenda_item_organizers
      if (organizers.length > 0) {
        const organizerRelations = organizers.map((org: any, index: number) => ({
          agenda_id: data.id,
          organizer_id: org.id,
          role: org.role || 'organizer',
          main_organizer: org.is_main || false,
          position: index
        })).filter((rel: any) => rel.organizer_id);

        if (organizerRelations.length > 0) {
          const { error: orgError } = await supabase
            .from('agenda_item_organizers')
            .insert(organizerRelations);

          if (orgError) {
            console.error('Error creating organizer relations:', orgError);
            // Don't throw here, just log the error
          }
        }
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

      // Extract organizers from partners
      const partners = (eventData as any).partners || [];
      const organizers = partners.filter((p: any) => p.role === 'organizer');
      
      console.log('🔍 Debug organizers (update):', {
        partners: partners.length,
        organizers: organizers.length,
        organizerData: organizers.map(o => ({ 
          partner_id: o.partner_id, 
          role: o.role, 
          is_main: o.is_main 
        }))
      });
      
      // Ensure we have at least one organizer if publishing
      const isPublished = (eventData as any).is_published || false;
      if (isPublished && organizers.length === 0) {
        throw new Error('Eventos publicados devem ter pelo menos um organizador definido');
      }

      // Extract main organizer
      const mainOrganizer = organizers.find((o: any) => o.is_main) || organizers[0];
      const organizerIds = organizers.map((o: any) => o.id).filter(Boolean);

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
          is_published: isPublished,
          organizer_id: mainOrganizer?.partner_id || null,
          organizer_ids: organizerIds,
          updated_by: session?.user?.id,
          updated_at: new Date().toISOString(),
          // Novos campos de promoção
          promo_type: (eventData as any).promo_type || 'none',
          vitrine_package: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_package : null,
          vitrine_order_id: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_order_id : null,
          vitrine_notes: (eventData as any).promo_type?.includes('vitrine') ? (eventData as any).vitrine_notes : null,
          featured_reasons: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_reasons : [],
          featured_note: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_note : null,
          featured_until: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_until : null,
          featured_weight: (eventData as any).promo_type?.includes('destaque') ? (eventData as any).featured_weight : 0,
          event_genres: (eventData as any).event_genres || []
        })
        .eq('id', eventId);

      if (eventError) {
        throw new Error(`Erro ao atualizar evento: ${eventError.message}`);
      }

      // Update organizer relationships
      // First, delete existing organizer relations
      await supabase
        .from('agenda_item_organizers')
        .delete()
        .eq('agenda_id', eventId);

      // Create new organizer relationships
      if (organizers.length > 0) {
        const organizerRelations = organizers.map((org: any, index: number) => ({
          agenda_id: eventId,
          organizer_id: org.partner_id,
          role: org.role || 'organizer',
          main_organizer: org.is_main || false,
          position: index
        })).filter((rel: any) => rel.organizer_id);

        if (organizerRelations.length > 0) {
          const { error: orgError } = await supabase
            .from('agenda_item_organizers')
            .insert(organizerRelations);

          if (orgError) {
            console.error('Error updating organizer relations:', orgError);
            // Don't throw here, just log the error
          }
        }
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