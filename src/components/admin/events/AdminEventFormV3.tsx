import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, Send, Eye, Clock, AlertTriangle, Wand2 } from 'lucide-react';
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
import { ChipInputDragDrop } from '@/components/form/ChipInputDragDrop';
import { CharacterCounter } from '@/components/form/CharacterCounter';
import { SlugGenerator } from '@/components/form/SlugGenerator';
import { PerformanceEditorV3 } from '@/components/form/PerformanceEditorV3';
import { VisualArtEditorV3 } from '@/components/form/VisualArtEditorV3';
import { NavigationGuardV3 } from '@/components/highlights/NavigationGuardV3';
import { SupportersEditor } from '@/components/form/SupportersEditor';
import { TicketingForm } from '@/components/form/TicketingForm';
import { LinksEditor } from '@/components/form/LinksEditor';
import { PublicationChecklist } from '@/components/form/PublicationChecklist';

// Components de destaque
import { AutosaveIndicator } from '@/components/highlights/AutosaveIndicator';
import { NavigationGuard } from '@/components/highlights/NavigationGuard';
import { EventPreviewCard } from '@/components/highlights/EventPreviewCard';
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
  const [activeTab, setActiveTab] = useState('basic');
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

  // Slug management
  const { isCheckingSlug, slugStatus } = useEventSlugCheck({
    slug: formData.slug || '',
    eventId,
    enabled: !!formData.slug
  });
  
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

  const handleVenueCreated = (newVenue: ComboboxAsyncOption) => {
    form.setValue('venue_id', newVenue.value);
    setVenueModalOpen(false);
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
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <RHFSlugInput
                              name="slug"
                              label="Slug (URL)"
                              placeholder="nome-do-evento"
                              disabled={isPending}
                            />
                          </div>
                          <SlugGenerator
                            title={formData.title}
                            onGenerate={(slug) => setValue('slug', slug)}
                            disabled={isPending}
                          />
                        </div>
                        {slugStatus && (
                          <div className="flex items-center gap-2 text-sm">
                            {isCheckingSlug ? (
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

                      <RHFSelect
                        name="highlight_type"
                        label="Tipo de Destaque"
                        options={[
                          { value: 'none', label: 'Nenhum' },
                          { value: 'featured', label: 'Curatorial' },
                          { value: 'vitrine', label: 'Vitrine' }
                        ]}
                        disabled={isPending}
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tags</label>
                        <ChipInput
                          name="tags"
                          value={formData.tags}
                          onChange={(value) => setValue('tags', value)}
                          placeholder="Adicionar tag"
                          disabled={isPending}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Gêneros Musicais</label>
                        <ChipInput
                          name="genres"
                          value={formData.genres}
                          onChange={(value) => setValue('genres', value)}
                          placeholder="Adicionar gênero"
                          disabled={isPending}
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resumo</label>
                          <RHFTextarea
                            name="description"
                            placeholder="Descreva o evento"
                            disabled={isPending}
                          />
                          <CharacterCounter 
                            current={formData.description?.length || 0} 
                            max={500} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Série e Edições</CardTitle>
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

                {/* Aba 2: Data & Local */}
                <TabsContent value="datetime" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Horários do Evento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DateTimePicker
                          name="start_utc"
                          label="Data/Hora de Início (UTC)"
                          disabled={isPending}
                        />
                        
                        <DateTimePicker
                          name="end_utc"
                          label="Data/Hora de Fim (UTC)"
                          disabled={isPending}
                        />
                      </div>

                      <DateTimePicker
                        name="doors_open_utc"
                        label="Portas Abrem (UTC)"
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Local</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFComboboxAsync
                        name="venue_id"
                        control={form.control}
                        label="Local Cadastrado"
                        placeholder="Buscar locais..."
                        emptyText="Nenhum local encontrado"
                        createNewText="Cadastrar novo local"
                        onSearch={searchVenues}
                        onCreateNew={() => setVenueModalOpen(true)}
                      />

                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            OU
                          </span>
                        </div>
                      </div>

                      <RHFInput
                        name="free_address"
                        label="Endereço Livre"
                        placeholder="Rua, número, bairro, cidade"
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Organizadores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RHFOrganizerMultiSelect
                        name="organizer_ids"
                        control={form.control}
                        label="Organizadores"
                        description="Selecione os organizadores do evento. O primeiro será marcado como principal."
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
                        value={formData.supporters || []}
                        onChange={(value) => form.setValue('supporters', value as any)}
                        disabled={isPending}
                      />

                      <SupportersEditor
                        title="Patrocinadores"
                        addButtonText="Adicionar Patrocinador"
                        value={formData.sponsors || []}
                        onChange={(value) => form.setValue('sponsors', value as any)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 3: Artistas & Preços */}
                <TabsContent value="lineup" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Lineup Musical</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Artistas (Lineup)</label>
                        <ChipInputDragDrop
                          name="artists_names"
                          value={formData.artists_names || []}
                          onChange={(value) => setValue('artists_names', value)}
                          placeholder="Nome do artista"
                          disabled={isPending}
                          allowDragDrop={true}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performances Cênicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PerformanceEditorV3
                        value={formData.performances || []}
                        onChange={(performances) => setValue('performances', performances)}
                        disabled={form.formState.isSubmitting || upsertMutation.isPending}
                        eventStartTime={formData.start_utc}
                        eventEndTime={formData.end_utc}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Artes Visuais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <VisualArtEditorV3
                        value={formData.visual_art || []}
                        onChange={(visual_art) => setValue('visual_art', visual_art)}
                        disabled={form.formState.isSubmitting || upsertMutation.isPending}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Ingressos e Preços</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TicketingForm
                        value={formData.ticketing || {}}
                        onChange={(value) => setValue('ticketing', value as any)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 4: Mídia */}
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
                        description="Imagem principal que será exibida no card do evento (Alt obrigatório)"
                        showPreview={true}
                        showAltText={true}
                        maxSize={5}
                        
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Imagens Adicionais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFInput
                        name="og_image_url"
                        label="Imagem Open Graph"
                        placeholder="URL da imagem para redes sociais (se diferente da capa)"
                        disabled={isPending}
                      />

                      <RHFInput
                        name="video_url"
                        label="Vídeo Principal"
                        placeholder="URL do vídeo/teaser do evento"
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 5: SEO & Links */}
                <TabsContent value="seo" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Links Externos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <LinksEditor
                        value={formData.links || {}}
                        onChange={(value) => setValue('links', value)}
                        disabled={isPending}
                      />
                    </CardContent>
                  </Card>

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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Aba 6: Publicação */}
                <TabsContent value="publication" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Controle de Publicação</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RHFSelect
                        name="status"
                        label="Status"
                        options={[
                          { value: 'draft', label: 'Rascunho' },
                          { value: 'review', label: 'Revisão' },
                          { value: 'scheduled', label: 'Agendado' },
                          { value: 'published', label: 'Publicado' },
                          { value: 'archived', label: 'Arquivado' }
                        ]}
                        disabled={isPending}
                      />

                      <DateTimePicker
                        name="publish_at"
                        label="Publicar em"
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

      {/* Navigation Guard */}
      <NavigationGuardV3
        hasUnsavedChanges={isDirty}
        onSave={handleSave}
        isOpen={false}
        onOpenChange={() => {}}
        onConfirmNavigation={() => {
          console.log('Navigation confirmed');
        }}
      />

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