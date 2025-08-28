import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EventFormData {
  title: string;
  description: string;
  start_at: string;
  city: string;
  state: string;
  venue_name: string;
  slug?: string;
  end_at?: string;
  venue_address?: string;
  organizer_name?: string;
  cover_url?: string;
  tags?: string[];
  status?: string;
  price_min?: number;
  price_max?: number;
  external_url?: string;
  category?: string;
  artists?: string[];
  instagram_post_url?: string;
  social_links?: string;
  benefits?: string;
  age_range?: string;
  observations?: string;
}

export const useEventManagement = () => {
  const [loading, setLoading] = useState(false);

  const createEvent = useCallback(async (data: EventFormData) => {
    try {
      setLoading(true);
      
      const eventData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: data.description || null,
        city: data.city,
        state: data.state,
        date_start: data.start_at,
        date_end: data.end_at || null,
        start_at: data.start_at,
        end_at: data.end_at || null,
        venue_name: data.venue_name,
        venue_address: data.venue_address || null,
        organizer_name: data.organizer_name || null,
        cover_url: data.cover_url || null,
        image_url: data.cover_url || null,
        external_url: data.external_url || null,
        price_min: data.price_min || null,
        price_max: data.price_max || null,
        tags: data.tags || [],
        status: data.status || 'active',
        source: 'internal'
      };

      const { data: createdEvent, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Evento criado com sucesso!');
      return createdEvent.id;
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast.error(error.message || 'Erro ao criar evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEvent = useCallback(async (eventId: string, data: EventFormData) => {
    try {
      setLoading(true);
      
      const eventData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: data.description || null,
        city: data.city,
        state: data.state,
        date_start: data.start_at,
        date_end: data.end_at || null,
        start_at: data.start_at,
        end_at: data.end_at || null,
        venue_name: data.venue_name,
        venue_address: data.venue_address || null,
        organizer_name: data.organizer_name || null,
        cover_url: data.cover_url || null,
        image_url: data.cover_url || null,
        external_url: data.external_url || null,
        price_min: data.price_min || null,
        price_max: data.price_max || null,
        tags: data.tags || [],
        status: data.status || 'active',
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Evento atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast.error(error.message || 'Erro ao atualizar evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getEvents = useCallback(async (filters: any = {}) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (id, name, address),
          organizers:organizer_id (id, name)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== '') {
        query = query.eq('status', filters.status);
      }

      if (filters.city && filters.city !== '') {
        query = query.eq('city', filters.city);
      }

      if (filters.search && filters.search.trim() !== '') {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,city.ilike.%${filters.search}%`);
      }

      // Apply pagination if provided
      if (filters.limit) {
        const offset = ((filters.page || 1) - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast.error(error.message || 'Erro ao carregar eventos');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          venues:venue_id (id, name, address),
          organizers:organizer_id (id, name),
          event_categories(category_id)
        `)
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error(error.message || 'Erro ao carregar evento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      
      toast.success('Evento removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast.error(error.message || 'Erro ao remover evento');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getVenues = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address')
        .order('name');

      if (error) {
        console.warn('Venues table not available:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.warn('Error fetching venues:', error);
      return [];
    }
  }, []);

  const getOrganizers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name')
        .order('name');

      if (error) {
        console.warn('Organizers table not available:', error);
        return [];
      }
      return data || [];
    } catch (error: any) {
      console.warn('Error fetching organizers:', error);
      return [];
    }
  }, []);

  return {
    loading,
    createEvent,
    updateEvent,
    getEvents,
    getEvent,
    deleteEvent,
    getVenues,
    getOrganizers
  };
};