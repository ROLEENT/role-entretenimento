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
import { RHFInput, RHFUpload } from "@/components/form";
import RHFSlug from "@/components/form/RHFSlug";
import { organizerFlexibleSchema, OrganizerFlexibleForm } from "@/schemas/agents-flexible";
import { useUpsertOrganizer } from "@/hooks/useUpsertAgents";

export default function OrganizerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== "novo";
  
  const upsertOrganizer = useUpsertOrganizer();

  const { data: organizer, isLoading } = useQuery({
    queryKey: ["organizer", id],
    queryFn: async () => {
      if (!isEditing) return null;
      
      const { data, error } = await supabase
        .from("organizers")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const form = useForm<OrganizerFlexibleForm>({
    resolver: zodResolver(organizerFlexibleSchema),
    defaultValues: {
      name: "",
      slug: "",
      site: null,
      email: null,
      phone: null,
      avatar_url: null,
      status: "active",
    },
  });

  useEffect(() => {
    if (organizer) {
      form.reset(organizer);
    }
  }, [organizer, form]);

  const handleSaveAndExit = async (data: OrganizerFlexibleForm) => {
    await upsertOrganizer.mutateAsync(data);
    navigate("/admin-v3/organizadores");
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
            { label: "Organizadores", path: "/admin-v3/organizadores" },
            { label: isEditing ? "Editar Organizador" : "Novo Organizador" },
          ]}
        />

        <FormShell
          title={isEditing ? "Editar Organizador" : "Novo Organizador"}
          description="Complete as informações do organizador"
          form={form}
          onSaveAndExit={handleSaveAndExit}
          backUrl="/admin-v3/organizadores"
          isSubmitting={upsertOrganizer.isPending}
        >
          <div className="space-y-4">
            {/* Informações Básicas */}
            <FormSection
              id={FORM_SECTIONS.BASIC_INFO.id}
              title={FORM_SECTIONS.BASIC_INFO.title}
              description="Dados principais do organizador"
              defaultOpen={true}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="name"
                  label="Nome"
                  placeholder="Nome do organizador"
                />
                <RHFSlug
                  name="slug"
                  label="Slug"
                  placeholder="nome-organizador"
                  table="organizers"
                  currentId={organizer?.id}
                  generateFrom="name"
                />
                <RHFInput
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="contato@organizador.com"
                />
                <RHFInput
                  name="phone"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                />
                <RHFInput
                  name="site"
                  label="Website"
                  placeholder="https://organizador.com"
                  className="md:col-span-2"
                />
              </div>
            </FormSection>

            {/* Mídia */}
            <FormSection
              id={FORM_SECTIONS.MEDIA.id}
              title={FORM_SECTIONS.MEDIA.title}
              description="Logo e imagens do organizador"
            >
              <RHFUpload
                name="avatar_url"
                bucket="organizers"
                label="Logo do Organizador"
                accept="image/*"
              />
            </FormSection>
          </div>
        </FormShell>
      </div>
    </AdminV3Guard>
  );
}