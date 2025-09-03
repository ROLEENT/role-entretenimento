import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, Eye, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// Schema e tipos
import { EventFormV3, zEvent, validateEventForPublish } from '@/schemas/event-v3';

// Hooks
import { useUpsertEventV3 } from '@/hooks/useUpsertEventV3';
import { useFormDirtyGuard } from '@/hooks/useFormDirtyGuard';
import { useAutosave } from '@/hooks/useAutosave';
import { useEventSlugCheck } from '@/hooks/useEventSlugCheck';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { generateSlug } from '@/utils/slugUtils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Components básicos
import RHFInput from '@/components/form/RHFInput';
import { RHFSlugInput } from '@/components/form/RHFSlugInput';
import { RHFSelect } from '@/components/form/RHFSelect';
import RHFTextarea from '@/components/form/RHFTextarea';
import RHFImageUploader from '@/components/form/RHFImageUploader';
import { DateTimePicker } from '@/components/ui/date-time-picker';

// New RHF Components
import { RHFComboboxAsync } from '@/components/rhf/RHFComboboxAsync';
import { RHFOrganizerMultiSelect } from '@/components/rhf/RHFOrganizerMultiSelect';
import { RHFEventSeriesSelect } from '@/components/rhf/RHFEventSeriesSelect';
import { RHFImageUpload } from '@/components/rhf/RHFImageUpload';

// Components especializados
import { ChipInput } from '@/components/form/ChipInput';
import { PerformanceEditor } from '@/components/form/PerformanceEditor';
import { VisualArtEditor } from '@/components/form/VisualArtEditor';
import { SupportersEditor } from '@/components/form/SupportersEditor';
import { TicketingForm } from '@/components/form/TicketingForm';
import { LinksEditor } from '@/components/form/LinksEditor';
import { PublicationChecklist } from '@/components/form/PublicationChecklist';

