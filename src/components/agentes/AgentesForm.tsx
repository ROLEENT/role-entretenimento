import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";

// Import form components
import { RHFInput, RHFTextarea, RHFSelect } from "@/components/form";
import CitySelectStable from "@/components/fields/CitySelectStable";
import ArtistSubtypeSelect from "@/components/fields/ArtistSubtypeSelect";
import OrganizerSubtypeSelect from "@/components/fields/OrganizerSubtypeSelect";
import VenueTypeSelect from "@/components/fields/VenueTypeSelect";
import StatusSelect from "@/components/fields/StatusSelect";

// Import schemas
import { artistSchema } from "@/schemas/agents";
import { organizerSchema as organizerFormSchema } from "@/lib/organizerSchema";
import { venueSchema as venueFormSchema } from "@/lib/venueSchema";

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
      case 'organizadores': return organizerFormSchema;
      case 'locais': return venueFormSchema;
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
    defaultValues: {},
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
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Preencher formulário quando dados carregarem
  useEffect(() => {
    if (agentData) {
      form.reset(agentData);
    }
  }, [agentData, form]);

  // Mutação para salvar
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) {
        const { error } = await supabase
          .from(tableName)
          .update(data)
          .eq("id", agentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert(data);
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

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  if (isLoadingAgent) {
    return <LoadingSpinner />;
  }

  const getBackLink = () => {
    return `/admin-v3/agentes/${agentType}`;
  };

  const renderFormFields = () => {
    switch (agentType) {
      case 'artistas':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="stage_name"
                label="Nome Artístico"
                placeholder="Digite o nome artístico"
                required
              />
              <ArtistSubtypeSelect name="artist_type" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CitySelectStable name="city" />
              <RHFInput
                name="instagram"
                label="Instagram"
                placeholder="@usuario"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="booking_email"
                label="Email de Contato"
                type="email"
                placeholder="contato@exemplo.com"
                required
              />
              <RHFInput
                name="booking_whatsapp"
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <RHFTextarea
              name="bio_short"
              label="Bio Curta"
              placeholder="Descrição breve do artista"
              required
            />

            <RHFInput
              name="profile_image_url"
              label="URL da Imagem de Perfil"
              placeholder="https://exemplo.com/imagem.jpg"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="website_url"
                label="Website"
                placeholder="https://site.com"
              />
              <RHFInput
                name="spotify_url"
                label="Spotify"
                placeholder="https://open.spotify.com/artist/..."
              />
            </div>

            <RHFTextarea
              name="bio_long"
              label="Bio Completa"
              placeholder="Descrição detalhada do artista"
            />
          </>
        );

      case 'organizadores':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="name"
                label="Nome"
                placeholder="Nome do organizador"
                required
              />
              <OrganizerSubtypeSelect name="type" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CitySelectStable name="city" />
              <RHFInput
                name="instagram"
                label="Instagram"
                placeholder="@usuario"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="contact_email"
                label="Email de Contato"
                type="email"
                placeholder="contato@exemplo.com"
                required
              />
              <RHFInput
                name="contact_whatsapp"
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <RHFTextarea
              name="bio_short"
              label="Bio Curta"
              placeholder="Descrição breve do organizador"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="website_url"
                label="Website"
                placeholder="https://site.com"
              />
              <RHFInput
                name="logo_url"
                label="URL do Logo"
                placeholder="https://exemplo.com/logo.jpg"
              />
            </div>
          </>
        );

      case 'locais':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="name"
                label="Nome"
                placeholder="Nome do local"
                required
              />
              <VenueTypeSelect name="type" />
            </div>

            <RHFInput
              name="address"
              label="Endereço"
              placeholder="Endereço completo"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <CitySelectStable name="city" />
              <RHFInput
                name="state"
                label="Estado"
                placeholder="SP"
                required
              />
              <RHFInput
                name="zip_code"
                label="CEP"
                placeholder="00000-000"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="instagram"
                label="Instagram"
                placeholder="@usuario"
                required
              />
              <RHFInput
                name="booking_email"
                label="Email de Contato"
                type="email"
                placeholder="contato@exemplo.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="booking_whatsapp"
                label="WhatsApp"
                placeholder="(11) 99999-9999"
                required
              />
              <RHFInput
                name="maps_url"
                label="URL do Google Maps"
                placeholder="https://maps.google.com/..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RHFInput
                name="capacity"
                label="Capacidade"
                type="number"
                placeholder="500"
              />
              <RHFInput
                name="website_url"
                label="Website"
                placeholder="https://site.com"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to={getBackLink()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderFormFields()}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
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
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Atualizar" : "Criar"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}