"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VenueEnhancedForm } from "@/schemas/entities/venue-enhanced";
import { OrganizerEnhancedForm } from "@/schemas/entities/organizer-enhanced";
import { toast } from "sonner";

export const useUpsertVenueEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VenueEnhancedForm) => {
      console.log("Upserting venue enhanced:", data);

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

      // Transform enhanced data to venue table schema
      const venueData = {
        id: data.id,
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
        instagram: data.instagram || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        about: data.about || null,
        category_id: null, // Enhanced schema doesn't have category_id
        tags: data.tags || [],
        logo_url: data.logo_url || null,
        logo_alt: data.logo_alt || null,
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        gallery_urls: data.gallery?.map(item => item.url) || [],
        status: data.status || 'active',
        // Dynamic fields based on type - stored as JSON in caracteristicas_estabelecimento
        caracteristicas_estabelecimento: {
          type: data.type,
          bar_style: data.bar_style,
          ambient_type: data.ambient_type,
          drink_specialties: data.drink_specialties,
          stage_type: data.stage_type,
          seating_capacity: data.seating_capacity,
          acoustic_treatment: data.acoustic_treatment,
          technical_equipment: data.technical_equipment,
          dance_floor_size: data.dance_floor_size,
          sound_system: data.sound_system,
          lighting_system: data.lighting_system,
          vip_areas: data.vip_areas,
          cuisine_type: data.cuisine_type,
          price_range: data.price_range,
          dining_style: data.dining_style,
          outdoor_seating: data.outdoor_seating,
          music_genres: data.music_genres,
          show_structure: data.show_structure,
        },
        estruturas: data.features || {},
        diferenciais: {},
        bebidas: {},
        cozinha: {},
        seguranca: {},
        acessibilidade: {},
        banheiros: {},
      };

      const { data: result, error } = await supabase
        .from("venues")
        .upsert(venueData, { 
          onConflict: data.id ? "id" : "slug",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Venue enhanced upsert error:", error);
        throw new Error(`Erro ao salvar local: ${error.message}`);
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["venue", data.id] });
      toast.success("Local salvo com sucesso!");
    },
    onError: (error) => {
      console.error("Venue enhanced save error:", error);
      toast.error(error.message || "Erro ao salvar local");
    },
  });
};

export const useUpsertOrganizerEnhanced = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizerEnhancedForm) => {
      console.log("Upserting organizer enhanced:", data);

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

      // Transform enhanced data to organizer table schema
      const organizerData = {
        id: data.id,
        name: data.name,
        slug: data.slug || generateSlug(data.name),
        site: data.website || null,
        site_url: data.website || null,
        email: data.email || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        website: data.website || null,
        avatar_url: data.logo_url || null,
        avatar_alt: data.logo_alt || null,
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        instagram: data.instagram || null,
        bio: data.manifesto || data.about || null,
        bio_short: data.bio_short || null,
        about: data.about || data.manifesto || null,
        status: data.status || 'active',
        type: data.type || 'organizador',
        contact_email: data.email || null,
        contact_whatsapp: data.whatsapp || null,
        booking_email: data.booking_contact?.email || null,
        booking_whatsapp: data.booking_contact?.whatsapp || null,
        country: data.country || 'BR',
        city: data.city || null,
        state: data.state || null,
        city_id: null,
        invoice_name: data.business_info?.legal_name || null,
        tax_id: data.business_info?.tax_id || null,
        invoice_email: data.email || null,
        pix_key: data.payment_info?.pix_key || null,
        bank: data.payment_info || {},
        links: {
          website: data.website,
          instagram: data.links?.instagram || data.instagram,
          facebook: data.links?.facebook,
          linkedin: data.links?.linkedin,
          youtube: data.links?.youtube,
          ...data.links?.other?.reduce((acc, link) => ({ ...acc, [link.label]: link.url }), {})
        },
        is_active: data.status === 'published',
      };

      const { data: result, error } = await supabase
        .from("organizers")
        .upsert(organizerData, { 
          onConflict: data.id ? "id" : "slug",
          ignoreDuplicates: false 
        })
        .select("*")
        .single();

      if (error) {
        console.error("Organizer enhanced upsert error:", error);
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
      console.error("Organizer enhanced save error:", error);
      toast.error(error.message || "Erro ao salvar organizador");
    },
  });
};