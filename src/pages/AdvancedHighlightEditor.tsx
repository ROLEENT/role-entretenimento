import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { FocalPointSelector } from '@/components/highlights/FocalPointSelector';
import { QualityBadges } from '@/components/highlights/QualityBadges';
import { PublishChecklist } from '@/components/highlights/PublishChecklist';
import { useHighlightForm } from '@/hooks/useHighlightForm';
import { AdvancedHighlightFormData } from '@/lib/advancedHighlightSchema';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ChevronDown, 
  Save, 
  Send, 
  Copy, 
  Plus,
  X,
  Eye,
  Calendar,
  Clock,
  Search,
  Keyboard
} from 'lucide-react';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

const eventTypes = [
  { value: 'show', label: 'Show' },
  { value: 'festival', label: 'Festival' },
  { value: 'balada', label: 'Balada' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'gastronómico', label: 'Gastronômico' },
];

export default function AdvancedHighlightEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [openSections, setOpenSections] = useState({
    basic: true,
    publication: false,
    media: false,
    seo: false,
    relationships: false,
    advanced: false
  });
  
  const [newTag, setNewTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingEvents, setIsSearchingEvents] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    form,
    isLoading,
    uploadProgress,
    setUploadProgress,
    hasUnsavedChanges,
    lastSaved,
    isDuplicating,
    generateSlug,
    validateSlug,
    suggestAlternativeSlug,
    handleEventSelection,
    saveDraft,
    publish,
    duplicateFrom
  } = useHighlightForm(id);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            form.handleSubmit((data) => saveDraft(data))();
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              form.handleSubmit(publish)();
            }
            break;
        }
      }
      
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (form.getValues('title')) {
            handleNewHighlight();
          } else {
            setSearchQuery('');
            // Focus search for duplicate
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [form]);

  // Gerar slug ao alterar título
  const handleTitleChange = (title: string) => {
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('title'))) {
      const newSlug = generateSlug(title);
      form.setValue('slug', newSlug);
    }
  };

  // Validar slug ao perder foco
  const handleSlugBlur = async () => {
    const slug = form.getValues('slug');
    if (!slug) return;

    const isValid = await validateSlug(slug);
    if (!isValid) {
      const newSlug = await suggestAlternativeSlug(slug);
      form.setValue('slug', newSlug);
      toast.warning(`Slug já existe. Sugerido: ${newSlug}`);
    }
  };

  // Adicionar tag
  const addTag = () => {
    const tags = form.getValues('tags') || [];
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 6) {
      const updatedTags = [...tags, newTag.trim()];
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    const tags = form.getValues('tags') || [];
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', updatedTags);
  };

  // Upload de imagem
  const handleImageUpload = (url: string) => {
    form.setValue('cover_url', url);
    form.setValue('image_url', url); // Compatibilidade
    if (!form.getValues('alt_text')) {
      form.setValue('alt_text', form.getValues('title') || 'Imagem do evento');
    }
    toast.success('Imagem carregada com sucesso!');
  };

  // Remover imagem
  const handleImageRemove = () => {
    form.setValue('cover_url', '');
    form.setValue('image_url', ''); // Compatibilidade
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', 0.5);
    form.setValue('focal_point_y', 0.5);
  };

  // Novo destaque
  const handleNewHighlight = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja continuar?')) {
        form.reset();
        // Manter cidade e datas como sugestão
        const currentData = form.getValues();
        form.setValue('city', currentData.city);
        if (currentData.start_at) form.setValue('start_at', currentData.start_at);
        if (currentData.end_at) form.setValue('end_at', currentData.end_at);
      }
    } else {
      form.reset();
    }
  };

  // Cancelar
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja sair mesmo assim?')) {
        navigate('/admin-v2/highlights');
      }
    } else {
      navigate('/admin-v2/highlights');
    }
  };

  const handleSaveAndCreateAnother = async () => {
    try {
      await saveDraft(form.getValues());
      form.reset({
        title: '',
        slug: '',
        subtitle: '',
        summary: '',
        city: form.getValues('city'), // Manter cidade
        status: 'draft',
        start_at: '',
        end_at: '',
        cover_url: '',
        alt_text: '',
        focal_point_x: 0.5,
        focal_point_y: 0.5,
        ticket_url: '',
        tags: [],
        type: form.getValues('type'), // Manter tipo
        patrocinado: false,
        anunciante: '',
        cupom: '',
        meta_title: '',
        meta_description: '',
        noindex: false,
        event_id: '',
        organizer_id: '',
        venue_id: '',
        priority: 100,
        venue: '',
        role_text: '',
        selection_reasons: [],
        image_url: '',
        photo_credit: '',
        event_date: '',
        event_time: '',
        ticket_price: '',
        sort_order: 100,
        is_published: false
      });
      toast.success('Destaque salvo! Criando novo...');
    } catch (error) {
      toast.error('Erro ao salvar destaque');
    }
  };

  const handleSaveAndReturn = async () => {
    try {
      await saveDraft(form.getValues());
      navigate('/admin-v2/highlights');
    } catch (error) {
      toast.error('Erro ao salvar destaque');
    }
  };

  // Toggle seção
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const watchedData = form.watch();
  const coverUrl = watchedData.cover_url || watchedData.image_url;

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin-v2/highlights')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEditing ? 'Editar Destaque' : 'Criar Destaque'}
                </h1>
                {lastSaved && (
                  <p className="text-sm text-muted-foreground">
                    Rascunho salvo {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={form.handleSubmit((data) => saveDraft(data))}
                disabled={isLoading}
                title="Ctrl/Cmd + S"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar rascunho
              </Button>
              
              <Button
                onClick={form.handleSubmit(publish)}
                disabled={isLoading}
                title="Ctrl/Cmd + Shift + Enter"
              >
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>

              <Button variant="outline" onClick={handleNewHighlight} title="N">
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>

              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Badges de qualidade */}
        <QualityBadges data={watchedData} />

        <Form {...form}>
          <form className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Básico */}
                <Card>
                  <Collapsible open={openSections.basic} onOpenChange={() => toggleSection('basic')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            Básico
                            <Badge variant="secondary">Obrigatório</Badge>
                          </CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.basic ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Título *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Digite o título do destaque"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      handleTitleChange(e.target.value);
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Slug *</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="url-amigavel"
                                    {...field}
                                    onBlur={handleSlugBlur}
                                  />
                                </FormControl>
                                <FormDescription>
                                  URL amigável gerada automaticamente
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade *</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a cidade" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {cities.map((city) => (
                                      <SelectItem key={city.value} value={city.value}>
                                        {city.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="subtitle"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Subtítulo</FormLabel>
                                <FormControl>
                                  <Input placeholder="Subtítulo opcional" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="summary"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>Resumo</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Breve resumo do destaque..."
                                    className="min-h-20"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="start_at"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data/Hora de Início *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="end_at"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data/Hora de Fim *</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="ticket_url"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>URL dos Ingressos</FormLabel>
                                <FormControl>
                                  <Input
                                    type="url"
                                    placeholder="https://..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Publicação */}
                <Card>
                  <Collapsible open={openSections.publication} onOpenChange={() => toggleSection('publication')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle>Publicação</CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.publication ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="draft">Rascunho</SelectItem>
                                    <SelectItem value="published">Publicado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {eventTypes.map((type) => (
                                      <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="publish_at"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Publicar em</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Agendamento automático da publicação
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="unpublish_at"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Despublicar em</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Despublicação automática
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Configurações comerciais</h4>
                          
                          <FormField
                            control={form.control}
                            name="patrocinado"
                            render={({ field }) => (
                              <FormItem className="flex items-center justify-between">
                                <div>
                                  <FormLabel>Conteúdo patrocinado</FormLabel>
                                  <FormDescription>Marcar como conteúdo publicitário</FormDescription>
                                </div>
                                <FormControl>
                                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {form.watch('patrocinado') && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="anunciante"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Anunciante</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Nome do anunciante" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="cupom"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Cupom de desconto</FormLabel>
                                    <FormControl>
                                      <Input placeholder="ROLE20" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Mídia */}
                <Card>
                  <Collapsible open={openSections.media} onOpenChange={() => toggleSection('media')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle>Mídia</CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.media ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-6">
                        <AdminFileUpload
                          bucket="highlights"
                          onUploadComplete={handleImageUpload}
                          currentUrl={coverUrl}
                          label="Imagem de capa *"
                          maxSize={5 * 1024 * 1024} // 5MB
                          allowedTypes={['image/png', 'image/jpg', 'image/jpeg', 'image/webp']}
                        />

                        {coverUrl && (
                          <div className="space-y-4">
                            <FormField
                              control={form.control}
                              name="alt_text"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Texto alternativo *</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Descreva a imagem para acessibilidade"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Obrigatório para publicação. Descreva o que aparece na imagem.
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FocalPointSelector
                              imageUrl={coverUrl}
                              initialX={form.getValues('focal_point_x')}
                              initialY={form.getValues('focal_point_y')}
                              onFocalPointChange={(x, y) => {
                                form.setValue('focal_point_x', x);
                                form.setValue('focal_point_y', y);
                              }}
                            />

                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleImageRemove}
                              className="w-full"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Remover imagem
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tags e Categorias</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Tags (máximo 6)</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Adicionar tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          maxLength={24}
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          disabled={(form.watch('tags')?.length || 0) >= 6}
                        >
                          Adicionar
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch('tags') || []).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            {tag}
                            <X
                              className="w-3 h-3 cursor-pointer"
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(form.watch('tags')?.length || 0)}/6 tags ({24 - newTag.length} caracteres restantes)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Coluna lateral */}
              <div className="space-y-6">
                {/* Checklist de publicação */}
                <Card>
                  <CardHeader>
                    <CardTitle>Status de Publicação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PublishChecklist data={watchedData} />
                  </CardContent>
                </Card>

                {/* Ações rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full gap-2" onClick={() => setShowPreview(!showPreview)}>
                      <Eye className="w-4 h-4" />
                      Preview
                    </Button>
                    
                    <Button variant="outline" className="w-full gap-2" disabled={!id}>
                      <Copy className="w-4 h-4" />
                      Duplicar
                    </Button>

                    <Separator />
                    
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Keyboard className="w-3 h-3" />
                        Atalhos:
                      </div>
                      <div>Ctrl/Cmd + S: Salvar rascunho</div>
                      <div>Ctrl/Cmd + Shift + Enter: Publicar</div>
                      <div>N: Novo destaque</div>
                    </div>
                  </CardContent>
                </Card>

                {/* SEO - Colapsável */}
                <Card>
                  <Collapsible open={openSections.seo} onOpenChange={() => toggleSection('seo')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle>SEO</CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.seo ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="meta_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Título</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Título para SEO"
                                  maxLength={60}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {(field.value?.length || 0)}/60 caracteres
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="meta_description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Descrição</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descrição para SEO"
                                  maxLength={160}
                                  className="min-h-16"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                {(field.value?.length || 0)}/160 caracteres
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="noindex"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div>
                                <FormLabel>Não indexar</FormLabel>
                                <FormDescription>Ocultar dos motores de busca</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Relacionamentos - Colapsável */}
                <Card>
                  <Collapsible open={openSections.relationships} onOpenChange={() => toggleSection('relationships')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle>Relacionamentos</CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.relationships ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="event_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Evento relacionado</FormLabel>
                              <div className="flex gap-2">
                                <FormControl>
                                  <Input
                                    placeholder="Buscar evento..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                  />
                                </FormControl>
                                <Button type="button" variant="outline" disabled={isSearchingEvents}>
                                  <Search className="w-4 h-4" />
                                </Button>
                              </div>
                              <FormDescription>
                                Ao selecionar um evento, cidade e datas serão preenchidas automaticamente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="venue_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local</FormLabel>
                              <FormControl>
                                <Input placeholder="Buscar local..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="organizer_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Organizador</FormLabel>
                              <FormControl>
                                <Input placeholder="Buscar organizador..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Avançado - Colapsável */}
                <Card>
                  <Collapsible open={openSections.advanced} onOpenChange={() => toggleSection('advanced')}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <CardTitle>Avançado</CardTitle>
                          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.advanced ? 'rotate-180' : ''}`} />
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prioridade</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  max="999"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormDescription>
                                0 = maior prioridade, 999 = menor prioridade
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Duplicar de outro destaque */}
                        <div className="space-y-2">
                          <FormLabel>Duplicar de</FormLabel>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Buscar destaque para duplicar..."
                              disabled={isDuplicating}
                            />
                            <Button type="button" variant="outline" disabled={isDuplicating}>
                              {isDuplicating ? <LoadingSpinner className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </Button>
                          </div>
                          <FormDescription>
                            Copiar dados de um destaque existente
                          </FormDescription>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}