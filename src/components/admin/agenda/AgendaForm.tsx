"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormProvider } from 'react-hook-form';
import { Save, Eye, Copy, Trash2, ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import {
  AgendaItemSchema,
  AgendaItemInput,
  CityEnum,
  ListingTypeEnum,
  generateSlug,
  validateSlug
} from '@/schemas/agenda';
import {
  RHFInput,
  RHFTextarea,
  RHFSelect,
  RHFComboboxChips,
  RHFDateTimeUtc,
  RHFImageUploader,
  RHFSwitch
} from '@/components/form';
import { useSlugValidation } from '@/hooks/useSlugValidation';
import { useAgendaManagement } from '@/hooks/useAgendaManagement';
import { useFormDirtyGuard } from '@/lib/forms';

interface AgendaFormProps {
  agendaId?: string;
  onBack: () => void;
}

export function AgendaForm({ agendaId, onBack }: AgendaFormProps) {
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isEditing = Boolean(agendaId);
  
  // Hooks
  const agendaManagement = useAgendaManagement();
  const { available: slugAvailable, loading: slugLoading, checkSlug } = useSlugValidation('agenda_itens');
  
  const methods = useForm<AgendaItemInput>({
    resolver: zodResolver(AgendaItemSchema),
    defaultValues: {
      title: "",
      slug: "",
      city: "SP",
      listing_type: "destaque_curatorial",
      artists_names: [],
      is_published: false,
      tags: [],
      priority: 0,
      patrocinado: false,
      noindex: false,
      currency: "BRL",
    }
  });

  const { watch, handleSubmit, setValue, formState: { errors, isDirty }, reset } = methods;
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const watchedValues = watch();

  // Debounced values for autosave
  const [debouncedValues] = useDebounce(watchedValues, 3000);

  // Form dirty guard
  useFormDirtyGuard(isDirty);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !isEditing) {
      const newSlug = generateSlug(watchedTitle);
      if (newSlug !== watchedSlug) {
        setValue('slug', newSlug, { shouldValidate: true });
      }
    }
  }, [watchedTitle, setValue, isEditing, watchedSlug]);

  // Check slug on change
  useEffect(() => {
    if (watchedSlug && validateSlug(watchedSlug)) {
      checkSlug(watchedSlug, agendaId);
    }
  }, [watchedSlug, checkSlug, agendaId]);

  // Load agenda data for editing
  useEffect(() => {
    if (isEditing && agendaId) {
      loadAgendaData(agendaId);
    }
  }, [isEditing, agendaId]);

  const loadAgendaData = async (id: string) => {
    try {
      setLoading(true);
      const data = await agendaManagement.getAgendaItem(id);
      if (data) {
        reset(data);
      }
    } catch (error) {
      console.error('Error loading agenda data:', error);
      toast.error('Erro ao carregar dados da agenda');
    } finally {
      setLoading(false);
    }
  };

  
  const handleAutosave = useCallback(async () => {
    if (autosaving || publishing) return;

    try {
      setAutosaving(true);
      const formData = { ...watchedValues };
      
      if (isEditing && agendaId) {
        await agendaManagement.updateAgendaItem(agendaId, formData);
      } else {
        // For new items, we only autosave after first manual save
        // This prevents creating empty records
        return;
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setAutosaving(false);
    }
  }, [watchedValues, autosaving, publishing, isEditing, agendaId, agendaManagement]);

  const handleSaveDraft = async (data: AgendaItemInput) => {
    try {
      setLoading(true);
      const draftData = { ...data, is_published: false };
      
      if (isEditing && agendaId) {
        await agendaManagement.updateAgendaItem(agendaId, draftData);
      } else {
        const newId = await agendaManagement.createAgendaItem(draftData);
        if (newId) {
          // Navigate to edit mode after creation
          window.history.replaceState(null, '', `/admin/v3/agenda/${newId}`);
        }
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving draft:', error);
      toast.error('Erro ao salvar rascunho');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (data: AgendaItemInput) => {
    try {
      setPublishing(true);

      // Validate required fields for publishing
      const requiredFields = ['title', 'slug', 'city', 'start_at_utc', 'end_at_utc'];
      const missingFields = requiredFields.filter(field => !data[field as keyof AgendaItemInput]);

      // Check for cover image and alt text
      if (!data.cover_image?.url && !data.cover_url) {
        missingFields.push('cover_url');
      }
      if ((!data.cover_image?.alt && !data.cover_alt) && (data.cover_image?.url || data.cover_url)) {
        missingFields.push('cover_alt');
      }

      if (missingFields.length > 0) {
        toast.error(`Campos obrigatórios para publicar: ${missingFields.join(', ')}`);
        return;
      }

      // Revalidate slug uniqueness
      if (!slugAvailable) {
        toast.error('Slug já está em uso. Escolha outro slug.');
        return;
      }

      // Round times to 15 minutes and set publish data
      const publishData = {
        ...data,
        start_at_utc: data.start_at_utc ? new Date(Math.round(data.start_at_utc.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)) : data.start_at_utc,
        end_at_utc: data.end_at_utc ? new Date(Math.round(data.end_at_utc.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000)) : data.end_at_utc,
        is_published: true,
        publish_at: new Date(),
      };

      if (isEditing && agendaId) {
        await agendaManagement.updateAgendaItem(agendaId, publishData);
      } else {
        const newId = await agendaManagement.createAgendaItem(publishData);
        if (newId) {
          window.history.replaceState(null, '', `/admin/v3/agenda/${newId}`);
        }
      }

      setLastSaved(new Date());
      
    } catch (error) {
      console.error('Error publishing:', error);
      toast.error('Erro ao publicar agenda');
    } finally {
      setPublishing(false);
    }
  };

  const handleDuplicate = async () => {
    if (!agendaId) return;
    
    try {
      const newId = await agendaManagement.duplicateAgendaItem(agendaId);
      if (newId) {
        window.location.href = `/admin/v3/agenda/${newId}`;
      }
    } catch (error) {
      console.error('Error duplicating:', error);
      toast.error('Erro ao duplicar agenda');
    }
  };

  const handleDelete = async () => {
    if (!agendaId) return;
    
    const confirmed = window.confirm('Tem certeza que deseja excluir esta agenda?');
    if (!confirmed) return;

    try {
      const success = await agendaManagement.deleteAgendaItem(agendaId);
      if (success) {
        onBack();
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error('Erro ao excluir agenda');
    }
  };

  const cityOptions = [
    { value: "POA", label: "Porto Alegre" },
    { value: "FLORIPA", label: "Florianópolis" },
    { value: "CURITIBA", label: "Curitiba" },
    { value: "SP", label: "São Paulo" },
    { value: "RJ", label: "Rio de Janeiro" },
  ];

  const listingTypeOptions = [
    { value: "destaque_curatorial", label: "Destaque Curatorial" },
    { value: "vitrine_cultural", label: "Vitrine Cultural" },
  ];

  if (loading || agendaManagement.loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Agenda' : 'Nova Agenda'}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            {autosaving && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 animate-spin" />
                Salvando automaticamente...
              </div>
            )}
            {lastSaved && (
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Salvo às {lastSaved.toLocaleTimeString()}
              </div>
            )}
            {isDirty && !autosaving && (
              <div className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Alterações não salvas
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSubmit(handleSaveDraft)}
            disabled={loading || agendaManagement.loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>

          <Button
            onClick={handleSubmit(handlePublish)}
            disabled={publishing || !watchedValues.title}
            className="bg-green-600 hover:bg-green-700"
          >
            <Eye className="w-4 h-4 mr-2" />
            {publishing ? 'Publicando...' : 'Publicar'}
          </Button>

          {isEditing && (
            <>
              <Button variant="outline" onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicar
              </Button>

              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Form */}
      <FormProvider {...methods}>
        <form className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFInput
                  name="title"
                  label="Título"
                  placeholder="Digite o título da agenda"
                  required
                />

                <div className="space-y-2">
                  <RHFInput
                    name="slug"
                    label="Slug"
                    placeholder="slug-da-agenda"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => checkSlug(watchedSlug, agendaId)}
                      disabled={!watchedSlug || slugLoading}
                    >
                      {slugLoading ? 'Verificando...' : 'Verificar Slug'}
                    </Button>
                    {watchedSlug && !slugLoading && (
                      <Badge variant={slugAvailable ? "default" : "destructive"}>
                        {slugAvailable ? 'Disponível' : 'Já existe'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <RHFTextarea
                name="subtitle"
                label="Subtítulo"
                placeholder="Subtítulo opcional"
                rows={2}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFSelect
                  name="city"
                  label="Cidade"
                  options={cityOptions}
                  required
                />

                <RHFSelect
                  name="listing_type"
                  label="Tipo de Listagem"
                  options={listingTypeOptions}
                />
              </div>
            </CardContent>
          </Card>

          {/* Date and Time */}
          <Card>
            <CardHeader>
              <CardTitle>Data e Horário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RHFDateTimeUtc
                  name="start_at_utc"
                  label="Data e Hora de Início"
                  required
                />

                <RHFDateTimeUtc
                  name="end_at_utc"
                  label="Data e Hora de Fim"
                  compareWithField="start_at_utc"
                  isEndDate
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Artists */}
          <Card>
            <CardHeader>
              <CardTitle>Artistas</CardTitle>
            </CardHeader>
            <CardContent>
              <RHFComboboxChips
                name="artists_names"
                label="Nomes dos Artistas"
                placeholder="Digite o nome e pressione Enter"
                description="Adicione até 12 nomes de artistas"
                maxItems={12}
                showCounter
              />
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Imagem de Capa</CardTitle>
            </CardHeader>
            <CardContent>
              <RHFImageUploader
                name="cover_image"
                label="Imagem de Capa"
                description="Faça upload da imagem de capa (obrigatória para publicar)"
                requireAlt
              />
            </CardContent>
          </Card>

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RHFInput
                name="ticket_url"
                label="URL dos Ingressos"
                placeholder="https://..."
                type="url"
              />

              <RHFTextarea
                name="summary"
                label="Resumo"
                placeholder="Resumo do evento (opcional)"
                rows={3}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <RHFSwitch
                  name="is_published"
                  label="Publicado"
                  description="Marque para publicar imediatamente"
                />

                <RHFSwitch
                  name="patrocinado"
                  label="Patrocinado"
                  description="Marque se é conteúdo patrocinado"
                />

                <RHFSwitch
                  name="noindex"
                  label="Não indexar"
                  description="Impede indexação por buscadores"
                />
              </div>
            </CardContent>
          </Card>
        </form>
      </FormProvider>
    </div>
  );
}