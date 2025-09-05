import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { generateSlug } from '@/utils/slugUtils';
import { toast } from 'sonner';

export interface AgentData {
  id: string;
  name: string;
  slug?: string;
  city?: string;
  state?: string;
  country?: string;
  bio_short?: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  tags?: string[];
  instagram?: string;
  website?: string;
  stage_name?: string; // Para artistas
  booking_email?: string; // Para artistas
  contact_email?: string; // Para organizadores
  email?: string; // Para venues
}

export type ProfileType = 'artista' | 'local' | 'organizador';

export const useProfileGeneration = (agentId: string, agentType: ProfileType) => {
  const queryClient = useQueryClient();

  // Verificar se perfil já existe
  const { data: existingProfile, isLoading: isCheckingProfile } = useQuery({
    queryKey: ['profile-exists', agentId, agentType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entity_profiles')
        .select('id, handle')
        .eq('source_id', agentId)
        .eq('type', agentType)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    },
    enabled: !!agentId,
  });

  // Gerar handle único
  const generateUniqueHandle = async (baseName: string): Promise<string> => {
    if (!baseName || baseName.trim() === '') {
      baseName = 'organizador';
    }
    
    let handle = generateSlug(baseName);
    let counter = 1;
    
    // Adicionar timestamp para garantir unicidade
    const timestamp = Date.now().toString().slice(-6);
    
    while (counter < 100) { // Limite para evitar loops infinitos
      const testHandle = counter === 1 ? handle : `${generateSlug(baseName)}-${counter}`;
      
      const { data, error } = await supabase
        .from('entity_profiles')
        .select('id')
        .eq('handle', testHandle)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking handle:', error);
        // Se houve erro, use timestamp para garantir unicidade
        return `${generateSlug(baseName)}-${timestamp}`;
      }
      
      if (!data) {
        return testHandle;
      }
      
      counter++;
    }
    
    // Fallback: usar timestamp se não conseguiu gerar handle único
    return `${generateSlug(baseName)}-${timestamp}`;
  };

  // Mapear dados do agente para perfil
  const mapAgentToProfile = async (agent: AgentData) => {
    const handle = await generateUniqueHandle(agent.name || agent.stage_name || '');
    
    return {
      type: agentType,
      handle,
      name: agent.stage_name || agent.name || '',
      city: agent.city || '',
      state: agent.state || '',
      country: agent.country || 'BR',
      bio_short: agent.bio_short || '',
      bio: agent.bio || null,
      avatar_url: agent.avatar_url || null,
      cover_url: agent.cover_url || null,
      tags: agent.tags || [],
      verified: false,
      visibility: 'public' as const,
      source_id: agent.id,
      instagram: agent.instagram || null,
      website: agent.website || null,
      email: agent.booking_email || agent.contact_email || agent.email || null,
    };
  };

  // Mutation para gerar/atualizar perfil
  const generateProfileMutation = useMutation({
    mutationFn: async (agentData: AgentData) => {
      const profileData = await mapAgentToProfile(agentData);
      
      const { data, error } = await supabase
        .from('entity_profiles')
        .upsert(profileData, {
          onConflict: 'source_id,type',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (profile) => {
      queryClient.invalidateQueries({ queryKey: ['profile-exists', agentId, agentType] });
      const message = existingProfile ? 'Perfil público atualizado com sucesso!' : 'Perfil público criado com sucesso!';
      toast.success(message);
      return profile;
    },
    onError: (error) => {
      console.error('Error generating profile:', error);
      toast.error('Erro ao gerar perfil público');
    },
  });

  return {
    existingProfile,
    isCheckingProfile,
    generateProfile: generateProfileMutation.mutate,
    isGenerating: generateProfileMutation.isPending,
    hasProfile: !!existingProfile,
  };
};