import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createAdminClient } from "@/lib/adminClient";
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
      try {
        console.log(`🚀 Salvando ${entityType}:`, data);

        // Remove campos undefined/null para evitar problemas
        const cleanData = Object.fromEntries(
          Object.entries(data).filter(([_, value]) => value !== undefined && value !== null && value !== '')
        );

        // Ensure we have a valid ID if it exists
        if (cleanData.id && (typeof cleanData.id !== 'string' || cleanData.id === 'undefined')) {
          delete cleanData.id;
        }

        // Generate slug if not provided
        if (!cleanData.slug && cleanData.name && typeof cleanData.name === 'string') {
          cleanData.slug = generateSlug(cleanData.name);
        }

        console.log('🔄 EntityFormV5: Sending clean data:', {
          entityType,
          data: cleanData,
          operation: cleanData.id ? 'UPDATE' : 'CREATE'
        });

        // Use admin client for write operations
        const adminClient = await createAdminClient();

        if (cleanData.id) {
          // Update existing
          console.log('📝 Updating entity with ID:', cleanData.id);
          const result = await adminClient.restCall(`${entityType}?id=eq.${cleanData.id}`, {
            method: 'PATCH',
            body: JSON.stringify(cleanData),
          });

          return Array.isArray(result) ? result[0] : result;
        } else {
          // Create new
          console.log('➕ Creating new entity');
          const result = await adminClient.restCall(entityType, {
            method: 'POST',
            body: JSON.stringify(cleanData),
          });

          return Array.isArray(result) ? result[0] : result;
        }
      } catch (error) {
        console.error('❌ EntityFormV5 Error:', error);
        throw error;
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

      // Use admin client for autosave operations
      const adminClient = await createAdminClient();

      if (cleanData.id) {
        await adminClient.restCall(`${entityType}?id=eq.${cleanData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(cleanData),
        });
      } else {
        const result = await adminClient.restCall(entityType, {
          method: 'POST',
          body: JSON.stringify(cleanData),
        });
        return Array.isArray(result) ? result[0] : result;
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