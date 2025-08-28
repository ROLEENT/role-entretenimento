import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminV2Auth } from '@/hooks/useAdminV2Auth';
import { toast } from 'sonner';
import type { ArtistFormData } from '@/lib/artistSchema';

export const useArtistManagement = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAdminV2Auth();

  // Função para gerar slug único
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const createArtist = useCallback(async (data: ArtistFormData) => {
    try {
      setLoading(true);
      console.log('[ARTIST MANAGEMENT] ====== INICIANDO CRIAÇÃO DE ARTISTA ======');
      console.log('[ARTIST MANAGEMENT] Data recebida:', data);
      
      if (!user?.email) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }
      
      // Gerar slug único
      const slug = generateSlug(data.stage_name);
      console.log('[ARTIST MANAGEMENT] Slug gerado:', slug);

      console.log('[ARTIST MANAGEMENT] Chamando RPC function admin_create_artist');

      // Usar RPC function para criar artista
      const { data: result, error } = await supabase.rpc('admin_create_artist', {
        p_admin_email: user.email,
        p_stage_name: data.stage_name,
        p_artist_type: data.artist_type,
        p_city: data.city,
        p_instagram: data.instagram,
        p_booking_email: data.booking_email,
        p_booking_whatsapp: data.booking_whatsapp,
        p_bio_short: data.bio_short,
        p_profile_image_url: data.profile_image_url,
        p_slug: slug,
        p_bio_long: data.bio_long || null,
        p_real_name: data.real_name || null,
        p_pronouns: data.pronouns || null,
        p_home_city: data.home_city || null,
        p_fee_range: data.fee_range || null,
        p_website_url: data.website_url || null,
        p_spotify_url: data.spotify_url || null,
        p_soundcloud_url: data.soundcloud_url || null,
        p_youtube_url: data.youtube_url || null,
        p_beatport_url: data.beatport_url || null,
        p_audius_url: data.audius_url || null,
        p_responsible_name: data.responsible_name || null,
        p_responsible_role: data.responsible_role || null,
        p_image_credits: data.image_credits || null,
        p_cover_image_url: data.cover_image_url || null,
        p_accommodation_notes: data.accommodation_notes || null,
        p_tech_rider_url: data.tech_rider_url || null,
        p_presskit_url: data.presskit_url || null,
        p_show_format: data.show_format || null,
        p_team_size: data.team_size || null,
        p_set_time_minutes: data.set_time_minutes || null,
        p_tech_stage: data.tech_stage || null,
        p_tech_audio: data.tech_audio || null,
        p_tech_light: data.tech_light || null,
        p_internal_notes: data.internal_notes || null,
        p_cities_active: data.cities_active || [],
        p_availability_days: data.availability_days || [],
        p_priority: data.priority || 0,
        p_status: 'active',
        p_image_rights_authorized: data.image_rights_authorized || false
      });

      if (error) {
        console.error('[ARTIST MANAGEMENT] RPC error:', error);
        throw error;
      }

      console.log('[ARTIST MANAGEMENT] Artista criado com sucesso:', result);
      toast.success('Artista criado com sucesso!');
      return result[0]?.id;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] ERRO GERAL:', error);
      
      let errorMessage = 'Erro ao criar artista';
      
      if (error.message?.includes('já existe')) {
        errorMessage = 'Já existe um artista com este nome';
      } else if (error.message?.includes('obrigatório')) {
        errorMessage = error.message;
      } else if (error.message?.includes('admin não encontrado')) {
        errorMessage = 'Permissões insuficientes para criar artista';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('[ARTIST MANAGEMENT] ====== FIM DA CRIAÇÃO DE ARTISTA ======');
    }
  }, [user?.email]);

  const updateArtist = useCallback(async (artistId: string, data: ArtistFormData) => {
    try {
      setLoading(true);
      console.log('[ARTIST MANAGEMENT] ====== ATUALIZANDO ARTISTA ======');
      
      if (!user?.email) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }
      
      // Gerar slug único
      const slug = generateSlug(data.stage_name);
      console.log('[ARTIST MANAGEMENT] Slug gerado:', slug);

      console.log('[ARTIST MANAGEMENT] Chamando RPC function admin_update_artist');

      // Usar RPC function para atualizar artista
      const { data: result, error } = await supabase.rpc('admin_update_artist', {
        p_admin_email: user.email,
        p_artist_id: artistId,
        p_stage_name: data.stage_name,
        p_artist_type: data.artist_type,
        p_city: data.city,
        p_instagram: data.instagram,
        p_booking_email: data.booking_email,
        p_booking_whatsapp: data.booking_whatsapp,
        p_bio_short: data.bio_short,
        p_profile_image_url: data.profile_image_url,
        p_slug: slug,
        p_bio_long: data.bio_long || null,
        p_real_name: data.real_name || null,
        p_pronouns: data.pronouns || null,
        p_home_city: data.home_city || null,
        p_fee_range: data.fee_range || null,
        p_website_url: data.website_url || null,
        p_spotify_url: data.spotify_url || null,
        p_soundcloud_url: data.soundcloud_url || null,
        p_youtube_url: data.youtube_url || null,
        p_beatport_url: data.beatport_url || null,
        p_audius_url: data.audius_url || null,
        p_responsible_name: data.responsible_name || null,
        p_responsible_role: data.responsible_role || null,
        p_image_credits: data.image_credits || null,
        p_cover_image_url: data.cover_image_url || null,
        p_accommodation_notes: data.accommodation_notes || null,
        p_tech_rider_url: data.tech_rider_url || null,
        p_presskit_url: data.presskit_url || null,
        p_show_format: data.show_format || null,
        p_team_size: data.team_size || null,
        p_set_time_minutes: data.set_time_minutes || null,
        p_tech_stage: data.tech_stage || null,
        p_tech_audio: data.tech_audio || null,
        p_tech_light: data.tech_light || null,
        p_internal_notes: data.internal_notes || null,
        p_cities_active: data.cities_active || [],
        p_availability_days: data.availability_days || [],
        p_priority: data.priority || 0,
        p_status: data.status || 'active',
        p_image_rights_authorized: data.image_rights_authorized || false
      });

      if (error) {
        console.error('[ARTIST MANAGEMENT] RPC error:', error);
        throw error;
      }

      console.log('[ARTIST MANAGEMENT] Artista atualizado com sucesso:', result);
      toast.success('Artista atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error updating artist:', error);
      
      let errorMessage = 'Erro ao atualizar artista';
      if (error.message?.includes('já existe')) {
        errorMessage = 'Já existe um artista com este nome';
      } else if (error.message?.includes('obrigatório')) {
        errorMessage = error.message;
      } else if (error.message?.includes('admin não encontrado')) {
        errorMessage = 'Permissões insuficientes para atualizar artista';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const getArtists = useCallback(async (filters: any = {}) => {
    try {
      // Para buscar artistas, usar query normal (não precisa de RPC)
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
      console.error('[ARTIST MANAGEMENT] Error fetching artists:', error);
      toast.error(error.message || 'Erro ao carregar artistas');
      return [];
    }
  }, []);

  const getArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      if (artistId === 'new') return null;
      
      if (!user?.email) {
        // Se não tiver email do admin, tentar busca normal
        const { data: artist, error } = await supabase
          .from('artists')
          .select('*')
          .eq('id', artistId)
          .maybeSingle();
        
        if (error) throw error;
        return artist;
      }

      console.log('[ARTIST MANAGEMENT] Chamando RPC function admin_get_artist_by_id');

      // Usar RPC function para buscar artista
      const { data, error } = await supabase.rpc('admin_get_artist_by_id', {
        p_admin_email: user.email,
        p_artist_id: artistId
      });

      if (error) {
        console.error('[ARTIST MANAGEMENT] RPC error:', error);
        throw error;
      }

      console.log('[ARTIST MANAGEMENT] Artista recuperado:', data);
      return data?.[0] || null;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error fetching artist:', error);
      toast.error(error.message || 'Erro ao carregar artista');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const deleteArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      if (!user?.email) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }

      console.log('[ARTIST MANAGEMENT] Chamando RPC function admin_delete_artist');

      // Usar RPC function para deletar artista
      const { data, error } = await supabase.rpc('admin_delete_artist', {
        p_admin_email: user.email,
        p_artist_id: artistId
      });

      if (error) {
        console.error('[ARTIST MANAGEMENT] RPC error:', error);
        throw error;
      }

      console.log('[ARTIST MANAGEMENT] Artista deletado com sucesso');
      toast.success('Artista removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error deleting artist:', error);
      
      let errorMessage = 'Erro ao remover artista';
      if (error.message?.includes('admin não encontrado')) {
        errorMessage = 'Permissões insuficientes para deletar artista';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

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