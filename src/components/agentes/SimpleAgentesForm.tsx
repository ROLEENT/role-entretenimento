import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { artistSchema, type ArtistForm } from "@/schemas/artist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import RHFInput from "@/components/form/RHFInput";
import ArtistTypeSelect from "@/components/fields/ArtistTypeSelect";
import GenreMultiSelect from "@/components/fields/GenreMultiSelect";
import { Button } from "@/components/ui/button";
import { generateSlug } from "@/utils/slugUtils";
import { useEffect } from "react";

interface SimpleAgentesFormProps {
  agentType: "artistas" | "organizadores" | "locais";
  agentId?: string;
  onSuccess: () => void;
  onFormSubmit?: (fn: () => void) => void;
  onFormState?: (state: any) => void;
}

export function SimpleAgentesForm({ agentType, agentId, onSuccess, onFormSubmit, onFormState }: SimpleAgentesFormProps) {
  const isEditing = !!agentId;
  const tableName = agentType === "artistas" ? "artists" : agentType === "organizadores" ? "organizers" : "venues";

  const form = useForm<ArtistForm>({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      name: "",
      city: "",
      instagram: "",
      bio: "",
      email: "",
      phone: "",
      artist_type_id: null,
      genre_ids: [],
    },
  });

  // Carregar dados para edição
  useEffect(() => {
    if (isEditing && agentId) {
      const loadData = async () => {
        const { data, error } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", agentId)
          .single();
        
        if (error) {
          toast.error("Erro ao carregar dados");
          return;
        }
        
        if (data) {
          form.reset({
            name: data.name || "",
            city: data.city || "",
            instagram: data.instagram || "",
            bio: data.bio || "",
            email: data.email || "",
            phone: data.phone || "",
            artist_type_id: data.artist_type_id || null,
            genre_ids: data.genre_ids || [],
          });
        }
      };
      loadData();
    }
  }, [isEditing, agentId, tableName, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // Preparar dados
      const slug = generateSlug(values.name);
      const payload = {
        name: values.name,
        slug,
        city: values.city || null,
        instagram: values.instagram?.replace(/^@+/, "").toLowerCase().trim() || null,
        bio: values.bio || null,
        email: values.email || null,
        phone: values.phone || null,
        artist_type_id: values.artist_type_id || null,
        genre_ids: values.genre_ids || [],
        status: "active",
        updated_at: new Date().toISOString(),
      };

      if (isEditing) {
        const { error } = await supabase
          .from(tableName)
          .update(payload)
          .eq("id", agentId);
        
        if (error) throw error;
        toast.success("Agente atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from(tableName)
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });
        
        if (error) throw error;
        toast.success("Agente criado com sucesso!");
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(error.message || "Erro ao salvar agente");
    }
  });

  // Expose form submit function to parent
  useEffect(() => {
    if (onFormSubmit) {
      onFormSubmit(onSubmit);
    }
  }, [onFormSubmit, onSubmit]);

  // Expose form state to parent  
  useEffect(() => {
    if (onFormState) {
      onFormState({
        isSubmitting: form.formState.isSubmitting,
        isSaving: false,
        hasError: false,
        lastSavedAt: null
      });
    }
  }, [onFormState, form.formState.isSubmitting]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">
          {isEditing ? "Editar" : "Criar"} {agentType === "artistas" ? "Artista" : agentType === "organizadores" ? "Organizador" : "Venue"}
        </h2>
        <p className="text-muted-foreground">
          Formulário simplificado para cadastro rápido
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <RHFInput
            name="name"
            label="Nome"
            placeholder="Nome do agente"
            required
          />
          
          <RHFInput
            name="city"
            label="Cidade"
            placeholder="Ex: São Paulo, Rio de Janeiro"
          />
          
          <RHFInput
            name="instagram"
            label="Instagram"
            placeholder="@usuario ou usuario"
          />
          
          <RHFInput
            name="email"
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
          />
          
          <RHFInput
            name="phone"
            label="Telefone"
            placeholder="(11) 99999-9999"
          />
          
          {agentType === "artistas" && (
            <>
              <ArtistTypeSelect />
              <GenreMultiSelect />
            </>
          )}
          
          <RHFInput
            name="bio"
            label="Bio/Descrição"
            placeholder="Breve descrição sobre o agente"
          />

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={form.formState.isSubmitting}
              className="flex-1"
            >
              {form.formState.isSubmitting ? "Salvando..." : isEditing ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}