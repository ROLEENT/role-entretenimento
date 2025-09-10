import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArtistEnhancedForm } from "@/schemas/entities/artist-enhanced";
import { toast } from "sonner";

export const useUpsertArtistEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArtistEnhancedForm) => {
      console.log("Upserting enhanced artist:", data);

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
        // Map enhanced schema to database fields
        stage_name: data.name,
        handle: data.handle,
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
        profile_image_alt: data.profile_image_alt,
        cover_image_url: data.cover_image_url || null,
        cover_image_alt: data.cover_image_alt || null,
        
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
        set_duration_min: data.set_duration_min || null,
        band_members: data.band_members || null,
        instruments: data.instruments || [],
        technical_rider: data.technical_rider || null,
        performance_type: data.performance_type || [],
        costume_requirements: data.costume_requirements || null,
        special_needs: data.special_needs || null,
        theater_experience: data.theater_experience || null,
        repertoire: data.repertoire || [],
        acting_styles: data.acting_styles || [],
        photography_style: data.photography_style || [],
        equipment_owned: data.equipment_owned || null,
        portfolio_highlights: data.portfolio_highlights || [],
        
        // Booking contact
        booking_contact_name: data.booking_contact?.name || null,
        booking_email: data.booking_contact?.email || null,
        booking_phone: data.booking_contact?.phone || null,
        booking_whatsapp: data.booking_contact?.whatsapp || null,
        
        // System fields
        status: data.status,
        priority: data.priority,
        internal_notes: data.internal_notes || null,
        
        // Categories and genres as arrays
        tags: data.categories || [],
        genres: data.genres || [],
        
        // Gallery
        gallery_urls: data.gallery?.map(g => g.url) || [],
        
        // Required defaults
        image_rights_authorized: true,
      };

      const { data: result, error } = await supabase
        .from("artists")
        .upsert(transformedData, { 
          onConflict: data.id ? "id" : "slug",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Enhanced artist upsert error:", error);
        throw new Error(`Erro ao salvar artista: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", data.id] });
      toast.success("Artista salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Enhanced artist save error:", error);
      toast.error(error.message || "Erro ao salvar artista");
    },
  });
};