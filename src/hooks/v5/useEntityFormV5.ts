import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EntityType = 'artists' | 'organizers' | 'venues' | 'events' | 'magazine_posts';

interface UseEntityFormV5Options {
  entityType: EntityType;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useEntityFormV5({ entityType, onSuccess, onError }: UseEntityFormV5Options) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      console.log(`🚀 Salvando ${entityType}:`, data);

      // Remove campos undefined/null para evitar problemas
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );

      // Generate slug if not provided
      if (!cleanData.slug && cleanData.name && typeof cleanData.name === 'string') {
        cleanData.slug = generateSlug(cleanData.name);
      }

      if (cleanData.id) {
        // Update existing
        const { data: result, error } = await supabase
          .from(entityType)
          .update(cleanData)
          .eq('id', cleanData.id)
          .select()
          .single();

        if (error) throw error;
        return result;
      } else {
        // Create new
        const { data: result, error } = await supabase
          .from(entityType)
          .insert(cleanData)
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: (data) => {
      console.log(`✅ ${entityType} salvo com sucesso:`, data);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [entityType] });
      queryClient.invalidateQueries({ queryKey: [entityType.slice(0, -1), data.id] }); // singular form
      
      toast.success(`${getEntityDisplayName(entityType)} salvo com sucesso!`);
      onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error(`❌ Erro ao salvar ${entityType}:`, error);
      toast.error(`Erro ao salvar ${getEntityDisplayName(entityType)}: ${error.message}`);
      onError?.(error);
    },
  });

  return mutation;
}

// Autosave hook (for draft saving)
export function useAutosaveV5({ entityType }: { entityType: EntityType }) {
  return useMutation({
    mutationFn: async (data: any) => {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );

      // Force status to draft for autosave
      cleanData.status = 'draft';

      if (!cleanData.slug && cleanData.name && typeof cleanData.name === 'string') {
        cleanData.slug = generateSlug(cleanData.name);
      }

      if (cleanData.id) {
        const { error } = await supabase
          .from(entityType)
          .update(cleanData)
          .eq('id', cleanData.id);
        if (error) throw error;
      } else {
        const { data: result, error } = await supabase
          .from(entityType)
          .insert(cleanData)
          .select('id')
          .single();
        if (error) throw error;
        return result;
      }
    },
    onError: (error) => {
      console.error('Autosave error:', error);
    }
  });
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .slice(0, 80); // Limit to 80 chars
}

function getEntityDisplayName(entityType: EntityType): string {
  const names = {
    artists: 'Artista',
    organizers: 'Organizador', 
    venues: 'Local',
    events: 'Evento',
    magazine_posts: 'Revista'
  };
  return names[entityType];
}