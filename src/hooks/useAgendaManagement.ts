import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AgendaItemInput, AgendaItemCreate, AgendaItemUpdate } from '@/schemas/agenda';

export const useAgendaManagement = () => {
  const [loading, setLoading] = useState(false);

  const getAgendaItem = async (id: string): Promise<AgendaItemInput | null> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform data to match schema
      return {
        ...data,
        start_at_utc: data.start_at ? new Date(data.start_at) : null,
        end_at_utc: data.end_at ? new Date(data.end_at) : null,
        publish_at: data.publish_at ? new Date(data.publish_at) : undefined,
        unpublish_at: data.unpublish_at ? new Date(data.unpublish_at) : undefined,
        created_at: data.created_at ? new Date(data.created_at) : undefined,
        updated_at: data.updated_at ? new Date(data.updated_at) : undefined,
        deleted_at: data.deleted_at ? new Date(data.deleted_at) : undefined,
        cover_image: data.cover_url && data.alt_text ? {
          url: data.cover_url,
          alt: data.alt_text
        } : undefined,
      } as AgendaItemInput;

    } catch (error: any) {
      console.error('Error fetching agenda item:', error);
      toast.error('Erro ao carregar agenda');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAgendaItem = async (data: AgendaItemCreate): Promise<string | null> => {
    try {
      setLoading(true);

      // Transform data for database
      const dbData = {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        listing_type: data.listing_type,
        visibility_type: data.visibility_type,
        city: data.city,
        type: data.type,
        start_at: data.start_at_utc?.toISOString(),
        end_at: data.end_at_utc?.toISOString(),
        summary: data.summary,
        cover_url: typeof data.cover_image === 'object' ? data.cover_image?.url : data.cover_url,
        alt_text: typeof data.cover_image === 'object' ? data.cover_image?.alt : data.cover_alt,
        artists_names: data.artists_names,
        ticket_url: data.ticket_url,
        source_url: data.source_url,
        location_name: data.location_name,
        address: data.address,
        neighborhood: data.neighborhood,
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        status: data.is_published ? 'published' : 'draft',
        priority: data.priority,
        tags: data.tags,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_image_url: data.meta_image_url,
        canonical_url: data.canonical_url,
        noindex: data.noindex,
        venue_id: data.venue_id,
        organizer_id: data.organizer_id,
        // event_id: removed field
        publish_at: data.publish_at?.toISOString(),
        unpublish_at: data.unpublish_at?.toISOString(),
        patrocinado: data.patrocinado,
        age_rating: data.age_rating,
        ticket_status: data.ticket_status,
        cupom: data.cupom,
        anunciante: data.anunciante,
        editorial_notes: data.editorial_notes,
        share_text: data.share_text,
        accessibility: data.accessibility,
      };

      const { data: result, error } = await supabase
        .from('agenda_itens')
        .insert(dbData)
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Agenda criada com sucesso!');
      return result.id;

    } catch (error: any) {
      console.error('Error creating agenda item:', error);
      toast.error('Erro ao criar agenda');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAgendaItem = async (id: string, data: AgendaItemUpdate): Promise<boolean> => {
    try {
      setLoading(true);

      // Transform data for database
      const dbData = {
        title: data.title,
        slug: data.slug,
        subtitle: data.subtitle,
        listing_type: data.listing_type,
        visibility_type: data.visibility_type,
        city: data.city,
        type: data.type,
        start_at: data.start_at_utc?.toISOString(),
        end_at: data.end_at_utc?.toISOString(),
        summary: data.summary,
        cover_url: typeof data.cover_image === 'object' ? data.cover_image?.url : data.cover_url,
        alt_text: typeof data.cover_image === 'object' ? data.cover_image?.alt : data.cover_alt,
        artists_names: data.artists_names,
        ticket_url: data.ticket_url,
        source_url: data.source_url,
        location_name: data.location_name,
        address: data.address,
        neighborhood: data.neighborhood,
        price_min: data.price_min,
        price_max: data.price_max,
        currency: data.currency,
        status: data.is_published ? 'published' : 'draft',
        priority: data.priority,
        tags: data.tags,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_image_url: data.meta_image_url,
        canonical_url: data.canonical_url,
        noindex: data.noindex,
        venue_id: data.venue_id,
        organizer_id: data.organizer_id,
        // event_id: removed field
        publish_at: data.publish_at?.toISOString(),
        unpublish_at: data.unpublish_at?.toISOString(),
        patrocinado: data.patrocinado,
        age_rating: data.age_rating,
        ticket_status: data.ticket_status,
        cupom: data.cupom,
        anunciante: data.anunciante,
        editorial_notes: data.editorial_notes,
        share_text: data.share_text,
        accessibility: data.accessibility,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('agenda_itens')
        .update(dbData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Agenda atualizada com sucesso!');
      return true;

    } catch (error: any) {
      console.error('Error updating agenda item:', error);
      toast.error('Erro ao atualizar agenda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAgendaItem = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('agenda_itens')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Agenda excluída com sucesso!');
      return true;

    } catch (error: any) {
      console.error('Error deleting agenda item:', error);
      toast.error('Erro ao excluir agenda');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const duplicateAgendaItem = async (id: string): Promise<string | null> => {
    try {
      const originalItem = await getAgendaItem(id);
      if (!originalItem) return null;

      const duplicateData: AgendaItemCreate = {
        ...originalItem,
        title: `${originalItem.title} (Cópia)`,
        slug: `${originalItem.slug}-copy`,
        is_published: false,
        status: 'draft',
      };

      return await createAgendaItem(duplicateData);

    } catch (error: any) {
      console.error('Error duplicating agenda item:', error);
      toast.error('Erro ao duplicar agenda');
      return null;
    }
  };

  return {
    loading,
    getAgendaItem,
    createAgendaItem,
    updateAgendaItem,
    deleteAgendaItem,
    duplicateAgendaItem,
  };
};