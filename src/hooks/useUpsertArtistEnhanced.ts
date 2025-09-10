import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArtistEnhancedForm } from "@/schemas/entities/artist-enhanced";
import { toast } from "sonner";
import { createAdminClient, handleAdminError } from "@/lib/adminClient";

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

      // Transform enhanced form data to database schema
      const transformedData = {
        // Include ID for updates
        ...(data.id && { id: data.id }),
        
        // Map enhanced schema to database fields
        stage_name: data.name,
        slug: data.slug || generateSlug(data.handle),
        artist_type: data.type,
        bio_short: data.bio_short,
        bio_long: data.bio_long || null,
        
        // Location
        city: data.city,
        state: data.state || null,
        country: data.country,
        
        // Contact
        email: data.email || null,
        whatsapp: data.whatsapp,
        instagram: data.instagram,
        
        // Media
        profile_image_url: data.profile_image_url,
        cover_image_url: data.cover_image_url || null,
        
        // Links
        website_url: data.links.website || null,
        spotify_url: data.links.spotify || null,
        soundcloud_url: data.links.soundcloud || null,
        youtube_url: data.links.youtube || null,
        beatport_url: data.links.beatport || null,
        
        // Professional info
        fee_range: data.fee_range || null,
        availability_days: data.availability?.days || [],
        cities_active: data.availability?.cities || [],
        
        // Type-specific fields
        dj_style: data.dj_style || null,
        equipment_needs: data.equipment_needs || null,
        set_time_minutes: data.set_duration_min || null,
        team_size: data.band_members || null,
        tech_rider_url: data.technical_rider || null,
        
        // Booking contact
        booking_email: data.booking_contact?.email || null,
        booking_phone: data.booking_contact?.phone || null,
        booking_whatsapp: data.booking_contact?.whatsapp || null,
        
        // System fields
        status: data.status,
        priority: data.priority,
        internal_notes: data.internal_notes || null,
        
        // Gallery
        gallery_urls: data.gallery?.map(g => g.url) || [],
        
        // Required defaults
        image_rights_authorized: true,
      };

      // Upsert artist using admin client
      console.log("Making admin REST call for artist upsert...");
      console.log("Transformed data payload:", JSON.stringify(transformedData, null, 2));
      
      const endpoint = "artists";
      const method = data.id ? "PATCH" : "POST";
      const url = data.id ? `${endpoint}?id=eq.${data.id}` : endpoint;
      
      try {
        const result = await adminClient.restCall(url, {
          method,
          body: JSON.stringify(transformedData),
        });
        console.log("Artist upsert result:", result);
        
        const artistData = Array.isArray(result) ? result[0] : result;
        
        if (!artistData) {
          throw new Error('Erro ao salvar artista: dados não retornados');
        }

        console.log("Artist upserted successfully:", artistData);

        // Sync categories and genres relationships
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
        console.error("Failed payload:", JSON.stringify(transformedData, null, 2));
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