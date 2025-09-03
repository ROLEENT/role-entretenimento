"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { VenueFlexibleFormData } from "@/schemas/venue-flexible";
import { ArtistForm, OrganizerForm } from "@/schemas/agents";
import { toast } from "sonner";
import { syncArtistGenres } from "@/utils/artistPivotSync";

export const useUpsertArtist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ArtistForm) => {
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

      // Generate slug from name if not provided
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

      // Transform and clean data like in useUpsertPost
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
        caracteristicas_estabelecimento: {
          descricao: data.caracteristicas_estabelecimento?.descricao || null,
          ...(data.caracteristicas_estabelecimento || {})
        },
         estruturas: {
           descricao: data.estruturas?.descricao || null,
           ar_condicionado: data.estruturas?.ar_condicionado || false,
           wifi: data.estruturas?.wifi || false,
           aquecimento: data.estruturas?.aquecimento || false,
           estacionamento: data.estruturas?.estacionamento || false,
           aceita_pets: data.estruturas?.aceita_pets || false,
           area_fumantes: data.estruturas?.area_fumantes || false,
           pista_danca: data.estruturas?.pista_danca || false,
           area_vip: data.estruturas?.area_vip || false,
           rooftop: data.estruturas?.rooftop || false,
           estacoes_carregamento: data.estruturas?.estacoes_carregamento || false,
           lugares_sentados: data.estruturas?.lugares_sentados || false,
         },
         diferenciais: {
           descricao: data.diferenciais?.descricao || null,
           dj: data.diferenciais?.dj || false,
           happy_hour: data.diferenciais?.happy_hour || false,
           mesa_bilhar: data.diferenciais?.mesa_bilhar || false,
           jogos_arcade: data.diferenciais?.jogos_arcade || false,
           karaoke: data.diferenciais?.karaoke || false,
           narguile: data.diferenciais?.narguile || false,
           transmissao_eventos_esportivos: data.diferenciais?.transmissao_eventos_esportivos || false,
           shows_ao_vivo: data.diferenciais?.shows_ao_vivo || false,
           stand_up: data.diferenciais?.stand_up || false,
           musica_ao_vivo: data.diferenciais?.musica_ao_vivo || false,
           amigavel_lgbtqia: data.diferenciais?.amigavel_lgbtqia || false,
         },
         bebidas: {
           descricao: data.bebidas?.descricao || null,
           menu_cervejas: data.bebidas?.menu_cervejas || false,
           cervejas_artesanais: data.bebidas?.cervejas_artesanais || false,
           coqueteis_classicos: data.bebidas?.coqueteis_classicos || false,
           coqueteis_autorais: data.bebidas?.coqueteis_autorais || false,
           menu_vinhos: data.bebidas?.menu_vinhos || false,
         },
         cozinha: {
           descricao: data.cozinha?.descricao || null,
           serve_comida: data.cozinha?.serve_comida || false,
           opcoes_veganas: data.cozinha?.opcoes_veganas || false,
           opcoes_vegetarianas: data.cozinha?.opcoes_vegetarianas || false,
           opcoes_sem_gluten: data.cozinha?.opcoes_sem_gluten || false,
           opcoes_sem_lactose: data.cozinha?.opcoes_sem_lactose || false,
           menu_kids: data.cozinha?.menu_kids || false,
         },
         seguranca: {
           descricao: data.seguranca?.descricao || null,
           equipe_seguranca: data.seguranca?.equipe_seguranca || false,
           bombeiros_local: data.seguranca?.bombeiros_local || false,
           saidas_emergencia_sinalizadas: data.seguranca?.saidas_emergencia_sinalizadas || false,
         },
         acessibilidade: {
           descricao: data.acessibilidade?.descricao || null,
           elevador_acesso: data.acessibilidade?.elevador_acesso || false,
           rampa_cadeirantes: data.acessibilidade?.rampa_cadeirantes || false,
           banheiro_acessivel: data.acessibilidade?.banheiro_acessivel || false,
           cardapio_braille: data.acessibilidade?.cardapio_braille || false,
           audio_acessivel: data.acessibilidade?.audio_acessivel || false,
           area_caes_guia: data.acessibilidade?.area_caes_guia || false,
         },
         banheiros: {
           descricao: data.banheiros?.descricao || null,
           masculinos: data.banheiros?.masculinos || 0,
           femininos: data.banheiros?.femininos || 0,
           genero_neutro: data.banheiros?.genero_neutro || 0,
         },
        instagram: data.instagram === '' ? null : data.instagram,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        whatsapp: data.whatsapp === '' ? null : data.whatsapp,
        website: data.website === '' ? null : data.website,
        about: data.about || null,
        tags: data.tags || [],
        cover_url: data.cover_url || null,
        cover_alt: data.cover_alt || null,
        gallery_urls: data.gallery_urls || [],
        status: data.status || 'active',
      };

      console.log("Upserting venue - transformed data:", venueData);

      let result;
      if (data.id) {
        // Update existing venue
        const { data: updateResult, error } = await supabase
          .from("venues")
          .update(venueData)
          .eq("id", data.id)
          .select("*")
          .single();
        
        if (error) throw error;
        result = updateResult;
      } else {
        // Create new venue
        const { data: insertResult, error } = await supabase
          .from("venues")
          .insert(venueData)
          .select("*")
          .single();
        
        if (error) throw error;
        result = insertResult;
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
      toast.error(error.message || "Erro ao salvar local");
    },
  });
};

export const useUpsertOrganizer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrganizerForm) => {
      console.log("Upserting organizer:", data);

      const { data: result, error } = await supabase
        .from("organizers")
        .upsert(data, { 
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