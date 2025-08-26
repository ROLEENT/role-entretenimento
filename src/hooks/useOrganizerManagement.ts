import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OrganizerFormData {
  name: string;
  contact_email: string;
  site: string;
  instagram: string;
  description: string;
  logo_url?: string;
  phone?: string;
  whatsapp?: string;
  founded_year?: number;
  specialties?: string[];
}

export const useOrganizerManagement = () => {
  const [loading, setLoading] = useState(false);

  const createOrganizer = useCallback(async (data: OrganizerFormData) => {
    try {
      setLoading(true);
      
      const { data: organizer, error } = await supabase
        .from('organizers')
        .insert({
          name: data.name,
          contact_email: data.contact_email,
          site: data.site || null,
          instagram: data.instagram || null,
          description: data.description || null,
          logo_url: data.logo_url || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          founded_year: data.founded_year || null,
          specialties: data.specialties || []
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Organizador criado com sucesso!');
      return organizer;
    } catch (error: any) {
      console.error('Error creating organizer:', error);
      toast.error(error.message || 'Erro ao criar organizador');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrganizer = useCallback(async (organizerId: string, data: OrganizerFormData) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('organizers')
        .update({
          name: data.name,
          contact_email: data.contact_email,
          site: data.site || null,
          instagram: data.instagram || null,
          description: data.description || null,
          logo_url: data.logo_url || null,
          phone: data.phone || null,
          whatsapp: data.whatsapp || null,
          founded_year: data.founded_year || null,
          specialties: data.specialties || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', organizerId);

      if (error) throw error;
      
      toast.success('Organizador atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating organizer:', error);
      toast.error(error.message || 'Erro ao atualizar organizador');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrganizers = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('organizers')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,contact_email.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching organizers:', error);
      toast.error(error.message || 'Erro ao carregar organizadores');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrganizer = useCallback(async (organizerId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('organizers')
        .delete()
        .eq('id', organizerId);

      if (error) throw error;
      
      toast.success('Organizador removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting organizer:', error);
      toast.error(error.message || 'Erro ao remover organizador');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createOrganizer,
    updateOrganizer,
    getOrganizers,
    deleteOrganizer
  };
};