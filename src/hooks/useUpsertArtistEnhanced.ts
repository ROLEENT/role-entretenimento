import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArtistEnhancedForm } from "@/schemas/entities/artist-enhanced";
import { toast } from "sonner";
import { createAdminClient, handleAdminError } from "@/lib/adminClient";

// Helper functions for data sanitization
function toNull(v?: string | null): string | null { 
  return v?.trim() ? v.trim() : null;
}

function normalizeUrl(v?: string | null): string | null { 
  return toNull(v);
}

function toArray(v?: string[] | null): string[] { 
  return Array.isArray(v) ? v : [];
}

// Mapper that converts form data to database schema
function mapArtistFormToDb(formData: ArtistEnhancedForm) {
  return {
    // Basic info - map to correct column names
    stage_name: toNull(formData.name),
    slug: toNull(formData.slug),
    artist_type: toNull(formData.type),
    bio_short: toNull(formData.bio_short),
    bio_long: toNull(formData.bio_long),
    
    // Location
    city: toNull(formData.city),
    state: toNull(formData.state),
    country: toNull(formData.country) || 'BR',
    
    // Contact - map to correct column names  
    email: toNull(formData.email),
    whatsapp: toNull(formData.whatsapp),
    instagram: toNull(formData.instagram),
    
    // Media - extract URLs from objects if present
    profile_image_url: toNull(formData.profile_image_url),
    cover_image_url: toNull(formData.cover_image_url),
    
    // Links - map to correct column names
    website_url: normalizeUrl(formData.links?.website),
    spotify_url: normalizeUrl(formData.links?.spotify),
    soundcloud_url: normalizeUrl(formData.links?.soundcloud),
    youtube_url: normalizeUrl(formData.links?.youtube),
    beatport_url: normalizeUrl(formData.links?.beatport),
    
    // Professional info
    fee_range: toNull(formData.fee_range),
    availability_days: toArray(formData.availability?.days),
    cities_active: toArray(formData.availability?.cities),
    
    // Type-specific fields
    dj_style: toNull(formData.dj_style),
    equipment_needs: toNull(formData.equipment_needs),
    set_time_minutes: formData.set_duration_min || null,
    team_size: formData.band_members || null,
    tech_rider_url: normalizeUrl(formData.technical_rider),
    
    // Booking contact
    booking_email: toNull(formData.booking_contact?.email),
    booking_phone: toNull(formData.booking_contact?.phone),
    booking_whatsapp: toNull(formData.booking_contact?.whatsapp),
    
    // System fields
    status: toNull(formData.status) || 'active',
    priority: formData.priority || 0,
    internal_notes: toNull(formData.internal_notes),
    
    // Gallery - extract URLs only
    gallery_urls: formData.gallery?.map(g => g.url).filter(Boolean) || [],
    
    // Required fields
    image_rights_authorized: true,
    updated_at: new Date().toISOString(),
    
    // DO NOT SEND categories/genres here - they go to junction tables
    // categories and genres will be handled separately in junction tables
  };
}

const syncArtistCategories = async (artistId: string, categoryIds: string[], adminClient: any) => {
  console.log(`Syncing categories for artist ${artistId}:`, categoryIds);
  
  try {
    // Extract IDs from form data (handle both {value, label} objects and direct IDs)
    const catIds: string[] = categoryIds.map((item: any) => item.value ?? item.id ?? item).filter(Boolean);
    
    if (catIds.length === 0) {
      console.log('No categories to sync, skipping');
      return;
    }

    // Remove existing relationships using admin client
    await adminClient.restCall(`artists_categories?artist_id=eq.${artistId}`, {
      method: 'DELETE',
    });
    console.log('Existing categories removed');

    // Add new relationships
    const categoryRelations = catIds.map(categoryId => ({
      artist_id: artistId,
      category_id: categoryId
    }));

    await adminClient.restCall('artists_categories', {
      method: 'POST',
      body: JSON.stringify(categoryRelations),
    });
    console.log('New categories added:', categoryRelations);
  } catch (error) {
    console.error('Error syncing artist categories:', error);
    throw error;
  }
};

