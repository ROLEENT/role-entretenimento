import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createAdminSupabaseClient, getAdminEmail } from '@/lib/supabaseAdmin';
import { toast } from 'sonner';
import type { ArtistFormData } from '@/lib/artistSchema';

export const useArtistManagement = () => {
  const [loading, setLoading] = useState(false);

  const createArtist = useCallback(async (data: ArtistFormData) => {
    try {
      setLoading(true);
      console.log('[ARTIST MANAGEMENT] ====== INICIANDO CRIAÇÃO DE ARTISTA ======');
      console.log('[ARTIST MANAGEMENT] Data recebida:', data);
      
      // Obter email do admin
      const adminEmail = await getAdminEmail();
      console.log('[ARTIST MANAGEMENT] Admin email obtido:', adminEmail);
      
      if (!adminEmail) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }
      
      // Criar cliente admin com headers corretos
      const adminClient = createAdminSupabaseClient(adminEmail);
      console.log('[ARTIST MANAGEMENT] Cliente admin criado');
      
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
      
      console.log('[ARTIST MANAGEMENT] Base slug:', baseSlug);
      
      // Verificar se slug já existe e criar versão única
      while (true) {
        console.log('[ARTIST MANAGEMENT] Verificando slug:', slug);
        
        const { data: existingArtist, error: slugError } = await adminClient
          .from('artists')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        
        if (slugError) {
          console.error('[ARTIST MANAGEMENT] Erro ao verificar slug:', slugError);
          throw slugError;
        }
        
        console.log('[ARTIST MANAGEMENT] Artista existente com slug:', existingArtist);
        
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

      console.log('[ARTIST MANAGEMENT] Dados finais para inserção:', artistData);

      const { data: newArtist, error } = await adminClient
        .from('artists')
        .insert([artistData])
        .select()
        .single();

      if (error) {
        console.error('[ARTIST MANAGEMENT] Erro na inserção:', error);
        throw error;
      }

      console.log('[ARTIST MANAGEMENT] Artista criado com sucesso:', newArtist);
      toast.success('Artista criado com sucesso!');
      return newArtist.id;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] ERRO GERAL:', error);
      
      let errorMessage = 'Erro ao criar artista';
      
      if (error.code === '42501') {
        errorMessage = 'Permissões insuficientes. Verifique se você está logado como administrador.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
      console.log('[ARTIST MANAGEMENT] ====== FIM DA CRIAÇÃO DE ARTISTA ======');
    }
  }, []);

  const updateArtist = useCallback(async (artistId: string, data: ArtistFormData) => {
    try {
      setLoading(true);
      console.log('[ARTIST MANAGEMENT] ====== ATUALIZANDO ARTISTA ======');
      
      // Obter email do admin
      const adminEmail = await getAdminEmail();
      if (!adminEmail) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }
      
      // Criar cliente admin com headers corretos
      const adminClient = createAdminSupabaseClient(adminEmail);
      
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
        const { data: existingArtist, error: slugError } = await adminClient
          .from('artists')
          .select('id')
          .eq('slug', slug)
          .neq('id', artistId)
          .maybeSingle();
        
        if (slugError) throw slugError;
        
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

      const { error } = await adminClient
        .from('artists')
        .update(artistData)
        .eq('id', artistId);

      if (error) throw error;
      
      toast.success('Artista atualizado com sucesso!');
      return true;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error updating artist:', error);
      
      let errorMessage = 'Erro ao atualizar artista';
      if (error.code === '42501') {
        errorMessage = 'Permissões insuficientes. Verifique se você está logado como administrador.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getArtists = useCallback(async (filters: any = {}) => {
    try {
      // Obter email do admin para operações administrativas
      const adminEmail = await getAdminEmail();
      const client = adminEmail ? createAdminSupabaseClient(adminEmail) : supabase;
      
      let query = client.from('artists').select('*');
      
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
      
      // Obter email do admin para operações administrativas
      const adminEmail = await getAdminEmail();
      const client = adminEmail ? createAdminSupabaseClient(adminEmail) : supabase;
      
      const { data: artist, error } = await client
        .from('artists')
        .select('*')
        .eq('id', artistId)
        .maybeSingle();
      
      if (error) {
        console.error('[ARTIST MANAGEMENT] Error fetching artist:', error);
        throw error;
      }
      
      if (!artist) {
        toast.error('Artista não encontrado');
        return null;
      }
      
      return artist;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error fetching artist:', error);
      toast.error(error.message || 'Erro ao carregar artista');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteArtist = useCallback(async (artistId: string) => {
    try {
      setLoading(true);
      
      // Obter email do admin
      const adminEmail = await getAdminEmail();
      if (!adminEmail) {
        throw new Error('Email do administrador não encontrado. Faça login novamente.');
      }
      
      const adminClient = createAdminSupabaseClient(adminEmail);
      
      const { error } = await adminClient
        .from('artists')
        .delete()
        .eq('id', artistId);
        
      if (error) throw error;
      
      toast.success('Artista removido com sucesso!');
      return true;
    } catch (error: any) {
      console.error('[ARTIST MANAGEMENT] Error deleting artist:', error);
      
      let errorMessage = 'Erro ao remover artista';
      if (error.code === '42501') {
        errorMessage = 'Permissões insuficientes. Verifique se você está logado como administrador.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
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