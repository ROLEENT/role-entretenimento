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
import { RHFInput, RHFTextarea, RHFSelect, RHFSelectAsync, RHFDateTime, RHFUpload, RHFLinks } from "@/components/form";
import RHFSlug from "@/components/form/RHFSlug";
import { eventSchema, EventForm } from "@/schemas/event";
import { useUpsertEvent } from "@/hooks/useUpsertEvent";

export default function EventEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";
  
  const upsertEvent = useUpsertEvent();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from("agenda_itens")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      slug: "",
      status: "draft",
      date_start: "",
      date_end: "",
      price_min: undefined,
      price_max: undefined,
      description: "",
      links: {},
      cover_url: "",
      seo_title: "",
      seo_description: "",
      city: "",
      venue_id: undefined,
      country: "Brasil",
      currency: "BRL",
      visibility: "public",
      highlight_type: "none",
      is_sponsored: false,
      genres: [],
      tags: [],
      gallery: [],
    },
  });

  useEffect(() => {
    if (event) {
      form.reset({
        ...event,
        date_start: event.starts_at ? new Date(event.starts_at).toISOString().slice(0, 16) : "",
        date_end: event.ends_at ? new Date(event.ends_at).toISOString().slice(0, 16) : "",
        // Map legacy field names to new schema
        start_utc: event.starts_at,
        end_utc: event.ends_at,
      });
    }
  }, [event, form]);

  const handleSaveDraft = async (data: EventForm) => {
    await upsertEvent.mutateAsync({ ...data, status: "draft" });
  };

  const handlePublish = async (data: EventForm) => {
    await upsertEvent.mutateAsync({ ...data, status: "published" });
  };

  const handleSaveAndExit = async (data: EventForm) => {
    await upsertEvent.mutateAsync(data);
    navigate("/admin-v3/agenda");
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
            { label: "Agenda", path: "/admin-v3/agenda" },
            { label: isEditing ? "Editar Evento" : "Novo Evento" },
          ]}
        />

        <FormShell
          title={isEditing ? "Editar Evento" : "Novo Evento"}
          description="Complete as informações do evento"
          form={form}
          onSaveDraft={handleSaveDraft}
          onPublish={handlePublish}
          onSaveAndExit={handleSaveAndExit}
          backUrl="/admin-v3/agenda"
          isDraft={form.watch("status") === "draft"}
          isSubmitting={upsertEvent.isPending}
        >
          <div className="space-y-4">
            {/* Informações Básicas */}
            <FormSection
              id={FORM_SECTIONS.BASIC_INFO.id}
              title={FORM_SECTIONS.BASIC_INFO.title}
              description={FORM_SECTIONS.BASIC_INFO.description}
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="title"
                  label="Título"
                  placeholder="Nome do evento"
                />
                <RHFSlug
                  name="slug"
                  label="Slug"
                  placeholder="url-do-evento"
                  table="agenda_itens"
                  currentId={event?.id}
                  generateFrom="title"
                />
                <RHFSelect
                  name="status"
                  label="Status"
                  options={[
                    { value: "draft", label: "Rascunho" },
                    { value: "published", label: "Publicado" },
                  ]}
                />
                <RHFTextarea
                  name="excerpt"
                  label="Resumo"
                  placeholder="Descrição curta do evento"
                  className="md:col-span-2"
                />
              </div>
            </FormSection>

            {/* Datas */}
            <FormSection
              id={FORM_SECTIONS.DATES.id}
              title={FORM_SECTIONS.DATES.title}
              description={FORM_SECTIONS.DATES.description}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFDateTime
                  name="date_start"
                  label="Data e Hora de Início"
                />
                <RHFDateTime
                  name="date_end"
                  label="Data e Hora de Fim"
                />
                <RHFInput
                  name="age_rating"
                  label="Classificação Etária"
                  placeholder="Ex: 18+"
                />
                <div className="grid grid-cols-2 gap-2">
                  <RHFInput
                    name="price_min"
                    label="Preço Mínimo"
                    type="number"
                    placeholder="0"
                  />
                  <RHFInput
                    name="price_max"
                    label="Preço Máximo"
                    type="number"
                    placeholder="100"
                  />
                </div>
              </div>
            </FormSection>

            {/* Local & Cidade */}
            <FormSection
              id={FORM_SECTIONS.LOCATION.id}
              title={FORM_SECTIONS.LOCATION.title}
              description={FORM_SECTIONS.LOCATION.description}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFSelectAsync
                  name="city_id"
                  label="Cidade"
                  query={{ table: "cities", fields: "id,name,uf", orderBy: "name" }}
                  mapRow={(r) => ({ value: String(r.id), label: `${r.name} - ${r.uf}` })}
                  placeholder="Selecione a cidade"
                />
                <RHFSelectAsync
                  name="venue_id"
                  label="Local"
                  query={{ table: "venues", fields: "id,name", orderBy: "name" }}
                  mapRow={(r) => ({ value: String(r.id), label: r.name })}
                  placeholder="Selecione o local"
                />
                <RHFSelectAsync
                  name="organizer_id"
                  label="Organizador"
                  query={{ table: "organizers", fields: "id,name", orderBy: "name" }}
                  mapRow={(r) => ({ value: String(r.id), label: r.name })}
                  placeholder="Selecione o organizador"
                />
              </div>
            </FormSection>

            {/* Conteúdo & Links */}
            <FormSection
              id={FORM_SECTIONS.CONTENT.id}
              title={FORM_SECTIONS.CONTENT.title}
              description={FORM_SECTIONS.CONTENT.description}
            >
              <div className="space-y-4">
                <RHFTextarea
                  name="content"
                  label="Descrição Completa"
                  placeholder="Descrição detalhada do evento..."
                  rows={6}
                />
                <RHFLinks
                  name="links"
                  label="Links Relacionados"
                />
              </div>
            </FormSection>

            {/* Mídia */}
            <FormSection
              id={FORM_SECTIONS.MEDIA.id}
              title={FORM_SECTIONS.MEDIA.title}
              description={FORM_SECTIONS.MEDIA.description}
            >
              <div className="space-y-4">
                <RHFUpload
                  name="cover_url"
                  bucket="agenda-images"
                  label="Imagem de Capa"
                  accept="image/*"
                />
              </div>
            </FormSection>

            {/* SEO */}
            <FormSection
              id={FORM_SECTIONS.SEO.id}
              title={FORM_SECTIONS.SEO.title}
              description={FORM_SECTIONS.SEO.description}
            >
              <div className="space-y-4">
                <RHFInput
                  name="seo_title"
                  label="Meta Título"
                  placeholder="Título para SEO (máx. 60 caracteres)"
                />
                <RHFTextarea
                  name="seo_description"
                  label="Meta Descrição"
                  placeholder="Descrição para SEO (máx. 160 caracteres)"
                  rows={3}
                />
              </div>
            </FormSection>
          </div>
        </FormShell>
      </div>
    </AdminV3Guard>
  );
}