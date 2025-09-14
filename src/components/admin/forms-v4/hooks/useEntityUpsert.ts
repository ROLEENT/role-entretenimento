import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EntityType } from "../types";
import { useAdminSession } from "@/hooks/useAdminSession";
import { createAdminClient } from "@/lib/adminClient";

interface UseEntityUpsertOptions {
  entityType: EntityType;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
}

export const useEntityUpsert = ({ entityType, onSuccess, onError }: UseEntityUpsertOptions) => {
  const queryClient = useQueryClient();
  const { adminEmail, isAdmin, isLoading } = useAdminSession();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log(`=== UPSERT ${entityType.toUpperCase()} DEBUG START ===`);
      console.log("1. Raw form data received:", JSON.stringify(data, null, 2));
      console.log("2. Admin session:", { adminEmail, isAdmin, isLoading });

      // Verificar autenticação admin
      if (isLoading) {
        throw new Error("Verificando permissões de administrador...");
      }

      if (!isAdmin || !adminEmail) {
        throw new Error("Acesso negado: você precisa estar logado como administrador");
      }

      // Mapear dados baseado no tipo de entidade
      const mappedData = mapEntityData(data, entityType);
      console.log("3. Mapped entity data:", JSON.stringify(mappedData, null, 2));

      try {
        console.log("4. Creating admin client...");
        const adminClient = await createAdminClient();
        console.log("5. Admin client created, admin email:", adminClient.adminEmail);
        
        // Determinar tabela baseado no tipo de entidade
        const tableName = getTableName(entityType);
        console.log(`6. Attempting upsert to ${tableName} table via admin REST API...`);
        
        const result = await adminClient.restCall(tableName, {
          method: 'POST',
          body: JSON.stringify(mappedData),
          headers: {
            'Prefer': 'return=representation,resolution=merge-duplicates'
          }
        });

        console.log(`7. SUCCESS - ${entityType} saved:`, result);
        console.log(`=== UPSERT ${entityType.toUpperCase()} DEBUG END ===`);
        
        return result;
      } catch (error: any) {
        console.error(`8. UPSERT ERROR for ${entityType}:`, error);
        
        if (error.message?.includes('duplicate key')) {
          throw new Error(`${getEntityDisplayName(entityType)} com este slug já existe`);
        }
        
        if (error.message?.includes('permission')) {
          throw new Error(`Sem permissão para salvar ${getEntityDisplayName(entityType).toLowerCase()}`);
        }
        
        throw new Error(`Erro ao salvar ${getEntityDisplayName(entityType).toLowerCase()}: ${error.message}`);
      }
    },

    onSuccess: (result) => {
      console.log(`${getEntityDisplayName(entityType)} salvo com sucesso!`, result);
      
      // Invalidate queries relacionadas
      queryClient.invalidateQueries({ 
        queryKey: [entityType] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`${entityType}s`] 
      });
      
      toast.success(`${getEntityDisplayName(entityType)} salvo com sucesso!`);
      
      if (onSuccess) {
        onSuccess(result);
      }
    },

    onError: (error: Error) => {
      console.error(`Erro ao salvar ${getEntityDisplayName(entityType).toLowerCase()}:`, error);
      toast.error(error.message);
      
      if (onError) {
        onError(error);
      }
    }
  });
};

// Helpers
function getTableName(entityType: EntityType): string {
  switch (entityType) {
    case 'artist':
      return 'artists';
    case 'organizer':
      return 'organizers';
    case 'venue':
      return 'venues';
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }
}

function getEntityDisplayName(entityType: EntityType): string {
  switch (entityType) {
    case 'artist':
      return 'Artista';
    case 'organizer':
      return 'Organizador';
    case 'venue':
      return 'Venue';
    default:
      return 'Entidade';
  }
}

function mapEntityData(data: any, entityType: EntityType): any {
  // Campos comuns
  const baseData = {
    id: data.id || undefined,
    name: data.name,
    slug: data.slug || generateSlug(data.name || data.handle),
    created_at: data.created_at,
    updated_at: new Date().toISOString(),
  };

  // Mapear baseado no tipo
  switch (entityType) {
    case 'artist':
      return {
        ...baseData,
        stage_name: data.name,
        artist_type: data.type || 'artist',
        city: data.city,
        state: data.state,
        country: data.country || 'BR',
        bio_short: data.bio_short,
        bio_long: data.bio_long,
        instagram: data.instagram,
        booking_email: data.email,
        booking_whatsapp: data.whatsapp,
        profile_image_url: data.profile_image_url,
        cover_image_url: data.cover_url,
        status: data.status || 'active',
        priority: data.priority || 0,
        internal_notes: data.internal_notes,
      };

    case 'organizer':
      return {
        ...baseData,
        name: data.name,
        email: data.email,
        phone: data.phone,
        site: data.website,
        avatar_url: data.logo_url,
        city: data.city,
        state: data.state,
        country: data.country || 'BR',
        status: data.status || 'active',
      };

    case 'venue':
      return {
        ...baseData,
        name: data.name,
        bio: data.bio_short,
        about: data.about,
        address_line: data.address_line,
        district: data.district,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country || 'BR',
        latitude: data.latitude,
        longitude: data.longitude,
        phone: data.phone,
        whatsapp: data.whatsapp,
        email: data.email,
        instagram: data.instagram,
        website: data.website,
        logo_url: data.logo_url,
        cover_url: data.cover_url,
        capacity: data.capacity,
        status: data.status || 'active',
      };

    default:
      return baseData;
  }
}

function generateSlug(text: string): string {
  if (!text) return 'untitled-entity';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\-_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}