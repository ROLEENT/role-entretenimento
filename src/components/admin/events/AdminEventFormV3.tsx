import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Send, Eye, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Schema e tipos
import { EventFormV3, zEvent, validateEventForPublish } from '@/schemas/event-v3';

// Hooks
import { useUpsertEventV3 } from '@/hooks/useUpsertEventV3';
import { useFormDirtyGuard } from '@/hooks/useFormDirtyGuard';
import { useAutosave } from '@/hooks/useAutosave';
import { generateSlug } from '@/utils/slugUtils';

// Tab Components
import { EventBasicInfoTab } from './tabs/EventBasicInfoTab';
import { EventDateLocationTab } from './tabs/EventDateLocationTab';
import { EventArtistsPricesTab } from './tabs/EventArtistsPricesTab';
import { EventMediaTab } from './tabs/EventMediaTab';
import { EventSeoLinksTab } from './tabs/EventSeoLinksTab';
import { EventPublicationTab } from './tabs/EventPublicationTab';

// Highlight Components
import { AutosaveIndicator } from '@/components/highlights/AutosaveIndicator';
import { EventPreviewCard } from '@/components/highlights/EventPreviewCard';

interface AdminEventFormV3Props {
  initialData?: Partial<EventFormV3>;
  eventId?: string;
  onSave?: (data: EventFormV3) => void;
  onCancel?: () => void;
}