const syncArtistGenres = async (artistId: string, genreIds: string[], adminClient: any) => {
  console.log(`Syncing genres for artist ${artistId}:`, genreIds);
  
  try {
    // Extract IDs from form data (handle both {value, label} objects and direct IDs)
    const gIds: string[] = genreIds.map((item: any) => item.value ?? item.id ?? item).filter(Boolean);
    
    if (gIds.length === 0) {
      console.log('No genres to sync, skipping');
      return;
    }

    // Remove existing relationships using admin client
    await adminClient.restCall(`artists_genres?artist_id=eq.${artistId}`, {
      method: 'DELETE',
    });
    console.log('Existing genres removed');

    // Add new relationships
    const genreRelations = gIds.map(genreId => ({
      artist_id: artistId,
      genre_id: genreId
    }));

    await adminClient.restCall('artists_genres', {
      method: 'POST',
      body: JSON.stringify(genreRelations),
    });
    console.log('New genres added:', genreRelations);
  } catch (error) {
    console.error('Error syncing artist genres:', error);
    throw error;
  }
};

export const useUpsertArtistEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArtistEnhancedForm) => {
      console.log("Upserting enhanced artist:", data);

      // Create admin client with proper headers
      const adminClient = await createAdminClient();
      console.log('Admin client created successfully, admin email:', adminClient.adminEmail);

      // Generate slug from handle if not provided
      const generateSlug = (text: string) => {
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
      };

      // TESTE 1: Payload mínimo para verificar se salva
      const payloadMin: any = { 
        stage_name: toNull(data.name) || 'Teste',
        updated_at: new Date().toISOString() 
      };

      // TESTE 2: Payload completo mapeado (comente o payloadMin e descomente este)
      const payloadComplete: any = mapArtistFormToDb(data);
      
      // Add ID for updates
      if (data.id) {
        payloadComplete.id = data.id;
        payloadMin.id = data.id;
      }
      
      // Generate slug if not provided
      if (!payloadComplete.slug && data.handle) {
        payloadComplete.slug = generateSlug(data.handle);
      }

      // ESCOLHA QUAL PAYLOAD USAR (troque aqui para testar)
      const payload = payloadMin; // Mude para payloadComplete depois

      console.log("=== PAYLOAD SELECTION ===");
      console.log("Using payload:", payload === payloadMin ? "MINIMAL" : "COMPLETE");
      console.log("Mapped payload:", JSON.stringify(payload, null, 2));

      // Upsert artist using admin client
      const endpoint = "artists";
      const method = data.id ? "PATCH" : "POST";
      const url = data.id ? `${endpoint}?id=eq.${data.id}` : endpoint;
      
      try {
        console.log("=== ARTIST UPSERT DEBUG ===");
        console.log("Method:", method);
        console.log("URL:", url);
        console.log("Payload being sent:", JSON.stringify(payload, null, 2));

        const result = await adminClient.restCall(url, {
          method,
          body: JSON.stringify(payload),
        });
        
        console.log("Raw result from adminClient:", result);
        
        const artistData = Array.isArray(result) ? result[0] : result;
        
        if (!artistData || !artistData.id) {
          throw new Error('Erro ao salvar artista: dados não retornados ou ID ausente');
        }

        console.log("Artist upserted successfully:", artistData);

        // Sync categories and genres relationships AFTER successful artist save
        if (data.categories && data.categories.length > 0) {
          console.log('Syncing artist categories...');
          await syncArtistCategories(artistData.id, data.categories, adminClient);
        }

        if (data.genres && data.genres.length > 0) {
          console.log('Syncing artist genres...');
          await syncArtistGenres(artistData.id, data.genres, adminClient);
        }

        return artistData;
      } catch (error: any) {
        console.error("=== ARTIST UPSERT ERROR ===");
        console.error("Error object:", error);
        console.error("Error message:", error?.message);
        console.error("Error details:", error?.details);
        console.error("Failed payload:", JSON.stringify(payload, null, 2));
        console.error("=== END ERROR DEBUG ===");
        
        // Re-throw with enhanced error info
        const enhancedError = new Error(
          error?.message || 
          error?.details || 
          'Erro desconhecido ao salvar artista'
        );
        enhancedError.stack = error?.stack;
        throw enhancedError;
      }
    },
    onSuccess: (data) => {
      console.log("Artist save SUCCESS, invalidating queries for:", data.id);
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", data.id] });
      toast.success("Artista salvo com sucesso!", {
        description: "As informações foram atualizadas.",
        className: "toast-success"
      });
    },
    onError: (error: any) => {
      console.error("=== MUTATION ERROR HANDLER ===");
      console.error("Enhanced artist save error:", error);
      console.error("Error message:", error?.message);
      console.error("Error details:", error?.details);
      
      const errorMessage = error?.message || 
        error?.details || 
        handleAdminError(error) || 
        'Erro desconhecido ao salvar artista';
      
      toast.error(errorMessage, {
        description: "Verifique os dados e tente novamente.",
        className: "toast-error"
      });
    },
  });
};