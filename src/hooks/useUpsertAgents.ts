"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VenueFlexibleFormData } from "@/schemas/venue-flexible";
import { ArtistForm, OrganizerForm } from "@/schemas/agents";
import { ArtistFlexibleForm } from "@/schemas/agents-flexible";
import { toast } from "sonner";
import { syncArtistGenres } from "@/utils/artistPivotSync";

export const useUpsertArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArtistFlexibleForm) => {
      console.log("Upserting artist:", data);

      // Generate slug from stage_name if not provided
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

      // Extract genres for separate handling
      const { genres, ...dataWithoutGenres } = data;

      // Transform data to match database schema exactly
      const transformedData = {
        ...dataWithoutGenres,
        
        // Generate slug from stage_name if not provided
        slug: data.slug || generateSlug(data.stage_name),
        
        // Clean URL fields - convert empty strings to null
        website_url: data.website_url === '' ? null : data.website_url,
        spotify_url: data.spotify_url === '' ? null : data.spotify_url,
        soundcloud_url: data.soundcloud_url === '' ? null : data.soundcloud_url,
        youtube_url: data.youtube_url === '' ? null : data.youtube_url,
        beatport_url: data.beatport_url === '' ? null : data.beatport_url,
        audius_url: data.audius_url === '' ? null : data.audius_url,
        profile_image_url: data.profile_image_url === '' ? null : data.profile_image_url,
        cover_image_url: data.cover_image_url === '' ? null : data.cover_image_url,
        avatar_url: data.avatar_url === '' ? null : data.avatar_url,
        presskit_url: data.presskit_url === '' ? null : data.presskit_url,
        tech_rider_url: data.tech_rider_url === '' ? null : data.tech_rider_url,
        website: data.website === '' ? null : data.website,
        email: data.email === '' ? null : data.email,
        booking_email: data.booking_email === '' ? null : data.booking_email,
        
        // Ensure arrays are properly initialized
        cities_active: data.cities_active || [],
        availability_days: data.availability_days || [],
        tags: data.tags || [],
        
        // Ensure default values
        country: data.country || 'BR',
        status: data.status || 'active',
        priority: data.priority || 0,
        image_rights_authorized: data.image_rights_authorized || false,
      };

      const { data: result, error } = await supabase
        .from("artists")
        .upsert(transformedData, { 
          onConflict: "slug",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Artist upsert error:", error);
        throw new Error(`Erro ao salvar artista: ${error.message}`);
      }

      // Sync genres if provided
      if (genres && genres.length > 0 && result.id) {
        await syncArtistGenres(result.id, genres);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", data.id] });
      toast.success("Artista salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Artist save error:", error);
      toast.error(error.message || "Erro ao salvar artista");
    },
  });
};

export const useUpsertVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VenueFlexibleFormData) => {
      console.log("Upserting venue - raw data:", data);

      // Generate slug if not provided
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

      // Transform and clean data to match database schema exactly
      const venueData = {
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        address_line: data.address_line || null,
        district: data.district || null,
        city: data.city || null,
        state: data.state || null,
        postal_code: data.postal_code || null,
        country: data.country || 'BR',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        capacity: data.capacity || null,
        opening_hours: data.opening_hours || {},
        caracteristicas_estabelecimento: data.caracteristicas_estabelecimento || {},
        estruturas: data.estruturas || {},
        diferenciais: data.diferenciais || {},
        bebidas: data.bebidas || {},
        cozinha: data.cozinha || {},
        seguranca: data.seguranca || {},
        acessibilidade: data.acessibilidade || {},
        banheiros: data.banheiros || {},
        instagram: data.instagram || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        about: data.about || null,
        category_id: data.category_id || null,
        tags: (() => {
          const tagsValue = data.tags as any; // Type assertion to handle potential string input
          if (Array.isArray(tagsValue)) {
            return tagsValue;
          }
          if (typeof tagsValue === 'string' && tagsValue.trim()) {
            return tagsValue.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
          }
          return [];
        })(),
        logo_url: data.logo_url || null,
        logo_alt: data.logo_alt || null,
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        gallery_urls: data.gallery_urls || [],
        status: data.status || 'active',
        // Removed priority and updated_at - not in database schema
      };

      console.log("Upserting venue - transformed data:", venueData);

      // Use upsert with onConflict for both insert and update
      const { data: result, error } = await supabase
        .from("venues")
        .upsert(venueData, { 
          onConflict: "slug",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Venue upsert error:", error);
        console.error("Error details:", { hint: error.hint, details: error.details });
        throw new Error(`Erro ao salvar local: ${error.message}`);
      }

      console.log("Venue upsert successful:", result);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", data.id] });
      toast.success("Local salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Venue save error:", error);
      const errorMessage = error.message || "Erro ao salvar local";
      toast.error(errorMessage);
    },
  });
};

export const useUpsertOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      console.log("Upserting organizer:", data);
      console.log("Table columns available:", Object.keys(data));

      // Transform data to match organizers table structure
      const organizerData = {
        id: data.id || undefined,
        name: data.name,
        slug: data.slug || null,
        site: data.site || null,
        site_url: data.website || data.site_url || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        avatar_url: data.avatar_url || null,
        avatar_alt: data.avatar_alt || null,
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        instagram: data.instagram || null,
        bio: data.bio || null,
        bio_short: data.bio_short || null,
        about: data.about || null,
        status: data.status || 'draft',
        type: data.type || 'organizador',
        contact_email: data.contact_email || data.email || null,
        contact_whatsapp: data.contact_whatsapp || data.whatsapp || data.phone || null,
        booking_email: data.booking_email || null,
        booking_whatsapp: data.booking_whatsapp || null,
        country: data.country || 'BR',
        city: data.city || null,
        state: data.state || null,
        city_id: data.city_id || null,
        invoice_name: data.invoice_name || null,
        tax_id: data.tax_id || null,
        invoice_email: data.invoice_email || null,
        pix_key: data.pix_key || null,
        bank: data.bank || {},
        links: data.links || {},
        is_active: data.is_active !== undefined ? data.is_active : true,
      };

      const { data: result, error } = await supabase
        .from("organizers")
        .upsert(organizerData, { 
          onConflict: "id",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Organizer upsert error:", error);
        throw new Error(`Erro ao salvar organizador: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizer", data.id] });
      toast.success("Organizador salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Organizer save error:", error);
      toast.error(error.message || "Erro ao salvar organizador");
    },
  });
};