export function AdminEventFormV3({ 
  initialData = {}, 
  eventId, 
  onSave, 
  onCancel 
}: AdminEventFormV3Props) {
  const navigate = useNavigate();
  
  // State
  const [activeTab, setActiveTab] = useState('basic');
  
  // Form
  const form = useForm<EventFormV3>({
    resolver: zodResolver(zEvent),
    mode: 'onChange',
    defaultValues: {
      title: '',
      slug: '',
      city: '',
      venue_id: '',
      organizer_ids: [],
      supporters: [],
      sponsors: [],
      cover_url: '',
      cover_alt: '',
      start_utc: undefined,
      end_utc: undefined,
      doors_open_utc: undefined,
      free_address: '',
      artists_names: [],
      performances: [],
      visual_art: [],
      tags: [],
      genres: [],
      highlight_type: 'none',
      is_sponsored: false,
      ticketing: {},
      links: {},
      description: '',
      video_url: '',
      seo_title: '',
      seo_description: '',
      og_image_url: '',
      status: 'draft',
      publish_at: undefined,
      published_at: undefined,
      series_id: undefined,
      edition_number: undefined,
      ...initialData
    }
  });

  const { formState: { isDirty }, watch, setValue, getValues } = form;
  const formData = watch();

  // Mutations
  const upsertMutation = useUpsertEventV3({
    onSuccess: (data) => {
      toast.success('Evento salvo com sucesso!');
      onSave?.(data);
    },
    onError: (error) => {
      console.error('Error saving event:', error);
      toast.error('Erro ao salvar evento');
    }
  });

  const isPending = upsertMutation.isPending;
  
  // Guard contra navegação sem salvar
  useFormDirtyGuard(isDirty && !isPending, () => {});

  // Autosave
  const { isAutosaving, lastSavedAt } = useAutosave(formData, {
    enabled: isDirty && !isPending,
    delay: 3000,
    onSave: async () => {
      await upsertMutation.mutateAsync(formData);
    }
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !value.slug) {
        const newSlug = generateSlug(value.title);
        setValue('slug', newSlug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setValue]);

  // Validate form for publication
  const validationErrors = validateEventForPublish(formData);
  const canPublish = validationErrors.length === 0;

  // Handlers
  const handleSave = async () => {
    try {
      const data = getValues();
      await upsertMutation.mutateAsync(data);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handlePublish = async () => {
    if (!canPublish) {
      toast.error('Preencha todos os campos obrigatórios antes de publicar');
      return;
    }

    try {
      const data = { 
        ...getValues(), 
        status: 'published' as const,
        published_at: new Date().toISOString()
      };
      await upsertMutation.mutateAsync(data);
      toast.success('Evento publicado com sucesso!');
    } catch (error) {
      console.error('Publish error:', error);
    }
  };


  return (
    <>
      {/* Removido NavigationGuard temporariamente */}
      
      <FormProvider {...form}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">
                {eventId ? 'Editar Evento' : 'Criar Evento'}
              </h1>
              <AutosaveIndicator
                lastSaved={lastSavedAt}
                hasUnsavedChanges={isDirty}
                isSaving={isPending || isAutosaving}
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                {formData.status === 'published' ? 'Publicado' : 'Rascunho'}
              </Badge>
              
              {formData.highlight_type === 'vitrine' && (
                <Badge className="bg-[#c77dff] text-black">
                  Vitrine Cultural
                </Badge>
              )}
            </div>
          </div>

          {/* Formulário */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                  <TabsTrigger value="basic">Básico</TabsTrigger>
                  <TabsTrigger value="datetime">Data & Local</TabsTrigger>
                  <TabsTrigger value="lineup">Artistas & Preços</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Links</TabsTrigger>
                  <TabsTrigger value="publication">Publicação</TabsTrigger>
                </TabsList>

                {/* Aba 1: Básico */}
                <TabsContent value="basic" className="space-y-6">
                  <EventBasicInfoTab 
                    eventId={eventId}
                    isPending={isPending}
                  />
                </TabsContent>

                {/* Aba 2: Data & Local */}
                <TabsContent value="datetime" className="space-y-6">
                  <EventDateLocationTab 
                    isPending={isPending}
                  />
                </TabsContent>

                {/* Aba 3: Artistas & Preços */}
                <TabsContent value="lineup" className="space-y-6">
                  <EventArtistsPricesTab 
                    isPending={isPending}
                  />
                </TabsContent>

                {/* Aba 4: Mídia */}
                <TabsContent value="media" className="space-y-6">
                  <EventMediaTab form={form} />
                </TabsContent>

                {/* Aba 5: SEO & Links */}
                <TabsContent value="seo" className="space-y-6">
                  <EventSeoLinksTab 
                    isPending={isPending}
                  />
                </TabsContent>

                {/* Aba 6: Publicação */}
                <TabsContent value="publication" className="space-y-6">
                  <EventPublicationTab 
                    isPending={isPending}
                    onPublish={handlePublish}
                    canPublish={canPublish}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleSave}
                    disabled={isPending || !isDirty}
                    className="w-full"
                    variant="outline"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Rascunho
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handlePublish}
                    disabled={isPending || !canPublish}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {formData.status === 'published' ? 'Atualizar' : 'Publicar'}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin/events')}
                    className="w-full"
                    disabled={isPending}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </CardContent>
              </Card>

              {/* Publication Checklist */}
              <Card>
                <CardHeader>
                  <CardTitle>Status de Publicação</CardTitle>
                </CardHeader>
                <CardContent>
                  {validationErrors.length > 0 && (
                    <div className="text-sm text-red-600">
                      <p className="font-medium mb-2">Campos obrigatórios:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {canPublish && (
                    <p className="text-sm text-green-600">✓ Pronto para publicar</p>
                  )}
                </CardContent>
              </Card>

              {/* Event Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview do Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <EventPreviewCard 
                    data={formData}
                    variant="mobile"
                    className="scale-90 origin-top"
                  />
                </CardContent>
              </Card>

              {/* Status Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant={formData.status === 'published' ? 'default' : 'secondary'}>
                      {formData.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>
                  
                  {lastSavedAt && (
                    <div className="flex justify-between">
                      <span>Último save:</span>
                      <span className="text-muted-foreground">
                        {lastSavedAt.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {isDirty && (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Alterações não salvas</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </FormProvider>

    </>
  );
}