"use client";
import { useEffect, useCallback, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, Save, Copy, UserX, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import ActionBar from "@/components/ui/action-bar";

// Import form components
import { RHFInput, RHFTextarea, RHFSelect } from "@/components/form";
import RHFComboboxRemote from "@/components/rhf/RHFComboboxRemote";
import CitySelectStable from "@/components/fields/CitySelectStable";
import ArtistSubtypeSelect from "@/components/fields/ArtistSubtypeSelect";
import OrganizerSubtypeSelect from "@/components/fields/OrganizerSubtypeSelect";
import VenueTypeSelect from "@/components/fields/VenueTypeSelect";
import StatusSelect from "@/components/fields/StatusSelect";
import { AgentesTagsInput } from "@/components/agentes/AgentesTagsInput";
import { AgentesLinksInput } from "@/components/agentes/AgentesLinksInput";
import { AgentesAvatarUpload } from "@/components/agentes/AgentesAvatarUpload";
import { OrganizerBillingFields } from "@/components/agentes/OrganizerBillingFields";
import { OrganizerLinksFields } from "@/components/agentes/OrganizerLinksFields";
import { VenueAddressFields } from "@/components/agentes/VenueAddressFields";
import { VenueAmenitiesFields } from "@/components/agentes/VenueAmenitiesFields";
import { VenueOpeningHoursFields } from "@/components/agentes/VenueOpeningHoursFields";
import { VenueGalleryField } from "@/components/agentes/VenueGalleryField";
import { ImageUpload } from "@/components/ui/image-upload";
import { useAgentesAutosave } from "@/hooks/useAgentesAutosave";
import { useAgentesSlugCheck } from "@/hooks/useAgentesSlugCheck";
import { useAgentesInstagramValidation } from "@/hooks/useAgentesInstagramValidation";

// Import schemas
import { artistSchema } from "@/schemas/artist";
import { organizerSchema } from "@/schemas/organizer";
import { venueSchema } from "@/schemas/venue";
import { useArtistTypesOptions } from "@/hooks/useArtistTypesOptions";
import { useGenresOptions } from "@/hooks/useGenresOptions";
import { syncArtistTypes, syncArtistGenres, getArtistTypes, getArtistGenres } from "@/utils/artistPivotSync";

interface AgentesFormProps {
  agentType: 'artistas' | 'organizadores' | 'locais';
  agentId?: string;
  onSuccess: () => void;
}

export function AgentesForm({ agentType, agentId, onSuccess }: AgentesFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!agentId;
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [nextAction, setNextAction] = useState<'save' | 'saveAndCreate' | 'saveDraft'>('save');

  // Hooks para artist types e genres (apenas para artistas)
  const { searchArtistTypes, createArtistType } = useArtistTypesOptions();
  const { searchGenres, createGenre } = useGenresOptions();

  // Determinar schema baseado no tipo
  const getSchema = () => {
    switch (agentType) {
      case 'artistas': return artistSchema;
      case 'organizadores': return organizerSchema;
      case 'locais': return venueSchema;
      default: return artistSchema;
    }
  };

  // Determinar tabela baseado no tipo
  const getTableName = () => {
    switch (agentType) {
      case 'artistas': return 'artists';
      case 'organizadores': return 'organizers';
      case 'locais': return 'venues';
      default: return 'artists';
    }
  };

  const schema = getSchema();
  const tableName = getTableName();

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      instagram: "",
      email: "",
      phone: "",
      whatsapp: "",
      city: "",
      state: "",
      country: "BR",
      bio: "",
      website: "",
      avatar_url: "",
      avatar_alt: "",
      status: "active",
      // Campos de venue específicos
      address_line: "",
      district: "",
      postal_code: "",
      latitude: undefined,
      longitude: undefined,
      capacity: undefined,
      amenities: {},
      opening_hours: {},
      about: "",
      cover_url: "",
      cover_alt: "",
      gallery_urls: [],
      tags: [],
      // Organizador específico
      invoice_name: "",
      tax_id: "",
      invoice_email: "",
      pix_key: "",
      bank: {
        bank: "",
        agency: "",
        account: "",
        type: "",
        },
        links: {},
        // Campos específicos para artistas
        artist_type_id: null,
        genre_ids: [],
      },
    });

  // Watch form data for autosave
  const watchedData = useWatch({ control: form.control });
  const slugValue = useWatch({ control: form.control, name: "slug" });
  const instagramValue = useWatch({ control: form.control, name: "instagram" });

  // Custom hooks
  const { isAutosaving } = useAgentesAutosave({
    data: watchedData,
    agentId,
    tableName,
    isEditing,
    enabled: form.formState.isDirty,
    agentType,
  });

  const { isCheckingSlug, slugStatus } = useAgentesSlugCheck({
    slug: slugValue,
    agentId,
    tableName,
    enabled: !!slugValue && slugValue.length > 2,
  });

  const { isValidatingInstagram, instagramStatus } = useAgentesInstagramValidation({
    instagram: instagramValue,
    agentType: agentType === 'artistas' ? 'artist' : agentType === 'organizadores' ? 'organizer' : 'venue',
    agentId,
    enabled: !!instagramValue && instagramValue.length > 2,
  });

  // Buscar dados para edição
  const { data: agentData, isLoading: isLoadingAgent } = useQuery({
    queryKey: [tableName, agentId],
    queryFn: async () => {
      if (!agentId) return null;
      
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", agentId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Buscar artist types e genres para artistas em edição
  const { data: artistTypesData } = useQuery({
    queryKey: ['artist-types', agentId],
    queryFn: () => getArtistTypes(agentId!),
    enabled: isEditing && agentType === 'artistas',
  });

  const { data: genresData } = useQuery({
    queryKey: ['artist-genres', agentId],
    queryFn: () => getArtistGenres(agentId!),
    enabled: isEditing && agentType === 'artistas',
  });

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (agentData) {
      const formData = {
        ...agentData,
        instagram: agentData.instagram || "",
        tags: agentData.tags || [],
        links: agentData.links || {},
      };

      // Adicionar artist types e genres se for artista
      if (agentType === 'artistas') {
        formData.artist_type_id = artistTypesData?.[0]?.id || null;
        formData.genre_ids = genresData?.map(genre => genre.id) || [];
      }

      form.reset(formData);
    }
  }, [agentData, artistTypesData, genresData, form, agentType]);

  // Gerar slug automaticamente baseado no nome
  const generateSlug = useCallback((name: string) => {
    if (!name || form.getValues("slug")) return;
    
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    
    form.setValue("slug", slug, { shouldValidate: true });
  }, [form]);

  // Watch name changes to generate slug
  const debouncedGenerateSlug = useDebouncedCallback(generateSlug, 500);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        debouncedGenerateSlug(value.name);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, debouncedGenerateSlug]);

  // Normalizar Instagram
  const normalizeInstagram = (value: string) => {
    return value.replace(/^@+/, "").toLowerCase().trim();
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { artist_type_id, genre_ids, ...agentData } = data;
      
      const processedData = {
        ...agentData,
        instagram: agentData.instagram ? normalizeInstagram(agentData.instagram) : null,
        updated_at: new Date().toISOString(),
      };

      let savedAgentId = agentId;

      if (isEditing) {
        const { error } = await supabase
          .from(tableName)
          .update(processedData)
          .eq("id", agentId);
        if (error) throw error;
      } else {
        const { data: insertedData, error } = await supabase
          .from(tableName)
          .insert(processedData)
          .select('id')
          .single();
        if (error) throw error;
        savedAgentId = insertedData.id;
      }

      // Sincronizar pivôs apenas para artistas
      if (agentType === 'artistas' && savedAgentId) {
        if (artist_type_id) {
          await syncArtistTypes(savedAgentId, [artist_type_id]);
        }
        if (genre_ids && genre_ids.length > 0) {
          await syncArtistGenres(savedAgentId, genre_ids);
        }
      }

      return savedAgentId;
    },
    onSuccess: () => {
      setLastSavedAt(new Date());
      if (nextAction === 'saveAndCreate') {
        // Reset form and stay on page
        form.reset();
        setLastSavedAt(null);
        toast.success(`Agente criado com sucesso! Formulário limpo para novo cadastro.`);
      } else if (nextAction === 'saveDraft') {
        toast.success(`Rascunho salvo com sucesso!`);
      } else {
        toast.success(isEditing ? "Agente atualizado com sucesso!" : "Agente criado com sucesso!");
        onSuccess();
      }
      setNextAction('save');
      queryClient.invalidateQueries({ queryKey: [tableName] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar agente");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (data: any) => {
      const duplicateData = {
        ...data,
        name: `${data.name} (Cópia)`,
        slug: `${data.slug}-copy-${Date.now()}`,
        instagram: null, // Clear instagram to avoid duplicates
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const { error } = await supabase
        .from(tableName)
        .insert(duplicateData);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agente duplicado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [tableName] });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao duplicar agente");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from(tableName)
        .update({ status: "inactive", updated_at: new Date().toISOString() })
        .eq("id", agentId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agente inativado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [tableName] });
      form.setValue("status", "inactive");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao inativar agente");
    },
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  const handleDuplicate = () => {
    if (!agentData) return;
    duplicateMutation.mutate(agentData);
  };

  const handleDeactivate = () => {
    if (!agentId) return;
    deactivateMutation.mutate();
  };

  if (isLoadingAgent) {
    return <LoadingSpinner />;
  }

  const getBackLink = () => {
    return `/admin-v3/agentes/${agentType}`;
  };

  const getSlugStatusIcon = () => {
    if (isCheckingSlug) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (slugStatus === "available") return <Check className="h-4 w-4 text-green-500" />;
    if (slugStatus === "taken") return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getInstagramStatusIcon = () => {
    if (isValidatingInstagram) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (instagramStatus === "available") return <Check className="h-4 w-4 text-green-500" />;
    if (instagramStatus === "taken") return <X className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={getBackLink()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isAutosaving && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando rascunho...
            </>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="relative overflow-visible">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 overflow-visible">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RHFInput
                  name="name"
                  label="Nome"
                  placeholder="Digite o nome"
                  required
                />
                
                <div className="relative">
                  <RHFInput
                    name="slug"
                    label="Slug"
                    placeholder="sera-gerado-automaticamente"
                    description="URL amigável. Será gerado automaticamente se não preenchido."
                  />
                  <div className="absolute right-3 top-8">
                    {getSlugStatusIcon()}
                  </div>
                </div>
              </div>

              {agentType === 'artistas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RHFComboboxRemote
                    name="artist_type_id"
                    label="Tipo de artista"
                    table="artist_types"
                    labelField="name"
                    searchField="name"
                    where={{ active: true }}
                    placeholder="Selecione o tipo de artista"
                    onCreateClick={async (searchTerm) => {
                      try {
                        console.log("[artist-types] Creating new:", searchTerm);
                        const { data, error } = await supabase
                          .from('artist_types')
                          .insert({ name: searchTerm, active: true })
                          .select('id, name')
                          .single();
                        
                        if (error) throw error;
                        
                        // Update the form value with the new artist type
                        form.setValue('artist_type_id', data.id);
                        console.log("[artist-types] Created:", data);
                      } catch (error) {
                        console.error("[artist-types] Error creating:", error);
                        throw error;
                      }
                    }}
                  />
                  
                  <RHFComboboxRemote
                    name="genre_ids"
                    label="Gêneros musicais"
                    table="genres"
                    labelField="name"
                    searchField="name"
                    where={{ active: true }}
                    multiple
                    placeholder="Selecione os gêneros"
                    onCreateClick={async (searchTerm) => {
                      try {
                        console.log("[genres] Creating new:", searchTerm);
                        const { data, error } = await supabase
                          .from('genres')
                          .insert({ name: searchTerm, active: true })
                          .select('id, name')
                          .single();
                        
                        if (error) throw error;
                        
                        // Add the new genre to the current selection
                        const currentGenres = form.getValues('genre_ids') || [];
                        form.setValue('genre_ids', [...currentGenres, data.id]);
                        console.log("[genres] Created:", data);
                      } catch (error) {
                        console.error("[genres] Error creating:", error);
                        throw error;
                      }
                    }}
                  />
                </div>
              )}

              {agentType === 'artistas' && (
                <ArtistSubtypeSelect name="artist_type" />
              )}

              {agentType === 'organizadores' && (
                <OrganizerSubtypeSelect name="type" />
              )}

              {agentType === 'locais' && (
                <VenueTypeSelect name="type" />
              )}

              <StatusSelect name="status" />
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <RHFInput
                  name="instagram"
                  label="Instagram"
                  placeholder="usuario (sem @)"
                  description="Digite apenas o nome de usuário, sem o @"
                />
                <div className="absolute right-3 top-8">
                  {getInstagramStatusIcon()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RHFInput
                  name="email"
                  label="E-mail"
                  type="email"
                  placeholder="contato@exemplo.com"
                />
                
                <RHFInput
                  name="phone"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                />

                <RHFInput
                  name="whatsapp"
                  label="WhatsApp"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {agentType === 'organizadores' && (
                <RHFInput
                  name="website"
                  label="Website"
                  type="url"
                  placeholder="https://meusite.com"
                />
              )}
            </CardContent>
          </Card>

          {/* Localização */}
          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CitySelectStable name="city" />
                <RHFInput
                  name="state"
                  label="Estado"
                  placeholder="SP"
                />
                <RHFSelect
                  name="country"
                  label="País"
                  options={[
                    { value: "BR", label: "Brasil" },
                    { value: "AR", label: "Argentina" },
                    { value: "UY", label: "Uruguai" },
                    { value: "PY", label: "Paraguai" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo */}
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <RHFTextarea
                name="bio"
                label="Sobre"
                placeholder="Descrição do organizador, história, missão e valores"
                rows={4}
              />

              {agentType === 'organizadores' && (
                <>
                  {/* Faturamento - só para organizadores */}
                  <OrganizerBillingFields />
                  
                  {/* Links extras - só para organizadores */}
                  <OrganizerLinksFields />
                </>
              )}

              {agentType === 'locais' && (
                <>
                  {/* Campos específicos para venues */}
                  <VenueAddressFields />
                  
                  <RHFInput
                    name="capacity"
                    label="Capacidade"
                    type="number"
                    placeholder="Número de pessoas"
                  />

                  <VenueAmenitiesFields />
                  <VenueOpeningHoursFields />

                  {/* Imagem de capa */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium">Imagem de Capa</label>
                    <ImageUpload
                      value={form.watch("cover_url") as string}
                      onChange={(url) => {
                        form.setValue("cover_url", url, { shouldDirty: true });
                        if (!url) {
                          form.setValue("cover_alt", "", { shouldDirty: true });
                        }
                      }}
                      onRemove={() => {
                        form.setValue("cover_url", "", { shouldDirty: true });
                        form.setValue("cover_alt", "", { shouldDirty: true });
                      }}
                      bucket="venues"
                    />

                    {form.watch("cover_url") && (
                      <RHFInput
                        name="cover_alt"
                        label="Texto alternativo da capa"
                        placeholder="Descreva a imagem para acessibilidade"
                        required
                      />
                    )}
                  </div>

                  <VenueGalleryField />
                </>
              )}

              {agentType !== 'organizadores' && agentType !== 'locais' && (
                <>
                  <AgentesTagsInput name="tags" />
                  <AgentesLinksInput name="links" />
                </>
              )}
            </CardContent>
          </Card>

          {/* Avatar */}
          <Card>
            <CardHeader>
              <CardTitle>Avatar</CardTitle>
            </CardHeader>
            <CardContent>
              <AgentesAvatarUpload />
            </CardContent>
          </Card>

          {/* Ações */}
          <div className="flex justify-between">
            <div className="flex gap-4">
              {isEditing && (
                <>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleDuplicate}
                    disabled={duplicateMutation.isPending}
                  >
                    {duplicateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    Duplicar
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="destructive"
                    onClick={handleDeactivate}
                    disabled={deactivateMutation.isPending || form.getValues("status") === "inactive"}
                  >
                    {deactivateMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserX className="mr-2 h-4 w-4" />
                    )}
                    Inativar
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </Form>

      {/* Fixed Action Bar */}
      <ActionBar
        isVisible={true}
        isSubmitting={saveMutation.isPending}
        isSaving={isAutosaving}
        lastSavedAt={lastSavedAt}
        onSave={() => {
          setNextAction('save');
          form.handleSubmit(onSubmit)();
        }}
        onSaveAndCreate={!isEditing ? () => {
          setNextAction('saveAndCreate');
          form.handleSubmit(onSubmit)();
        } : undefined}
        onSaveDraft={() => {
          setNextAction('saveDraft');
          form.handleSubmit(onSubmit)();
        }}
      />

      {/* Bottom padding to account for fixed ActionBar */}
      <div className="h-24" />
    </div>
  );
}