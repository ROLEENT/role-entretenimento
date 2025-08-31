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
import { RHFInput, RHFSelect, RHFSelectAsync, RHFUpload } from "@/components/form";
import RHFSlug from "@/components/form/RHFSlug";
import { venueSchema, VenueForm } from "@/schemas/agents";
import { useUpsertVenue } from "@/hooks/useUpsertAgents";

export default function VenueEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";
  
  const upsertVenue = useUpsertVenue();

  const { data: venue, isLoading } = useQuery({
    queryKey: ["venue", id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const form = useForm<VenueForm>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: "",
      slug: "",
      city_id: "",
      venue_type: "house",
      address: null,
      website: null,
      capacity: null,
      email: null,
      phone: null,
      cover_url: null,
      status: "active",
    },
  });

  useEffect(() => {
    if (venue) {
      form.reset(venue);
    }
  }, [venue, form]);

  const handleSaveAndExit = async (data: VenueForm) => {
    await upsertVenue.mutateAsync(data);
    navigate("/admin-v3/locais");
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
            { label: "Locais", path: "/admin-v3/locais" },
            { label: isEditing ? "Editar Local" : "Novo Local" },
          ]}
        />

        <FormShell
          title={isEditing ? "Editar Local" : "Novo Local"}
          description="Complete as informações do local"
          form={form}
          onSaveAndExit={handleSaveAndExit}
          backUrl="/admin-v3/locais"
          isSubmitting={upsertVenue.isPending}
        >
          <div className="space-y-4">
            {/* Informações Básicas */}
            <FormSection
              id={FORM_SECTIONS.BASIC_INFO.id}
              title={FORM_SECTIONS.BASIC_INFO.title}
              description="Dados principais do local"
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="name"
                  label="Nome"
                  placeholder="Nome do local"
                />
                <RHFSlug
                  name="slug"
                  label="Slug"
                  placeholder="nome-do-local"
                  table="venues"
                  currentId={venue?.id}
                  generateFrom="name"
                />
                <RHFSelectAsync
                  name="city_id"
                  label="Cidade"
                  query={{ table: "cities", fields: "id,name,uf", orderBy: "name" }}
                  mapRow={(r) => ({ value: String(r.id), label: `${r.name} - ${r.uf}` })}
                  placeholder="Selecione a cidade"
                />
                <RHFSelect
                  name="venue_type"
                  label="Tipo de Local"
                  options={[
                    { value: "house", label: "Casa de Show" },
                    { value: "theater", label: "Teatro" },
                    { value: "club", label: "Clube" },
                    { value: "arena", label: "Arena" },
                    { value: "outro", label: "Outro" },
                  ]}
                />
                <RHFInput
                  name="capacity"
                  label="Capacidade"
                  type="number"
                  placeholder="1000"
                />
              </div>
            </FormSection>

            {/* Local & Endereço */}
            <FormSection
              id={FORM_SECTIONS.LOCATION.id}
              title={FORM_SECTIONS.LOCATION.title}
              description="Endereço e localização"
            >
              <div className="grid grid-cols-1 gap-4">
                <RHFInput
                  name="address"
                  label="Endereço"
                  placeholder="Rua, número, bairro"
                />
              </div>
            </FormSection>

            {/* Contato */}
            <FormSection
              id="contact"
              title="Contato"
              description="Informações de contato"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="contato@local.com"
                />
                <RHFInput
                  name="phone"
                  label="Telefone"
                  placeholder="(11) 3333-4444"
                />
                <RHFInput
                  name="website"
                  label="Website"
                  placeholder="https://local.com"
                  className="md:col-span-2"
                />
              </div>
            </FormSection>

            {/* Mídia */}
            <FormSection
              id={FORM_SECTIONS.MEDIA.id}
              title={FORM_SECTIONS.MEDIA.title}
              description="Fotos do local"
            >
              <RHFUpload
                name="cover_url"
                bucket="venues"
                label="Foto do Local"
                accept="image/*"
              />
            </FormSection>
          </div>
        </FormShell>
      </div>
    </AdminV3Guard>
  );
}