// Components de destaque
import { AutosaveIndicator } from '@/components/highlights/AutosaveIndicator';
import { NavigationGuard } from '@/components/highlights/NavigationGuard';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';

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
  const [activeTab, setActiveTab] = useState('identity');
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  
  // Hooks
  const { searchVenues } = useVenueSearch();
  
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
      artists_names: [],
      performances: [],
      visual_art: [],
      highlight_type: 'none',
      is_sponsored: false,
      ticketing: [],
      links: [],
      description: '',
      tags: [],
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

  // Slug management
  const { isCheckingSlug, slugStatus } = useEventSlugCheck();
  
  // Guard contra navegação sem salvar
  useFormDirtyGuard(isDirty && !isPending, 'Você tem alterações não salvas. Deseja sair mesmo assim?');

  // Autosave
  const { isAutosaving, lastSavedAt } = useAutosave(formData, async (data) => {
    await upsertMutation.mutateAsync(data);
  }, {
    enabled: isDirty && !isPending,
    debounceMs: 3000
  });

  // Auto-generate slug from title
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !value.slug) {
        const newSlug = generateSlug(value.title);
        setValue('slug', newSlug);
        checkSlug(newSlug);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setValue, checkSlug]);

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

  const handleVenueCreated = (newVenue: ComboboxAsyncOption) => {
    form.setValue('venue_id', newVenue.value);
    setVenueModalOpen(false);
  };

  return (
    <>
      <NavigationGuard when={isDirty && !isPending} />
      
      <FormProvider {...form}>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">
                {eventId ? 'Editar Evento' : 'Criar Evento'}
              </h1>
              <AutosaveIndicator
                lastSaved={lastSaved}
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
                <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                  <TabsTrigger value="identity">Identidade</TabsTrigger>
                  <TabsTrigger value="location">Local</TabsTrigger>
                  <TabsTrigger value="media">Mídia</TabsTrigger>
                  <TabsTrigger value="dates">Datas</TabsTrigger>
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="tickets">Ingressos</TabsTrigger>
                  <TabsTrigger value="series">Série</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                </TabsList>

                {/* Aba 1: Identidade */}
                <TabsContent value="identity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFInput
                        name="title"
                        label="Título do Evento"
                        placeholder="Nome do evento"
                        disabled={isPending}
                      />

                      <div className="space-y-2">
                        <RHFSlugInput
                          name="slug"
                          label="Slug (URL)"
                          placeholder="nome-do-evento"
                          disabled={isPending}
                          onBlur={(value) => checkSlug(value)}
                        />
                        {slugStatus && (
                          <div className="flex items-center gap-2 text-sm">
                            {isChecking ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : slugStatus === 'available' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className={slugStatus === 'available' ? 'text-green-600' : 'text-red-600'}>
                              {slugStatus === 'available' ? 'Slug disponível' : 'Slug já está em uso'}
                            </span>
                          </div>
                        )}
                      </div>

                      <RHFInput
                        name="city"
                        label="Cidade"
                        placeholder="São Paulo"
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 2: Local */}
                <TabsContent value="location" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Local e Organizadores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFComboboxAsync
                        name="venue_id"
                        control={form.control}
                        label="Local"
                        placeholder="Buscar locais..."
                        emptyText="Nenhum local encontrado"
                        createNewText="Cadastrar novo local"
                        onSearch={searchVenues}
                        onCreateNew={() => setVenueModalOpen(true)}
                      />

                      <RHFOrganizerMultiSelect
                        name="organizer_ids"
                        control={form.control}
                        label="Organizadores"
                        description="Selecione os organizadores do evento"
                        maxItems={5}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Apoiadores e Patrocinadores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <SupportersEditor
                        title="Apoiadores"
                        addButtonText="Adicionar Apoiador"
                        value={formData.supporters}
                        onChange={(value) => form.setValue('supporters', value)}
                        disabled={isPending}
                      />

                      <SupportersEditor
                        title="Patrocinadores"
                        addButtonText="Adicionar Patrocinador"
                        value={formData.sponsors}
                        onChange={(value) => form.setValue('sponsors', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 3: Mídia */}
                <TabsContent value="media" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Imagem de Capa</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RHFImageUpload
                        urlControl={{ name: "cover_url", control: form.control }}
                        altControl={{ name: "cover_alt", control: form.control }}
                        label="Imagem de Capa"
                        description="Imagem principal que será exibida no card do evento"
                        showPreview={true}
                        showAltText={true}
                        maxSize={5}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 4: Datas */}
                <TabsContent value="dates" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Horários do Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data/Hora de Início</label>
                        <DateTimePicker
                          value={formData.start_utc ? new Date(formData.start_utc) : undefined}
                          onChange={(date) => setValue('start_utc', date?.toISOString())}
                          disabled={isPending}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Data/Hora de Fim</label>
                        <DateTimePicker
                          value={formData.end_utc ? new Date(formData.end_utc) : undefined}
                          onChange={(date) => setValue('end_utc', date?.toISOString())}
                          disabled={isPending}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 5: Conteúdo */}
                <TabsContent value="content" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Descrição e Tags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFTextarea
                        name="description"
                        label="Descrição"
                        placeholder="Descreva o evento"
                        disabled={isPending}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <ChipInput
                          value={formData.tags}
                          onChange={(value) => setValue('tags', value)}
                          placeholder="Adicionar tag"
                          disabled={isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Artistas</label>
                        <ChipInput
                          value={formData.artists_names}
                          onChange={(value) => setValue('artists_names', value)}
                          placeholder="Nome do artista"
                          disabled={isPending}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Apresentações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PerformanceEditor
                        value={formData.performances}
                        onChange={(value) => setValue('performances', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Artes Visuais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VisualArtEditor
                        value={formData.visual_art}
                        onChange={(value) => setValue('visual_art', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Links Externos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LinksEditor
                        value={formData.links}
                        onChange={(value) => setValue('links', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 6: Ingressos */}
                <TabsContent value="tickets" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Ingressos e Preços</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TicketingForm
                        value={formData.ticketing}
                        onChange={(value) => setValue('ticketing', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Destaque</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFSelect
                        name="highlight_type"
                        label="Tipo de Destaque"
                        options={[
                          { value: 'none', label: 'Sem destaque' },
                          { value: 'featured', label: 'Destaque normal' },
                          { value: 'vitrine', label: 'Vitrine Cultural' }
                        ]}
                        disabled={isPending}
                      />

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_sponsored"
                          checked={formData.is_sponsored}
                          onChange={(e) => setValue('is_sponsored', e.target.checked)}
                          disabled={isPending}
                        />
                        <label htmlFor="is_sponsored" className="text-sm font-medium">
                          Evento patrocinado
                        </label>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 7: Série */}
                <TabsContent value="series" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Série de Eventos</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Vincula este evento a uma série existente ou cria uma nova
                      </p>
                    </CardHeader>
                    <CardContent>
                      <RHFEventSeriesSelect
                        seriesControl={{ name: "series_id", control: form.control }}
                        editionControl={{ name: "edition_number", control: form.control }}
                        description="Séries facilitam a organização de eventos recorrentes como festivais anuais"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 8: SEO */}
                <TabsContent value="seo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Otimização para Buscadores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFInput
                        name="seo_title"
                        label="Título SEO"
                        placeholder="Título otimizado para buscadores"
                        disabled={isPending}
                      />

                      <RHFTextarea
                        name="seo_description"
                        label="Descrição SEO"
                        placeholder="Descrição otimizada para buscadores"
                        disabled={isPending}
                      />

                      <RHFInput
                        name="og_image_url"
                        label="Imagem Open Graph"
                        placeholder="URL da imagem para redes sociais"
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
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
              <PublicationChecklist
                errors={validationErrors}
                canPublish={canPublish}
              />

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
                  
                  {lastSaved && (
                    <div className="flex justify-between">
                      <span>Último save:</span>
                      <span className="text-muted-foreground">
                        {lastSaved.toLocaleTimeString()}
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

      {/* Modal de criação rápida de venue */}
      <AgentQuickCreateModal
        open={venueModalOpen}
        onOpenChange={setVenueModalOpen}
        agentType="venue"
        onCreated={handleVenueCreated}
      />
    </>
  );
}