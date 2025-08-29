import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { FocalPointSelector } from '@/components/highlights/FocalPointSelector';
import { QualityBadges } from '@/components/highlights/QualityBadges';
import { PublishChecklist } from '@/components/highlights/PublishChecklist';
import { supabase } from '@/integrations/supabase/client';
import { HighlightFormSchema as highlightSchema, HighlightForm as HighlightFormData, getPublishChecklist } from '@/schemas/highlight';
import { useHighlightForm } from '@/hooks/useHighlightForm';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus,
  Eye,
  X,
  Upload,
  Clock,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Keyboard,
  Check
} from 'lucide-react';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

const AdminHighlightCreate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  // Hook customizado
  const {
    form,
    isLoading,
    uploadProgress,
    setUploadProgress,
    hasUnsavedChanges,
    lastSaved,
    generateSlug,
    validateSlug,
    handleEventSelection,
    saveDraft,
    publish,
    duplicateFrom
  } = useHighlightForm(id);
  
  // Estados locais
  const [newReason, setNewReason] = useState('');
  const [newTag, setNewTag] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string>('basic');
  const [showChecklist, setShowChecklist] = useState(false);

  // Dados do formulário atual
  const formData = form.watch();
  const checklist = getPublishChecklist(formData);

  // Auto-gerar slug quando title muda
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const slug = generateSlug(formData.title);
      form.setValue('slug', slug);
    }
  }, [formData.title, formData.slug, generateSlug, form]);

  // Teclas de atalho
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        form.handleSubmit(saveDraft)();
      }
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          form.reset();
          // Limpar formulário para novo destaque
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [form, saveDraft, generateSlug]);

  // Upload de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato não suportado. Use PNG, JPG, JPEG ou WebP.');
      return;
    }

    try {
      setUploadProgress(0);
      
      const fileName = `highlight-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('admin-uploads')
        .upload(fileName, file);
      
      // Simular progresso
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('admin-uploads')
        .getPublicUrl(data.path);

      form.setValue('cover_url', urlData.publicUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
      console.error(error);
    } finally {
      setUploadProgress(0);
    }
  };

  // Gerenciar tags
  const addTag = () => {
    if (newTag.trim() && formData.tags.length < 6) {
      const currentTags = formData.tags || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue('tags', [...currentTags, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = formData.tags || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Gerenciar motivos de seleção
  const addReason = () => {
    if (newReason.trim()) {
      const currentReasons = formData.selection_reasons || [];
      if (!currentReasons.includes(newReason.trim())) {
        form.setValue('selection_reasons', [...currentReasons, newReason.trim()]);
        setNewReason('');
      }
    }
  };

  const removeReason = (reasonToRemove: string) => {
    const currentReasons = formData.selection_reasons || [];
    form.setValue('selection_reasons', currentReasons.filter(reason => reason !== reasonToRemove));
  };

  // Limpeza ao remover imagem
  const removeImage = () => {
    form.setValue('cover_url', '');
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', 0.5);
    form.setValue('focal_point_y', 0.5);
  };

  // Guard de navegação
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin-v2/highlights')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {isEditing ? 'Editar Destaque' : 'Criar Destaque'}
                </h1>
                {lastSaved && (
                  <p className="text-sm text-muted-foreground">
                    Salvo automaticamente {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowChecklist(!showChecklist)}>
                <Check className="mr-2 h-4 w-4" />
                Checklist
              </Button>
              <Button variant="outline" size="sm" onClick={form.handleSubmit(saveDraft)} disabled={isLoading}>
                {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar Rascunho
              </Button>
              <Button onClick={form.handleSubmit(publish)} disabled={isLoading || !checklist.canPublish}>
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </Button>
            </div>
          </div>
          
          {/* Quality badges */}
          <div className="mt-3">
            <QualityBadges data={formData} />
          </div>
        </div>
      </div>

      {/* Checklist overlay */}
      {showChecklist && (
        <div className="fixed top-20 right-4 z-40">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Checklist de Publicação</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowChecklist(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <PublishChecklist data={formData} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Coluna 1 */}
              <div className="space-y-6">
                
                {/* Básico */}
                <Accordion type="single" value={openAccordion} onValueChange={setOpenAccordion}>
                  <AccordionItem value="basic">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Informações Básicas
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome do evento ou destaque" {...field} />
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
                            <FormLabel>Slug (URL) *</FormLabel>
                            <FormControl>
                              <Input placeholder="url-amigavel" {...field} />
                            </FormControl>
                            <FormDescription>
                              Gerado automaticamente. Deve ser único.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cidade *</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
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
                          name="venue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local *</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="start_at"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data/Hora Início *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
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
                              <FormLabel>Data/Hora Fim *</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="summary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descreva o que torna este evento especial..."
                                className="min-h-24"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value?.length || 0} / 400 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Mídia */}
                <Accordion type="single" value={openAccordion} onValueChange={setOpenAccordion}>
                  <AccordionItem value="media">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        Mídia
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      
                      <div className="space-y-4">
                        <FormLabel>Imagem de Capa *</FormLabel>
                        <div className="border-2 border-dashed border-border rounded-lg p-6">
                          <div className="text-center">
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                            <div className="mt-4">
                              <label htmlFor="image-upload" className="cursor-pointer">
                                <Button type="button" variant="outline" asChild>
                                  <span>Selecionar Imagem</span>
                                </Button>
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              PNG, JPG, JPEG ou WebP. Máximo 5MB.
                            </p>
                            {uploadProgress > 0 && (
                              <div className="mt-4">
                                <Progress value={uploadProgress} />
                                <p className="text-sm text-muted-foreground mt-1">
                                  {uploadProgress.toFixed(0)}% enviado
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {formData.cover_url && (
                          <div className="space-y-4">
                            <div className="relative">
                              <img 
                                src={formData.cover_url} 
                                alt="Preview" 
                                className="w-full max-h-64 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={removeImage}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <FormField
                              control={form.control}
                              name="alt_text"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Texto Alternativo *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Descreva a imagem para acessibilidade" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <FormLabel>Ponto Focal</FormLabel>
                              <FocalPointSelector
                                imageUrl={formData.cover_url}
                                onFocalPointChange={(x, y) => {
                                  form.setValue('focal_point_x', x);
                                  form.setValue('focal_point_y', y);
                                }}
                                initialX={formData.focal_point_x}
                                initialY={formData.focal_point_y}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </div>

              {/* Coluna 2 */}
              <div className="space-y-6">
                
                {/* Publicação */}
                <Accordion type="single" value={openAccordion} onValueChange={setOpenAccordion}>
                  <AccordionItem value="publish">
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Publicação
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      
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
                                <SelectItem value="scheduled">Agendado</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {formData.status === 'scheduled' && (
                        <FormField
                          control={form.control}
                          name="publish_at"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Publicar em</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

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
                              0 = mais prioritário, 999 = menos prioritário
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicione uma tag..."
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        maxLength={24}
                      />
                      <Button type="button" onClick={addTag} variant="outline" size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {(formData.tags || []).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {tag}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {(formData.tags || []).length} / 6 tags
                    </p>
                  </CardContent>
                </Card>

                {/* SEO */}
                <Accordion type="single" value={openAccordion} onValueChange={setOpenAccordion}>
                  <AccordionItem value="seo">
                    <AccordionTrigger>SEO</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      
                      <FormField
                        control={form.control}
                        name="meta_title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Título SEO</FormLabel>
                            <FormControl>
                              <Input placeholder="Título para motores de busca" {...field} />
                            </FormControl>
                            <FormDescription>
                              {field.value?.length || 0} / 60 caracteres
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
                            <FormLabel>Descrição SEO</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Descrição para motores de busca"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              {field.value?.length || 0} / 160 caracteres
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="noindex"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Não indexar</FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Impedir que motores de busca indexem esta página
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </div>

            </div>
          </form>
        </Form>
      </div>

      {/* Atalhos de teclado - tooltip fixo */}
      <div className="fixed bottom-4 left-4 bg-background/80 backdrop-blur-sm border rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Keyboard className="h-3 w-3" />
          <span><kbd>Ctrl+S</kbd> Salvar</span>
          <span><kbd>N</kbd> Novo</span>
        </div>
      </div>
    </div>
  );
};

export default AdminHighlightCreate;