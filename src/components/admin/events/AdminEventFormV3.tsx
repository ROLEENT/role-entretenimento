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
import { generateSlug } from '@/utils/slugUtils';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

// Components básicos
import RHFInput from '@/components/form/RHFInput';
import { RHFSlugInput } from '@/components/form/RHFSlugInput';
import { RHFSelect } from '@/components/form/RHFSelect';
import RHFTextarea from '@/components/form/RHFTextarea';
import RHFImageUploader from '@/components/form/RHFImageUploader';
import { DateTimePicker } from '@/components/ui/date-time-picker';

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

interface AdminEventFormV3Props {
  initialData?: Partial<EventFormV3>;
  eventId?: string;
  onSave?: (data: EventFormV3) => void;
  onCancel?: () => void;
}

export const AdminEventFormV3 = ({
  initialData,
  eventId,
  onSave,
  onCancel,
}: AdminEventFormV3Props) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('identity');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNavigationGuard, setShowNavigationGuard] = useState(false);
  const [slugLocked, setSlugLocked] = useState(false);

  // Form setup
  const form = useForm<EventFormV3>({
    resolver: zodResolver(zEvent),
    defaultValues: {
      title: '',
      slug: '',
      city: '',
      venue_id: null,
      organizer_ids: [],
      supporters: [],
      sponsors: [],
      cover_url: '',
      cover_alt: '',
      start_utc: '',
      end_utc: '',
      artists_names: [],
      performances: [],
      visual_art: [],
      highlight_type: 'none',
      is_sponsored: false,
      description: '',
      tags: [],
      genres: [],
      status: 'draft',
      links: {},
      ...initialData,
    },
  });

  const { handleSubmit, watch, formState: { isDirty, isValid } } = form;
  const formData = watch();
  const titleValue = watch('title');
  const slugValue = watch('slug');

  // Mutations
  const { mutate: upsertEvent, isPending } = useUpsertEventV3({
    onSuccess: (data) => {
      setLastSaved(new Date());
      setIsSaving(false);
      onSave?.(data);
    },
    onError: () => {
      setIsSaving(false);
    },
  });

  // Hook para autosave
  const { isAutosaving, handleFieldBlur } = useAutosave(formData, {
    enabled: isDirty && isValid,
    delay: 3000,
    onSave: async () => {
      await new Promise((resolve, reject) => {
        upsertEvent({ ...formData, status: 'draft' }, {
          onSuccess: resolve,
          onError: reject
        });
      });
    }
  });

  // Hook para validação de slug
  const { isCheckingSlug, slugStatus } = useEventSlugCheck({
    slug: slugValue,
    eventId,
    enabled: !!slugValue && slugValue.length > 0
  });

  // Guards
  useFormDirtyGuard(isDirty, () => setShowNavigationGuard(true));

  // Auto-geração de slug baseado no título
  useEffect(() => {
    if (!titleValue || slugLocked || eventId) return;
    
    const newSlug = generateSlug(titleValue);
    if (newSlug !== slugValue) {
      form.setValue('slug', newSlug);
    }
  }, [titleValue, slugLocked, slugValue, eventId, form]);

  // Validação para publicação
  const validationErrors = validateEventForPublish(formData);
  const canPublish = validationErrors.length === 0;

  // Handlers
  const onSubmit = (data: EventFormV3) => {
    setIsSaving(true);
    upsertEvent({ ...data, status: 'draft' });
  };

  const onPublish = () => {
    if (!canPublish) {
      toast.error('Complete todos os campos obrigatórios antes de publicar');
      return;
    }
    
    handleSubmit((data) => {
      setIsSaving(true);
      upsertEvent({ ...data, status: 'published', published_at: new Date().toISOString() });
    })();
  };

  const handleSaveAndContinue = async () => {
    await handleSubmit(onSubmit)();
    setShowNavigationGuard(false);
  };

  // Função para regenerar slug
  const handleRegenerateSlug = () => {
    if (titleValue) {
      const newSlug = generateSlug(titleValue);
      form.setValue('slug', newSlug);
      setSlugLocked(false);
    }
  };

  // Função para editar slug manualmente
  const handleEditSlug = () => {
    setSlugLocked(true);
  };

  // Status icon para o slug
  const getSlugStatusIcon = () => {
    if (isCheckingSlug) {
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    if (slugStatus === 'available') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (slugStatus === 'taken') {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    return null;
  };

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        {/* Header com status e ações */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {eventId ? 'Editar Evento' : 'Criar Evento'}
            </h2>
            <AutosaveIndicator
              lastSaved={lastSaved}
              hasUnsavedChanges={isDirty}
              isSaving={isSaving || isAutosaving}
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

        {/* Formulário principal */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="identity">Identidade</TabsTrigger>
                <TabsTrigger value="media">Mídia</TabsTrigger>
                <TabsTrigger value="dates">Datas</TabsTrigger>
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="tickets">Ingressos</TabsTrigger>
                <TabsTrigger value="highlight">Destaque</TabsTrigger>
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
                      label="Título"
                      placeholder="Nome do evento..."
                      required
                    />

                    <RHFSlugInput
                      name="slug"
                      label="Slug"
                      required
                      locked={slugLocked}
                      statusIcon={getSlugStatusIcon()}
                      onRegenerate={handleRegenerateSlug}
                      onEdit={handleEditSlug}
                      regenerateDisabled={!titleValue}
                    />

                    <RHFInput
                      name="city"
                      label="Cidade"
                      placeholder="São Paulo"
                      required
                    />

                    <RHFSelect
                      name="venue_id"
                      label="Local"
                      placeholder="Selecione o local..."
                      options={[]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 2: Mídia */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capa do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RHFImageUploader
                      name="cover_url"
                      label="Capa"
                      accept="image/*"
                      required
                    />

                    <RHFInput
                      name="cover_alt"
                      label="Texto Alternativo"
                      placeholder="Descreva a imagem para acessibilidade..."
                      required
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 3: Datas */}
              <TabsContent value="dates" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Horários do Evento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <DateTimePicker
                      name="start_utc"
                      label="Data e Hora de Início"
                      required
                    />

                    <DateTimePicker
                      name="end_utc"
                      label="Data e Hora de Fim"
                      required
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 4: Conteúdo */}
              <TabsContent value="content" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Música e Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ChipInput
                      name="artists_names"
                      label="Artistas Musicais"
                      value={formData.artists_names}
                      onChange={(value) => form.setValue('artists_names', value)}
                      maxItems={12}
                      placeholder="Digite o nome do artista e pressione Enter..."
                    />

                    <PerformanceEditor
                      value={formData.performances as any}
                      onChange={(value) => form.setValue('performances', value)}
                      disabled={isPending}
                    />

                    <VisualArtEditor
                      value={formData.visual_art as any}
                      onChange={(value) => form.setValue('visual_art', value)}
                      disabled={isPending}
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

                <Card>
                  <CardHeader>
                    <CardTitle>Descrição e Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RHFTextarea
                      name="description"
                      label="Descrição"
                      placeholder="Descreva o evento..."
                      rows={6}
                      required
                    />

                    <ChipInput
                      name="tags"
                      label="Tags"
                      value={formData.tags}
                      onChange={(value) => form.setValue('tags', value)}
                      placeholder="Digite uma tag e pressione Enter..."
                    />

                    <ChipInput
                      name="genres"
                      label="Gêneros Musicais"
                      value={formData.genres}
                      onChange={(value) => form.setValue('genres', value)}
                      placeholder="Digite um gênero e pressione Enter..."
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 5: Ingressos */}
              <TabsContent value="tickets" className="space-y-6">
                <TicketingForm
                  value={formData.ticketing}
                  onChange={(value) => form.setValue('ticketing', value)}
                  disabled={isPending}
                />

                <LinksEditor
                  value={formData.links || {}}
                  onChange={(value) => form.setValue('links', value)}
                  disabled={isPending}
                />
              </TabsContent>

              {/* Aba 6: Destaque */}
              <TabsContent value="highlight" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipo de Destaque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RHFSelect
                      name="highlight_type"
                      label="Destaque"
                      options={[
                        { value: 'none', label: 'Sem destaque' },
                        { value: 'curatorial', label: 'Destaque curatorial' },
                        { value: 'vitrine', label: 'Vitrine Cultural (Patrocinado)' },
                      ]}
                    />

                    {formData.highlight_type === 'vitrine' && (
                      <div className="p-4 bg-[#c77dff]/10 border border-[#c77dff]/20 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-[#c77dff]" />
                          <span className="font-medium text-[#c77dff]">Vitrine Cultural</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Este evento será marcado automaticamente como patrocinado e exibido 
                          com destaque visual no site com a tag "Publi, Vitrine Cultural".
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 7: Série */}
              <TabsContent value="series" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Série de Eventos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Funcionalidade de séries em desenvolvimento...
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba 8: SEO */}
              <TabsContent value="seo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>SEO e Metadados</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RHFInput
                      name="seo_title"
                      label="Título SEO"
                      placeholder="Título otimizado para SEO..."
                    />

                    <RHFTextarea
                      name="seo_description"
                      label="Descrição SEO"
                      placeholder="Descrição para motores de busca..."
                      rows={3}
                    />

                    <RHFInput
                      name="og_image_url"
                      label="Imagem OG (Open Graph)"
                      placeholder="https://..."
                      type="url"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar com checklist */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <PublicationChecklist
                data={formData}
                onPublish={onPublish}
                isPublishing={isPending}
              />

              {/* Ações */}
              <div className="space-y-2">
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isPending}
                  className="w-full"
                  variant="outline"
                >
                  {isPending ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Rascunho
                    </>
                  )}
                </Button>

                {onCancel && (
                  <Button
                    onClick={onCancel}
                    variant="ghost"
                    className="w-full"
                    disabled={isPending}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Guard */}
        <NavigationGuard
          hasUnsavedChanges={isDirty}
          isOpen={showNavigationGuard}
          onOpenChange={setShowNavigationGuard}
          onSave={handleSaveAndContinue}
        />
      </div>
    </FormProvider>
  );
};