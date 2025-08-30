import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AgentFormData } from '@/lib/agentSchema';

const DRAFT_STORAGE_KEY = 'agent-form-draft';

// Mapeamento de tipos para tabelas
const TABLE_BY_TYPE = {
  artist: 'artists',
  venue: 'venues', 
  organizer: 'organizers'
} as const;

export const useAgentManagement = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSlugExists = async (slug: string, agentType?: string): Promise<boolean> => {
    try {
      if (agentType) {
        // Verificar apenas na tabela específica
        const tableName = TABLE_BY_TYPE[agentType as keyof typeof TABLE_BY_TYPE];
        const { data } = await supabase
          .from(tableName)
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        return !!data;
      }

      // Verificar em todas as tabelas se tipo não especificado
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
      // Verificar se slug já existe para esse tipo específico
      const slugExists = await checkSlugExists(data.slug, data.agent_type);
      if (slugExists) {
        toast({
          title: "Slug duplicado",
          description: "Este slug já está em uso. Escolha outro.",
          variant: "destructive"
        });
        return null;
      }

      const tableName = TABLE_BY_TYPE[data.agent_type];
      let insertData: any = {};
      
      // Preparar dados baseado no tipo
      switch (data.agent_type) {
        case 'artist':
          insertData = {
            stage_name: data.name,
            slug: data.slug,
            city: data.city || '',
            instagram: data.instagram?.replace(/^@+/, '') || '',
            booking_whatsapp: data.whatsapp || '',
            booking_email: data.email || '',
            website_url: data.website || null,
            bio_short: data.bio_short || '',
            status: data.status,
            artist_type: data.artist_subtype || 'banda',
            spotify_url: data.spotify_url || null,
            soundcloud_url: data.soundcloud_url || null,
            youtube_url: data.youtube_url || null,
            beatport_url: data.beatport_url || null,
            profile_image_url: data.profile_image_url || '',
            presskit_url: data.presskit_url || null,
          };
          break;

        case 'venue':
          insertData = {
            name: data.name,
            address: data.address || '',
            city: data.city || '',
            state: 'SP', // Valor padrão
            slug: data.slug,
            capacity: data.capacity || null,
            lat: data.lat || null,
            lng: data.lng || null,
            contacts_json: {
              instagram: data.instagram?.replace(/^@+/, '') || '',
              whatsapp: data.whatsapp || '',
              email: data.email || '',
              website: data.website || null,
            }
          };
          break;

        case 'organizer':
          insertData = {
            name: data.name,
            slug: data.slug,
            city: data.city || '',
            instagram: data.instagram?.replace(/^@+/, '') || '',
            contact_whatsapp: data.whatsapp || '',
            contact_email: data.email || '',
            website_url: data.website || null,
            bio_short: data.bio_short || '',
            status: data.status,
            type: data.organizer_subtype || 'organizador',
            booking_email: data.booking_email || null,
            booking_whatsapp: data.booking_whatsapp || null,
          };
          break;

        default:
          throw new Error('Tipo de agente inválido');
      }

      // Inserir na tabela correta
      const result = await supabase
        .from(tableName)
        .insert(insertData)
        .select('id')
        .single();

      if (result.error) throw result.error;

      const typeLabels = {
        artist: 'Artista',
        venue: 'Local', 
        organizer: 'Organizador'
      };

      toast({
        title: "Sucesso",
        description: `${typeLabels[data.agent_type]} criado com sucesso!`
      });

      return result.data.id;
    } catch (error: any) {
      console.error('Erro ao criar agente:', error);
      
      if (error.code === '23505') {
        toast({
          title: "Slug duplicado",
          description: "Este slug já está em uso.",
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