import { useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, Save, Copy, UserX, Check, X, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

// Import form components
import { RHFInput, RHFTextarea, RHFSelect } from "@/components/form";
import CitySelectStable from "@/components/fields/CitySelectStable";
import ArtistSubtypeSelect from "@/components/fields/ArtistSubtypeSelect";
import OrganizerSubtypeSelect from "@/components/fields/OrganizerSubtypeSelect";
import VenueTypeSelect from "@/components/fields/VenueTypeSelect";
import StatusSelect from "@/components/fields/StatusSelect";
import { AgentesTagsInput } from "@/components/agentes/AgentesTagsInput";
import { AgentesLinksInput } from "@/components/agentes/AgentesLinksInput";
import { AgentesAvatarUpload } from "@/components/agentes/AgentesAvatarUpload";
import { useAgentesAutosave } from "@/hooks/useAgentesAutosave";
import { useAgentesSlugCheck } from "@/hooks/useAgentesSlugCheck";
import { useAgentesInstagramValidation } from "@/hooks/useAgentesInstagramValidation";

// Import schemas
import { artistSchema } from "@/schemas/artist";
import { organizerSchema } from "@/schemas/organizer";
import { venueSchema } from "@/schemas/venue";

interface AgentesFormProps {
  agentType: 'artistas' | 'organizadores' | 'locais';
  agentId?: string;
  onSuccess: () => void;
}

export function AgentesForm({ agentType, agentId, onSuccess }: AgentesFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!agentId;

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
      city: "",
      state: "",
      country: "BR",
      tags: [],
      links: {},
      bio: "",
      avatar_url: "",
      avatar_alt: "",
      status: "active",
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

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (agentData) {
      form.reset({
        ...agentData,
        instagram: agentData.instagram || "",
        tags: agentData.tags || [],
        links: agentData.links || {},
      });
    }
  }, [agentData, form]);

  // Gerar slug automaticamente baseado no nome
  const generateSlug = useCallback(
    useDebounce((name: string) => {
      if (!name || form.getValues("slug")) return;
      
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      form.setValue("slug", slug, { shouldValidate: true });
    }, 500),
    [form]
  );

  // Watch name changes to generate slug
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        generateSlug(value.name);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, generateSlug]);

  // Normalizar Instagram
  const normalizeInstagram = (value: string) => {
    return value.replace(/^@+/, "").toLowerCase().trim();
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        instagram: data.instagram ? normalizeInstagram(data.instagram) : null,
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from(tableName)
          .update(processedData)
          .eq("id", agentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert(processedData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? "Agente atualizado com sucesso!" : "Agente criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: [tableName] });
      onSuccess();
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
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>

              <RHFInput
                name="whatsapp"
                label="WhatsApp"
                placeholder="(11) 99999-9999"
              />
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
              <AgentesTagsInput name="tags" />
              
              <AgentesLinksInput name="links" />

              <RHFTextarea
                name="bio"
                label="Bio"
                placeholder="Descrição do agente"
                rows={4}
              />
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

            <div className="flex gap-4">
              <Button type="button" variant="outline" asChild>
                <Link to={getBackLink()}>
                  Cancelar
                </Link>
              </Button>
              
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {isEditing ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}