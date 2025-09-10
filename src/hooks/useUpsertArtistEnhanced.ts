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
  };
}

const syncArtistCategories = async (artistId: string, categoryIds: string[], adminClient: any) => {
  console.log(`Syncing categories for artist ${artistId}:`, categoryIds);
  
  try {
    // Remove existing relationships using admin client
    await adminClient.restCall(`artists_categories?artist_id=eq.${artistId}`, {
      method: 'DELETE',
    });
    console.log('Existing categories removed');

    // Add new relationships
    if (categoryIds.length > 0) {
      const categoryRelations = categoryIds.map(categoryId => ({
        artist_id: artistId,
        category_id: categoryId
      }));

      await adminClient.restCall('artists_categories', {
        method: 'POST',
        body: JSON.stringify(categoryRelations),
      });
      console.log('New categories added:', categoryRelations);
    }
  } catch (error) {
    console.error('Error syncing artist categories:', error);
    throw error;
  }
};

const syncArtistGenres = async (artistId: string, genreIds: string[], adminClient: any) => {
  console.log(`Syncing genres for artist ${artistId}:`, genreIds);
  
  try {
    // Remove existing relationships using admin client
    await adminClient.restCall(`artists_genres?artist_id=eq.${artistId}`, {
      method: 'DELETE',
    });
    console.log('Existing genres removed');

    // Add new relationships
    if (genreIds.length > 0) {
      const genreRelations = genreIds.map(genreId => ({
        artist_id: artistId,
        genre_id: genreId
      }));

      await adminClient.restCall('artists_genres', {
        method: 'POST',
        body: JSON.stringify(genreRelations),
      });
      console.log('New genres added:', genreRelations);
    }
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

      // Use proper mapper to convert form data to database schema
      const payload: any = mapArtistFormToDb(data);
      
      // Add ID for updates
      if (data.id) {
        payload.id = data.id;
      }
      
      // Generate slug if not provided
      if (!payload.slug && data.handle) {
        payload.slug = generateSlug(data.handle);
      }

      console.log("Using mapped payload:", JSON.stringify(payload, null, 2));

      // Upsert artist using admin client
      const endpoint = "artists";
      const method = data.id ? "PATCH" : "POST";
      const url = data.id ? `${endpoint}?id=eq.${data.id}` : endpoint;
      
      try {
        const result = await adminClient.restCall(url, {
          method,
          body: JSON.stringify(payload),
        });
        console.log("Artist upsert result:", result);
        
        const artistData = Array.isArray(result) ? result[0] : result;
        
        if (!artistData) {
          throw new Error('Erro ao salvar artista: dados não retornados');
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
      } catch (error) {
        console.error("Detailed artist upsert error:", error);
        console.error("Failed payload:", JSON.stringify(payload, null, 2));
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", data.id] });
      toast.success("Artista salvo com sucesso!", {
        description: "As informações foram atualizadas.",
        className: "toast-success"
      });
    },
    onError: (error: Error) => {
      console.error("Enhanced artist save error:", error);
      const errorMessage = handleAdminError(error);
      toast.error(errorMessage);
    },
  });
};