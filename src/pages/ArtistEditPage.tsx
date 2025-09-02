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
import { RHFInput, RHFTextarea, RHFSelectAsync, RHFUpload, ArtistLocationFields } from "@/components/form";
import RHFSlug from "@/components/form/RHFSlug";
import { artistSchema, ArtistForm } from "@/schemas/agents";
import { useUpsertArtist } from "@/hooks/useUpsertAgents";

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
                />
                <RHFInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="email@exemplo.com"
                />
                <RHFInput
                  name="instagram"
                  label="Instagram"
                  placeholder="@usuario"
                />
                <RHFInput
                  name="whatsapp"
                  label="WhatsApp"
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <RHFTextarea
                name="short_bio"
                label="Bio Curta"
                placeholder="Descrição breve do artista..."
                rows={4}
              />
              
              <ArtistLocationFields />
            </FormSection>

            {/* Mídia */}
            <FormSection
              id={FORM_SECTIONS.MEDIA.id}
              title={FORM_SECTIONS.MEDIA.title}
              description="Fotos e imagens do artista"
            >
              <RHFUpload
                name="avatar_url"
                bucket="artists"
                label="Foto do Artista"
                accept="image/*"
              />
            </FormSection>
          </div>
        </FormShell>
      </div>
    </AdminV3Guard>
  );
}