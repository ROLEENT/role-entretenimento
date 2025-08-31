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
import { ArrowLeft, Save, Copy, UserX, Check, X, Loader2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import ActionBar from "@/components/ui/action-bar";

// Import form components
import { RHFInput, RHFTextarea, RHFSelect, RHFPhoneInput, RHFSlugInput } from "@/components/form";
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
import { useAutosave } from "@/hooks/useAutosave";
import { useAgentesSlugCheck } from "@/hooks/useAgentesSlugCheck";
import { useAgentesInstagramValidation } from "@/hooks/useAgentesInstagramValidation";

// Import schemas
import { artistSchema } from "@/schemas/artist";
import { organizerSchema } from "@/schemas/organizer";
import { venueSchema } from "@/schemas/venue";
import { useArtistTypesOptions } from "@/hooks/useArtistTypesOptions";
import { useGenresOptions } from "@/hooks/useGenresOptions";
import { syncArtistTypes, syncArtistGenres, getArtistTypes, getArtistGenres } from "@/utils/artistPivotSync";
import { normalizePhone, normalizeInstagram } from "@/utils/formatters";
import { generateSlug } from "@/utils/slugUtils";

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
  const [slugLocked, setSlugLocked] = useState(false);

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
    mode: "onBlur", // Enable onBlur validation for autosave
    reValidateMode: "onChange", // Re-validate on change after first validation
    defaultValues: {
      name: "",
      slug: "",
      artist_type_id: "",
      genre_ids: [],
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
    },
  });

  // Watch form fields for autosave and slug generation
  const watchedData = useWatch({ control: form.control });
  const nameValue = useWatch({ control: form.control, name: "name" });
  const slugValue = useWatch({ control: form.control, name: "slug" });
  const instagramValue = useWatch({ control: form.control, name: "instagram" });

  // Auto-generate slug from name when name changes (only if not locked)
  useEffect(() => {
    if (!slugLocked && nameValue) {
      const newSlug = generateSlug(nameValue);
      if (newSlug !== slugValue) {
        form.setValue("slug", newSlug, { shouldDirty: true });
      }
    }
  }, [nameValue, slugLocked, form, slugValue]);

  // Function to regenerate slug manually
  const regenerateSlug = useCallback(() => {
    if (nameValue) {
      const newSlug = generateSlug(nameValue);
      form.setValue("slug", newSlug, { shouldDirty: true });
      setSlugLocked(false); // Unlock when regenerating
    }
  }, [nameValue, form]);

  // Function to handle manual slug edit
  const handleSlugEdit = useCallback(() => {
    setSlugLocked(true);
  }, []);

  // Custom autosave hook
  const { isAutosaving, hasError, lastSavedAt: autosaveLastSavedAt, handleFieldBlur, performSave } = useAutosave(
    watchedData,
    {
      enabled: isEditing && form.formState.isDirty,
      delay: 10000, // 10 seconds
      onSave: async () => {
        const data = form.getValues();
        await saveMutation.mutateAsync(data);
      },
      onSaveSuccess: () => {
        setLastSavedAt(new Date());
      },
      onSaveError: (error) => {
        console.error('Autosave error:', error);
      },
    }
  );

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


  // Normalize data before submit
  const normalizeSubmitData = (data: any) => ({
    ...data,
    phone: normalizePhone(data.phone || ''),
    whatsapp: normalizePhone(data.whatsapp || ''),
    instagram: normalizeInstagram(data.instagram || ''),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { artist_type_id, genre_ids, ...agentData } = normalizeSubmitData(data);
      
      const processedData = {
        ...agentData,
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

  // Event handlers
  const onSubmit = async (data: any) => {
    try {
      await saveMutation.mutateAsync(data);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Focus on the first field with error after validation runs
      setTimeout(() => {
        const firstErrorField = Object.keys(form.formState.errors)[0];
        if (firstErrorField) {
          const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
          if (element) {
            element.focus();
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);
    }
  };

  const handleDuplicate = () => {
    if (!agentData) return;
    duplicateMutation.mutate(agentData);
  };

  const handleDeactivate = () => {
    if (!agentId) return;
    deactivateMutation.mutate();
  };

  // Handle form submission with validation
  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    console.log('Validation errors:', errors);
    
    // Focus on first error field
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

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
        <form 
          onSubmit={handleFormSubmit}
          onBlur={() => {
            // Trigger autosave on any field blur
            if (isEditing && form.formState.isDirty) {
              // This will be handled by the individual field blur events
            }
          }}
          className="space-y-6"
        >
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
                
                <RHFSlugInput
                  name="slug"
                  label="Slug"
                  placeholder="sera-gerado-automaticamente"
                  description="URL amigável. Gerado automaticamente a partir do nome."
                  locked={slugLocked}
                  statusIcon={getSlugStatusIcon()}
                  onRegenerate={regenerateSlug}
                  onEdit={handleSlugEdit}
                  regenerateDisabled={!nameValue}
                />
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
                    createButtonText="Tipo de Artista"
                    createDialogTitle="Criar Novo Tipo de Artista"
                    createDialogDescription="Adicione um novo tipo de artista à lista."
                    createFieldLabel="Nome do Tipo"
                    createFieldPlaceholder="Ex: DJ, Banda, Solo..."
                    onCreateClick={async (searchTerm) => {
                      try {
                        console.log("[artist-types] Creating new:", searchTerm);
                        const { data, error } = await supabase
                          .from('artist_types')
                          .insert({ name: searchTerm, active: true })
                          .select('id, name')
                          .single();
                        
                        if (error) throw error;
                        
                        console.log("[artist-types] Created:", data);
                        return data;
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
                    createButtonText="Gênero"
                    createDialogTitle="Criar Novo Gênero Musical"
                    createDialogDescription="Adicione um novo gênero musical à lista."
                    createFieldLabel="Nome do Gênero"
                    createFieldPlaceholder="Ex: House, Techno, Rock..."
                    onCreateClick={async (searchTerm) => {
                      try {
                        console.log("[genres] Creating new:", searchTerm);
                        const { data, error } = await supabase
                          .from('genres')
                          .insert({ name: searchTerm, active: true })
                          .select('id, name')
                          .single();
                        
                        if (error) throw error;
                        
                        console.log("[genres] Created:", data);
                        return data;
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
                  description={
                    instagramStatus === "taken" 
                      ? "⚠️ Este Instagram já está em uso por outro agente"
                      : "Digite apenas o nome de usuário, sem o @"
                  }
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
                
                <RHFPhoneInput
                  name="phone"
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                />

                <RHFPhoneInput
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
        hasError={hasError}
        lastSavedAt={autosaveLastSavedAt || lastSavedAt}
        onSave={() => {
          setNextAction('save');
          handleFormSubmit();
        }}
        onSaveAndCreate={!isEditing ? () => {
          setNextAction('saveAndCreate');
          handleFormSubmit();
        } : undefined}
        onSaveDraft={() => {
          setNextAction('saveDraft');
          handleFormSubmit();
        }}
        onRetry={performSave}
      />

      {/* Bottom padding to account for fixed ActionBar */}
      <div className="h-24" />
    </div>
  );
}