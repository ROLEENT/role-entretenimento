import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentFormData } from '@/lib/agentSchema';

const DRAFT_STORAGE_KEY = 'agent-form-draft';

export const useAgentManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSlugExists = async (slug: string): Promise<boolean> => {
    try {
      // Verificar em todas as tabelas de agentes
      const [artistResult, venueResult, organizerResult] = await Promise.all([
        supabase.from('artists').select('id').eq('slug', slug).maybeSingle(),
        supabase.from('venues').select('id').eq('slug', slug).maybeSingle(),
        supabase.from('organizers').select('id').eq('slug', slug).maybeSingle(),
      ]);

      return !!(artistResult.data || venueResult.data || organizerResult.data);
    } catch (error) {
      console.error('Erro ao verificar slug:', error);
      return false;
    }
  };

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const createAgent = async (data: AgentFormData): Promise<string | null> => {
    setLoading(true);
    try {
      // Verificar se slug já existe
      const slugExists = await checkSlugExists(data.slug);
      if (slugExists) {
        toast({
          title: "Erro",
          description: "Este slug já está em uso. Escolha outro.",
          variant: "destructive"
        });
        return null;
      }

      let result;
      
      // Inserir na tabela apropriada baseado no tipo
      switch (data.agent_type) {
        case 'artist':
          result = await supabase
            .from('artists')
            .insert({
              stage_name: data.name,
              slug: data.slug,
              city: data.city,
              instagram: data.instagram.replace(/^@+/, ''), // Normalizar instagram
              booking_whatsapp: data.whatsapp,
              booking_email: data.email,
              website_url: data.website || null,
              bio_short: data.bio_short,
              status: data.status,
              artist_type: data.artist_subtype || 'banda',
              spotify_url: data.spotify_url || null,
              soundcloud_url: data.soundcloud_url || null,
              youtube_url: data.youtube_url || null,
              beatport_url: data.beatport_url || null,
              profile_image_url: data.profile_image_url || '',
              presskit_url: data.presskit_url || null,
            })
            .select('id')
            .single();
          break;

        case 'venue':
          result = await supabase
            .from('venues')
            .insert({
              name: data.name,
              slug: data.slug,
              city: data.city,
              instagram: data.instagram.replace(/^@+/, ''), // Normalizar instagram
              booking_whatsapp: data.whatsapp,
              booking_email: data.email,
              website_url: data.website || null,
              status: data.status,
              type: data.venue_type || 'bar',
              address: data.address || '',
              state: 'SP', // Valor padrão - pode ser ajustado
              zip_code: '00000-000', // Valor padrão - pode ser ajustado
              maps_url: 'https://maps.google.com', // Valor padrão - pode ser ajustado
              capacity: data.capacity || null,
              lat: data.lat || null,
              lng: data.lng || null,
            })
            .select('id')
            .single();
          break;

        case 'organizer':
          result = await supabase
            .from('organizers')
            .insert({
              name: data.name,
              slug: data.slug,
              city: data.city,
              instagram: data.instagram.replace(/^@+/, ''), // Normalizar instagram
              contact_whatsapp: data.whatsapp,
              contact_email: data.email,
              website_url: data.website || null,
              bio_short: data.bio_short,
              status: data.status,
              type: data.organizer_subtype || 'organizador',
              booking_email: data.booking_email || null,
              booking_whatsapp: data.booking_whatsapp || null,
            })
            .select('id')
            .single();
          break;

        default:
          throw new Error('Tipo de agente inválido');
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: `${data.agent_type === 'artist' ? 'Artista' : 
                       data.agent_type === 'venue' ? 'Local' : 'Organizador'} criado com sucesso!`
      });

      return result.data.id;
    } catch (error: any) {
      console.error('Erro ao criar agente:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Erro",
          description: "Este slug já está em uso. Escolha outro.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao criar agente. Tente novamente.",
          variant: "destructive"
        });
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveDraft = async (data: AgentFormData): Promise<void> => {
    try {
      // Salvar no localStorage
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    }
  };

  const loadDraft = (): AgentFormData | null => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
      return null;
    }
  };

  const clearDraft = (): void => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error);
    }
  };

  return {
    loading,
    createAgent,
    checkSlugExists,
    generateSlug,
    saveDraft,
    loadDraft,
    clearDraft,
  };
};