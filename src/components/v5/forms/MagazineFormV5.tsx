import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";

import { magazineV5Schema, type MagazineV5Form } from "@/schemas/v5/magazine";
import { useEntityFormV5, useAutosaveV5 } from "@/hooks/v5/useEntityFormV5";
import { useAutosave } from "@/hooks/useAutosave";

import { RHFText } from "./RHFText";
import { RHFTextarea } from "./RHFTextarea";
import { RHFSlug } from "./RHFSlug";
import { RHFSelect } from "./RHFSelect";
import { RHFMarkdownEditor } from "./RHFMarkdownEditor";
import { RHFImageUpload } from "./RHFImageUpload";
import { EventSelectAsync } from "./EventSelectAsync";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MagazineFormV5Props {
  initialData?: Partial<MagazineV5Form>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Rascunho" },
  { value: "scheduled", label: "Agendado" },
  { value: "published", label: "Publicado" },
];

const CITY_OPTIONS = [
  { value: "São Paulo", label: "São Paulo" },
  { value: "Rio de Janeiro", label: "Rio de Janeiro" },
  { value: "Belo Horizonte", label: "Belo Horizonte" },
  { value: "Brasília", label: "Brasília" },
  { value: "Salvador", label: "Salvador" },
  { value: "Recife", label: "Recife" },
  { value: "Porto Alegre", label: "Porto Alegre" },
  { value: "Curitiba", label: "Curitiba" },
];

export function MagazineFormV5({ 
  initialData, 
  onSuccess, 
  onCancel 
}: MagazineFormV5Props) {
  const form = useForm<MagazineV5Form>({
    resolver: zodResolver(magazineV5Schema),
    defaultValues: {
      status: "draft",
      tags: [],
      ...initialData,
    },
  });

  const { handleSubmit, watch, setValue, register } = form;
  const watchedData = watch();
  const currentStatus = watch("status");

  // Mutation para salvar
  const saveMutation = useEntityFormV5({
    entityType: 'magazine_posts',
    onSuccess: (data) => {
      if (!initialData?.id) {
        setValue("id", data.id);
      }
      onSuccess?.(data);
    },
  });

  // Autosave mutation
  const autosaveMutation = useAutosaveV5({
    entityType: 'magazine_posts'
  });

  // Autosave hook
  const {
    isAutosaving,
    lastSavedAt,
  } = useAutosave(watchedData, {
    enabled: !!watchedData.title && watchedData.title.length > 3,
    delay: 10000,
    onSave: async () => {
      const result = await autosaveMutation.mutateAsync(watchedData);
      if (result?.id && !watchedData.id) {
        setValue("id", result.id);
      }
    },
  });

  // Auto-generate slug
  useEffect(() => {
    const title = watch("title");
    if (title && !watch("slug")) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 80);
      setValue("slug", slug);
    }
  }, [watch("title"), setValue, watch]);

  const onSubmit = useCallback((data: MagazineV5Form) => {
    saveMutation.mutate(data);
  }, [saveMutation]);

  // Validation checklist
  const getValidationStatus = () => {
    const checks = [
      { 
        key: "title", 
        label: "Título preenchido", 
        valid: !!watchedData.title 
      },
      { 
        key: "slug", 
        label: "Slug preenchido", 
        valid: !!watchedData.slug 
      },
      { 
        key: "summary", 
        label: "Resumo preenchido", 
        valid: !!watchedData.summary 
      },
      { 
        key: "body_md", 
        label: "Conteúdo (mín. 500 chars)", 
        valid: !!watchedData.body_md && watchedData.body_md.length >= 500 
      },
      { 
        key: "cover", 
        label: "Capa e alt text", 
        valid: !!watchedData.cover_url && !!watchedData.cover_alt 
      },
    ];

    if (currentStatus === "scheduled") {
      checks.push({
        key: "scheduled_at",
        label: "Data de agendamento",
        valid: !!watchedData.scheduled_at && new Date(watchedData.scheduled_at) > new Date()
      });
    }

    return checks;
  };

  const validationChecks = getValidationStatus();
  const allValid = validationChecks.every(check => check.valid);
  const canPublish = currentStatus === "published" ? allValid : true;

  return (
    <FormProvider {...form}>
      <div className="container mx-auto py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {initialData?.id ? "Editar Revista" : "Nova Revista"}
            </h1>
          </div>
          {lastSavedAt && (
            <p className="text-sm text-muted-foreground">
              Salvo automaticamente às {lastSavedAt.toLocaleTimeString()}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="metadata">Metadados</TabsTrigger>
                  <TabsTrigger value="publish">Publicação</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RHFText
                      name="title"
                      label="Título"
                      placeholder="Digite o título da revista..."
                      required
                    />
                    <RHFSlug
                      name="slug"
                      label="Slug"
                      table="magazine_posts"
                      generateFrom="title"
                    />
                  </div>

                  <RHFTextarea
                    name="summary"
                    label="Resumo"
                    placeholder="Resumo da revista (máx. 300 caracteres)..."
                  />

                  <RHFMarkdownEditor
                    name="body_md"
                    label="Conteúdo (Markdown)"
                    placeholder="Escreva o conteúdo da revista em Markdown..."
                    minLength={500}
                    description="Use Markdown para formatar o texto. Mínimo de 500 caracteres para publicar."
                  />
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  <RHFImageUpload
                    name="cover_url"
                    altName="cover_alt"
                    label="Imagem de Capa"
                    bucket="covers"
                  />
                </TabsContent>

                <TabsContent value="metadata" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RHFSelect
                      name="city"
                      label="Cidade"
                      placeholder="Selecione a cidade..."
                      options={CITY_OPTIONS}
                    />
                    <EventSelectAsync
                      name="related_event_id"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="publish" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RHFSelect
                      name="status"
                      label="Status"
                      options={STATUS_OPTIONS}
                      description="Controle a visibilidade da revista"
                    />
                    
                    {currentStatus === "scheduled" && (
                      <div>
                        <Label htmlFor="scheduled_at">Data de Agendamento</Label>
                        <Input
                          type="datetime-local"
                          {...register("scheduled_at")}
                          className="mt-2"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Quando a revista será publicada automaticamente
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Checklist de validação */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Checklist de Publicação</h3>
                    <div className="space-y-2">
                      {validationChecks.map((check) => (
                        <div key={check.key} className="flex items-center gap-2">
                          {check.valid ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                          )}
                          <span className={check.valid ? "text-green-700" : "text-amber-700"}>
                            {check.label}
                          </span>
                          <Badge variant={check.valid ? "default" : "secondary"}>
                            {check.valid ? "OK" : "Pendente"}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {currentStatus === "published" && !allValid && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Complete todos os itens do checklist antes de publicar.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAutosaving && (
                <span className="text-sm text-muted-foreground">
                  Salvando automaticamente...
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending || !canPublish}
                className="min-w-24"
              >
                {saveMutation.isPending ? (
                  'Salvando...'
                ) : (
                  currentStatus === "published" ? "Publicar" :
                  currentStatus === "scheduled" ? "Agendar" :
                  "Salvar Rascunho"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}