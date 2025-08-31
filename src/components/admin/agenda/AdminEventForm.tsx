"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { eventSchema, type EventForm } from "@/schemas/event";
import { useUpsertEvent } from "@/hooks/useUpsertEvent";
import { useFormDirtyGuard } from "@/lib/forms";
import RHFInput from "@/components/form/RHFInput";
import RHFSelect from "@/components/form/RHFSelect";
import RHFSelectAsync from "@/components/form/RHFSelectAsync";
import RHFMultiSelectAsync from "@/components/form/RHFMultiSelectAsync";
import RHFRichEditor from "@/components/form/RHFRichEditor";
import RHFImageUploader from "@/components/form/RHFImageUploader";
import { SlugInput } from "@/components/ui/slug-input";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Badge } from "@/components/ui/badge";
import { Save, Send, Eye, AlertCircle } from "lucide-react";

interface AdminEventFormProps {
  initialData?: Partial<EventForm>;
  eventId?: string;
  onSave?: (data: EventForm) => void;
  onCancel?: () => void;
}

export default function AdminEventForm({
  initialData,
  eventId,
  onSave,
  onCancel,
}: AdminEventFormProps) {
  const form = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: "draft",
      lineup: [],
      links: [],
      gallery: [],
      ...initialData,
    },
  });

  const { mutate: upsertEvent, isPending } = useUpsertEvent();
  const { isDirty } = form.formState;

  // Guard against navigation with unsaved changes
  useFormDirtyGuard(isDirty);

  // Set initial data when it changes
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const handleSubmit = async (data: EventForm, publish = false) => {
    try {
      const submitData = {
        ...data,
        status: (publish ? "published" : "draft") as "draft" | "published",
        id: eventId,
      };

      await new Promise((resolve, reject) => {
        upsertEvent(submitData, {
          onSuccess: (result) => {
            toast.success(
              publish ? "Evento publicado com sucesso!" : "Evento salvo como rascunho!"
            );
            onSave?.(result);
            resolve(result);
          },
          onError: reject,
        });
      });
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    }
  };

  const onSubmit = (data: EventForm) => handleSubmit(data, false);
  const onPublish = (data: EventForm) => handleSubmit(data, true);

  const watchedTitle = form.watch("title");
  const watchedStatus = form.watch("status");

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {eventId ? "Editar Evento" : "Criar Evento"}
              </h1>
              <Badge variant={watchedStatus === "published" ? "default" : "secondary"}>
                {watchedStatus === "published" ? "Publicado" : "Rascunho"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {eventId ? "Edite as informações do evento" : "Crie um novo evento para a agenda"}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(onPublish)}
              disabled={isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Publicar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="datetime">Data & Local</TabsTrigger>
            <TabsTrigger value="lineup">Artistas & Preços</TabsTrigger>
            <TabsTrigger value="media">Mídia</TabsTrigger>
            <TabsTrigger value="seo">SEO & Links</TabsTrigger>
          </TabsList>

          {/* Seção Básica */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Configure as informações principais do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RHFInput
                  name="title"
                  label="Título do Evento"
                  placeholder="Ex: Festival de Música Eletrônica"
                  required
                />
                
                <SlugInput
                  value={form.watch("slug")}
                  onChange={(slug) => form.setValue("slug", slug)}
                  sourceText={watchedTitle}
                  table="agenda_itens"
                  excludeId={eventId}
                  label="URL do Evento"
                />

                <RHFSelect
                  name="status"
                  label="Status"
                  options={[
                    { value: "draft", label: "Rascunho" },
                    { value: "published", label: "Publicado" },
                  ]}
                />

                <RHFInput
                  name="excerpt"
                  label="Resumo"
                  placeholder="Breve descrição do evento..."
                />

                <RHFRichEditor
                  name="content"
                  label="Descrição Completa"
                  placeholder="Descreva o evento em detalhes..."
                  rows={8}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção Data & Local */}
          <TabsContent value="datetime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data, Horário e Local</CardTitle>
                <CardDescription>
                  Configure quando e onde o evento acontecerá
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <DateTimePicker
                    name="starts_at"
                    label="Data e Hora de Início"
                    required
                  />
                  <DateTimePicker
                    name="ends_at"
                    label="Data e Hora de Fim"
                    required
                  />
                </div>

                <RHFSelectAsync
                  name="city_id"
                  label="Cidade"
                  placeholder="Selecione a cidade..."
                  query={{
                    table: "cities",
                    fields: "id, name, uf",
                    orderBy: "name",
                  }}
                  mapRow={(row) => ({
                    value: row.id,
                    label: `${row.name} - ${row.uf}`,
                  })}
                />

                <RHFSelectAsync
                  name="venue_id"
                  label="Local do Evento"
                  placeholder="Selecione o local (opcional)..."
                  query={{
                    table: "venues",
                    fields: "id, name, address",
                    orderBy: "name",
                  }}
                  mapRow={(row) => ({
                    value: row.id,
                    label: row.name,
                  })}
                />

                <RHFSelectAsync
                  name="organizer_id"
                  label="Organizador"
                  placeholder="Selecione o organizador (opcional)..."
                  query={{
                    table: "organizers",
                    fields: "id, name",
                    orderBy: "name",
                  }}
                  mapRow={(row) => ({
                    value: row.id,
                    label: row.name,
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção Artistas & Preços */}
          <TabsContent value="lineup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lineup e Informações</CardTitle>
                <CardDescription>
                  Configure os artistas, preços e outras informações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RHFMultiSelectAsync
                  name="lineup"
                  label="Lineup (Artistas)"
                  placeholder="Selecione os artistas..."
                  query={{
                    table: "artists",
                    fields: "id, stage_name, city",
                    orderBy: "stage_name",
                  }}
                  mapRow={(row) => ({
                    value: row.id,
                    label: `${row.stage_name} (${row.city})`,
                  })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <RHFInput
                    name="price_min"
                    label="Preço Mínimo (R$)"
                    type="number"
                    placeholder="0.00"
                  />
                  <RHFInput
                    name="price_max"
                    label="Preço Máximo (R$)"
                    type="number"
                    placeholder="100.00"
                  />
                </div>

                <RHFInput
                  name="age_rating"
                  label="Classificação Etária"
                  placeholder="Ex: 18+, Livre, 16+"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção Mídia */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Imagens e Mídia</CardTitle>
                <CardDescription>
                  Adicione imagens e conteúdo visual do evento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RHFImageUploader
                  name="cover_url"
                  label="Imagem de Capa"
                  description="Imagem principal do evento (recomendado: 1200x630px)"
                  accept="image/*"
                  maxSize={5}
                />

                <RHFImageUploader
                  name="gallery"
                  label="Galeria de Imagens"
                  description="Imagens adicionais do evento"
                  accept="image/*"
                  maxSize={5}
                  multiple
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Seção SEO & Links */}
          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO e Links</CardTitle>
                <CardDescription>
                  Configure otimizações para buscadores e links externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RHFInput
                  name="seo_title"
                  label="Título SEO"
                  placeholder="Título otimizado para buscadores"
                  description="Máximo 60 caracteres"
                />

                <RHFInput
                  name="seo_description"
                  label="Descrição SEO"
                  placeholder="Descrição otimizada para buscadores"
                  description="Máximo 160 caracteres"
                />

                <div className="space-y-4">
                  <h4 className="font-medium">Links Externos</h4>
                  <LinkRepeater name="links" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Form errors */}
        {Object.keys(form.formState.errors).length > 0 && (
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Erros no Formulário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-destructive">
                {Object.entries(form.formState.errors).map(([field, error]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {error?.message as string}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </form>
    </FormProvider>
  );
}

// Component for dynamic links
function LinkRepeater({ name }: { name: string }) {
  const form = useForm();
  // This would be a more complex component to handle dynamic link fields
  // For now, we'll keep it simple and add it later if needed
  return (
    <div className="text-sm text-muted-foreground">
      Links externos serão implementados em versão futura
    </div>
  );
}
