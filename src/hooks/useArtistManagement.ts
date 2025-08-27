import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ArtistFormData {
  stage_name: string;
  artist_type: 'banda' | 'dj' | 'solo' | 'drag';
  city: string;
  instagram: string;
  booking_email: string;
  booking_whatsapp: string;
  bio_short: string;
  profile_image_url: string;
  bio_long?: string;
  cover_image_url?: string;
  real_name?: string;
  pronouns?: string;
  website_url?: string;
  spotify_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  beatport_url?: string;
  audius_url?: string;
  presskit_url?: string;
  show_format?: string;
  tech_audio?: string;
  tech_light?: string;
  tech_stage?: string;
  tech_rider_url?: string;
  set_time_minutes?: number;
  team_size?: number;
  fee_range?: string;
  home_city?: string;
  cities_active?: string[];
  availability_days?: string[];
  accommodation_notes?: string;
  image_rights_authorized?: boolean;
  image_credits?: string;
  responsible_name?: string;
  responsible_role?: string;
  internal_notes?: string;
  status?: 'active' | 'inactive';
  priority?: number;
}

export const useArtistManagement = () => {
  const [loading, setLoading] = useState(false);

  const createArtist = useCallback(async (data: ArtistFormData) => {
    try {
      setLoading(true);
      
      // Gerar slug
      const slug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const artistData = {
        ...data,
        slug,
        cities_active: data.cities_active || [],
        availability_days: data.availability_days || [],
        image_rights_authorized: data.image_rights_authorized || false,
        status: data.status || 'active',
        priority: data.priority || 0
      };

      // Por enquanto, simular criação
      // TODO: Implementar quando tabela artists for criada no Supabase
      console.log('Creating artist:', artistData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Artista criado com sucesso!');
      return `mock-id-${Date.now()}`;
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
      
      const slug = data.stage_name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();

      const artistData = {
        ...data,
        slug,
        cities_active: data.cities_active || [],
        availability_days: data.availability_days || [],
        image_rights_authorized: data.image_rights_authorized || false,
        updated_at: new Date().toISOString()
      };

      // Por enquanto, simular atualização
      console.log('Updating artist:', artistId, artistData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      setLoading(true);
      
      // Por enquanto, retornar dados mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockArtists = [
        {
          id: '1',
          stage_name: 'DJ Example',
          artist_type: 'dj',
          city: 'São Paulo',
          instagram: '@djexample',
          status: 'active',
          profile_image_url: '/placeholder.svg',
          created_at: '2024-01-15T10:00:00Z'
        }
      ];
      
      return mockArtists;
    } catch (error: any) {
      console.error('Error fetching artists:', error);
      toast.error(error.message || 'Erro ao carregar artistas');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      // Por enquanto, retornar dados mock
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (artistId === 'new') return null;
      
      const mockArtist = {
        id: artistId,
        stage_name: 'DJ Example',
        artist_type: 'dj',
        city: 'São Paulo',
        instagram: '@djexample',
        booking_email: 'booking@djexample.com',
        booking_whatsapp: '+5511999999999',
        bio_short: 'DJ especializado em house music',
        profile_image_url: '/placeholder.svg',
        status: 'active'
      };
      
      return mockArtist;
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
      
      // Por enquanto, simular exclusão
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      // Por enquanto, busca mock para autocomplete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResults = [
        { id: '1', stage_name: 'DJ Example', artist_type: 'dj' },
        { id: '2', stage_name: 'Banda Rock', artist_type: 'banda' }
      ].filter(artist => 
        artist.stage_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return mockResults;
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