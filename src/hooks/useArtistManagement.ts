import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ArtistFormData } from '@/lib/artistSchema';

export const useArtistManagement = () => {
  const [loading, setLoading] = useState(false);

  const createArtist = useCallback(async (data: ArtistFormData) => {
    try {
      setLoading(true);
      
      // Gerar slug único
      const baseSlug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      let slug = baseSlug;
      let counter = 1;
      
      // Verificar se slug já existe e criar versão única
      while (true) {
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id')
          .eq('slug', slug)
          .single();
        
        if (!existingArtist) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const artistData = {
        ...data,
        slug,
        cities_active: data.cities_active || [],
        availability_days: data.availability_days || [],
        image_rights_authorized: data.image_rights_authorized || false,
        status: data.status || 'active',
        priority: data.priority || 0
      };

      const { data: newArtist, error } = await supabase
        .from('artists')
        .insert([artistData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Artista criado com sucesso!');
      return newArtist.id;
    } catch (error: any) {
      console.error('Error creating artist:', error);
      toast.error(error.message || 'Erro ao criar artista');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateArtist = useCallback(async (artistId: string, data: ArtistFormData) => {
    try {
      setLoading(true);
      
      // Gerar novo slug se o nome foi alterado
      const baseSlug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      let slug = baseSlug;
      let counter = 1;
      
      // Verificar se slug já existe (exceto para o artista atual)
      while (true) {
        const { data: existingArtist } = await supabase
          .from('artists')
          .select('id')
          .eq('slug', slug)
          .neq('id', artistId)
          .single();
        
        if (!existingArtist) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const artistData = {
        ...data,
        slug,
        cities_active: data.cities_active || [],
        availability_days: data.availability_days || [],
        image_rights_authorized: data.image_rights_authorized || false
      };

      const { error } = await supabase
        .from('artists')
        .update(artistData)
        .eq('id', artistId);

      if (error) throw error;
      
      toast.success('Artista atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error updating artist:', error);
      toast.error(error.message || 'Erro ao atualizar artista');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getArtists = useCallback(async (filters: any = {}) => {
    try {
      
      let query = supabase.from('artists').select('*');
      
      // Aplicar filtros
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      
      if (filters.artist_type && filters.artist_type !== 'all') {
        query = query.eq('artist_type', filters.artist_type);
      }
      
      if (filters.search) {
        query = query.or(`stage_name.ilike.%${filters.search}%,instagram.ilike.%${filters.search}%`);
      }
      
      // Ordenar por data de criação (mais recente primeiro)
      query = query.order('created_at', { ascending: false });
      
      const { data: artists, error } = await query;
      
      if (error) throw error;
      
      return artists || [];
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      toast.error(error.message || 'Erro ao carregar artistas');
      return [];
    }
  }, []);

  const getArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      if (artistId === 'new') return null;
      
      const { data: artist, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Artista não encontrado');
        } else {
          throw error;
        }
        return null;
      }
      
      return artist;
    } catch (error: any) {
      console.error('Error fetching artist:', error);
      toast.error(error.message || 'Erro ao carregar artista');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('artists')
        .delete()
        .eq('id', artistId);
        
      if (error) throw error;
      
      toast.success('Artista removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('Error deleting artist:', error);
      toast.error(error.message || 'Erro ao remover artista');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const searchArtists = useCallback(async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) return [];
      
      const { data: artists, error } = await supabase
        .from('artists')
        .select('id, stage_name, artist_type')
        .or(`stage_name.ilike.%${searchTerm}%,instagram.ilike.%${searchTerm}%`)
        .eq('status', 'active')
        .limit(10);
        
      if (error) throw error;
      
      return artists || [];
    } catch (error: any) {
      console.error('Error searching artists:', error);
      return [];
    }
  }, []);

  return {
    loading,
    createArtist,
    updateArtist,
    getArtists,
    getArtist,
    deleteArtist,
    searchArtists
  };
};