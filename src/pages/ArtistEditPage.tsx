"use client";

import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminV3Guard } from "@/components/AdminV3Guard";
import { AdminV3Header } from "@/components/AdminV3Header";
import { AdminV3Breadcrumb } from "@/components/AdminV3Breadcrumb";
import { FormShell, FormSection, FORM_SECTIONS } from "@/components/form";
import { RHFInput, RHFTextarea, RHFSelect, RHFUpload, CountrySelect, RHFGenreSelect, InstagramField } from "@/components/form";
import ArtistSubtypeSelect from "@/components/fields/ArtistSubtypeSelect";
import { AgentesTagsInput } from "@/components/agentes/AgentesTagsInput";
import RHFSlug from "@/components/form/RHFSlug";
import { artistSchema, ArtistForm } from "@/schemas/agents";
import { useUpsertArtist } from "@/hooks/useUpsertAgents";
import { ARTIST_STATUS_OPTIONS, FEE_RANGES, SHOW_FORMATS } from "@/lib/form-constants";

export default function ArtistEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";
  
  const upsertArtist = useUpsertArtist();

  const { data: artist, isLoading } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const form = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      stage_name: "",
      artist_type: "",
      instagram: null,
      whatsapp: null,
      email: null,
      bio_short: null, // Changed from short_bio to bio_short
      avatar_url: null,
      status: "active",
      country: "BR",
      cities_active: [],
      availability_days: [],
      tags: [],
      links: {},
      image_rights_authorized: false,
      priority: 0,
    },
  });

  useEffect(() => {
    if (artist) {
      form.reset(artist);
    }
  }, [artist, form]);

  const handleSaveAndExit = async (data: ArtistForm) => {
    await upsertArtist.mutateAsync(data);
    navigate("/admin-v3/artistas");
  };

  if (isEditing && isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <AdminV3Guard>
      <AdminV3Header />
      <div className="container mx-auto py-6">
        <AdminV3Breadcrumb
          items={[
            { label: "Dashboard", path: "/admin-v3" },
            { label: "Artistas", path: "/admin-v3/artistas" },
            { label: isEditing ? "Editar Artista" : "Novo Artista" },
          ]}
        />

        <FormShell
          title={isEditing ? "Editar Artista" : "Novo Artista"}
          description="Complete as informações do artista"
          form={form}
          onSaveAndExit={handleSaveAndExit}
          backUrl="/admin-v3/artistas"
          isSubmitting={upsertArtist.isPending}
        >
          <div className="space-y-4">
            {/* Informações Básicas */}
            <FormSection
              id={FORM_SECTIONS.BASIC_INFO.id}
              title={FORM_SECTIONS.BASIC_INFO.title}
              description="Dados principais do artista"
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="stage_name"
                  label="Nome Artístico"
                  placeholder="Nome do artista"
                  required
                />
                <ArtistSubtypeSelect
                  name="artist_subtype"
                  placeholder="Selecione o tipo"
                />
                <RHFInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="email@exemplo.com"
                />
                <InstagramField
                  name="instagram"
                  label="Instagram"
                  placeholder="@usuario"
                  agentType="artist"
                />
                <RHFInput
                  name="whatsapp"
                  label="WhatsApp"
                  placeholder="(11) 99999-9999"
                />
                <RHFSelect
                  name="status"
                  label="Status"
                  placeholder="Selecione o status"
                  options={ARTIST_STATUS_OPTIONS}
                />
              </div>
              
              <RHFTextarea
                name="bio_short"
                label="Bio Curta"
                placeholder="Descrição breve do artista..."
                rows={4}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CountrySelect
                  name="country"
                  label="País"
                  placeholder="Selecione o país"
                />
                <RHFGenreSelect name="genres" />
              </div>
              
              <AgentesTagsInput
                name="tags"
                label="Tags"
                placeholder="Digite uma tag e pressione Enter"
                maxTags={10}
              />
            </FormSection>

            {/* Informações Profissionais */}
            <FormSection
              id="professional_info"
              title="Informações Profissionais"
              description="Dados sobre apresentações e cachê"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFSelect
                  name="fee_range"
                  label="Faixa de Cachê"
                  placeholder="Selecione a faixa"
                  options={FEE_RANGES}
                />
                <RHFSelect
                  name="show_format"
                  label="Formato do Show"
                  placeholder="Selecione o formato"
                  options={SHOW_FORMATS}
                />
                <RHFInput
                  name="team_size"
                  label="Tamanho da Equipe"
                  type="number"
                  placeholder="Ex: 3"
                />
                <RHFInput
                  name="set_time_minutes"
                  label="Tempo de Set (minutos)"
                  type="number"
                  placeholder="Ex: 60"
                />
              </div>
            </FormSection>

            {/* Contato e Booking */}
            <FormSection
              id="contact_info"
              title="Contato e Booking"
              description="Informações para contratação"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="booking_email"
                  label="Email para Booking"
                  type="email"
                  placeholder="booking@exemplo.com"
                />
                <RHFInput
                  name="booking_whatsapp"
                  label="WhatsApp para Booking"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </FormSection>

            {/* Links e Redes Sociais */}
            <FormSection
              id="social_links"
              title="Links e Redes Sociais"
              description="Perfis e plataformas do artista"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="website_url"
                  label="Website"
                  placeholder="https://..."
                />
                <RHFInput
                  name="spotify_url"
                  label="Spotify"
                  placeholder="https://spotify.com/..."
                />
                <RHFInput
                  name="soundcloud_url"
                  label="SoundCloud"
                  placeholder="https://soundcloud.com/..."
                />
                <RHFInput
                  name="youtube_url"
                  label="YouTube"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </FormSection>

            {/* Mídia */}
            <FormSection
              id={FORM_SECTIONS.MEDIA.id}
              title={FORM_SECTIONS.MEDIA.title}
              description="Fotos e imagens do artista"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFUpload
                  name="avatar_url"
                  bucket="artists"
                  label="Foto do Artista"
                  accept="image/*"
                />
                <RHFUpload
                  name="cover_image_url"
                  bucket="artists"
                  label="Imagem de Capa"
                  accept="image/*"
                />
              </div>
            </FormSection>
          </div>
        </FormShell>
      </div>
    </AdminV3Guard>
  );
}