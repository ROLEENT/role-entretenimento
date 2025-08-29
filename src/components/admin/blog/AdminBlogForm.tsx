import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AdminV3Header } from '@/components/AdminV3Header';
import { AdminV3Breadcrumb } from '@/components/AdminV3Breadcrumb';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkSlugAvailability, generateSlug } from '@/hooks/useAdminBlogPosts';
import { ImageUpload } from '@/components/ui/image-upload';
import { ArrowLeft, Save, Calendar, Globe, X } from 'lucide-react';
import { addMinutes, format } from 'date-fns';

const blogFormSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional(),
  slug: z.string().min(1, 'Slug é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  summary: z.string().min(1, 'Resumo é obrigatório'),
  content_md: z.string().min(1, 'Conteúdo é obrigatório'),
  cover_image: z.string().min(1, 'Imagem de capa é obrigatória'),
  cover_alt: z.string().min(1, 'Texto alternativo é obrigatório'),
  tags: z.array(z.string()).max(10, 'Máximo 10 tags'),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  featured: z.boolean().default(false),
  published_at: z.string().optional()
});

type BlogFormData = z.infer<typeof blogFormSchema>;

export function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(!!id);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState(true);
  const [currentTag, setCurrentTag] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Check if all required fields are filled for publishing
  const canPublish = () => {
    const values = form.getValues();
    return (
      values.title &&
      values.city &&
      values.summary &&
      values.content_md &&
      values.cover_image &&
      values.cover_alt &&
      slugAvailable
    );
  };

  // Get error message for publish button tooltip
  const getPublishErrorMessage = () => {
    const values = form.getValues();
    if (!values.title) return 'Título é obrigatório';
    if (!values.city) return 'Escolha uma seção';
    if (!values.summary) return 'Resumo é obrigatório';
    if (!values.content_md) return 'Conteúdo é obrigatório';
    if (!values.cover_image) return 'Imagem de capa é obrigatória';
    if (!values.cover_alt) return 'ALT da capa é obrigatório para publicar';
    if (!slugAvailable) return 'Slug indisponível';
    return '';
  };

  const form = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      slug: '',
      city: '',
      summary: '',
      content_md: '',
      cover_image: '',
      cover_alt: '',
      tags: [],
      seo_title: '',
      seo_description: '',
      featured: false,
      published_at: ''
    }
  });

  const watchedFields = form.watch();

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = Object.keys(watchedFields).some(key => {
      const currentValue = watchedFields[key as keyof BlogFormData];
      const defaultValue = form.formState.defaultValues?.[key as keyof BlogFormData];
      return currentValue !== defaultValue;
    });
    setIsDirty(hasChanges);
  }, [watchedFields, form.formState.defaultValues]);

  // Load existing post if editing
  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  // Auto-generate slug from title
  useEffect(() => {
    const title = form.watch('title');
    if (title && !id) {
      const newSlug = generateSlug(title);
      form.setValue('slug', newSlug);
      checkSlug(newSlug);
    }
  }, [form.watch('title')]);

  // Auto-generate SEO title if not set
  useEffect(() => {
    const title = form.watch('title');
    const seoTitle = form.watch('seo_title');
    if (title && !seoTitle) {
      form.setValue('seo_title', `${title} | Revista ROLÊ`);
    }
  }, [form.watch('title')]);

  const loadPost = async () => {
    try {
      setLoadingPost(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      form.reset({
        title: data.title,
        subtitle: data.subtitle || '',
        slug: data.slug_data,
        city: data.city,
        summary: data.summary,
        content_md: data.content_md || '',
        cover_image: data.cover_image,
        cover_alt: data.cover_alt || '',
        tags: data.tags || [],
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        featured: data.featured,
        published_at: data.published_at ? format(new Date(data.published_at), "yyyy-MM-dd'T'HH:mm") : ''
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar artigo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoadingPost(false);
    }
  };

  const checkSlug = async (slug: string) => {
    if (!slug) return;
    
    setSlugChecking(true);
    const available = await checkSlugAvailability(slug, id);
    setSlugAvailable(available);
    setSlugChecking(false);
  };

  const handleSlugChange = (value: string) => {
    form.setValue('slug', value);
    checkSlug(value);
  };

  const addTag = () => {
    if (!currentTag.trim()) return;
    
    const currentTags = form.getValues('tags');
    if (currentTags.length >= 10) {
      toast({
        title: "Limite de tags atingido",
        description: "Máximo 10 tags permitidas",
        variant: "destructive"
      });
      return;
    }
    
    if (currentTags.includes(currentTag.trim())) {
      toast({
        title: "Tag duplicada",
        description: "Esta tag já foi adicionada",
        variant: "destructive"
      });
      return;
    }

    form.setValue('tags', [...currentTags, currentTag.trim()]);
    setCurrentTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const convertMarkdownToHtml = (markdown: string): string => {
    // Simple markdown to HTML conversion
    return markdown
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/\n/gim, '<br>');
  };

  const onSubmit = async (data: BlogFormData, action: 'draft' | 'schedule' | 'publish') => {
    if (!slugAvailable) {
      toast({
        title: "Slug não disponível",
        description: "Escolha outro slug para o artigo",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);

      let status: 'draft' | 'scheduled' | 'published' = 'draft';
      let publishedAt: string | null = null;

      if (action === 'publish') {
        status = 'published';
        publishedAt = new Date().toISOString();
      } else if (action === 'schedule') {
        if (!data.published_at) {
          toast({
            title: "Data de publicação obrigatória",
            description: "Selecione uma data para agendar",
            variant: "destructive"
          });
          return;
        }
        
        const scheduledDate = new Date(data.published_at);
        const minDate = addMinutes(new Date(), 15);
        
        if (scheduledDate < minDate) {
          toast({
            title: "Data inválida",
            description: "Agendamento deve ser pelo menos 15 minutos no futuro",
            variant: "destructive"
          });
          return;
        }
        
        status = 'scheduled';
        publishedAt = scheduledDate.toISOString();
      }

      const postData = {
        title: data.title,
        subtitle: data.subtitle,
        slug: data.slug,
        slug_data: data.slug,
        city: data.city,
        summary: data.summary,
        content_md: data.content_md,
        content_html: convertMarkdownToHtml(data.content_md),
        cover_image: data.cover_image,
        cover_alt: data.cover_alt,
        tags: data.tags,
        seo_title: data.seo_title,
        seo_description: data.seo_description,
        featured: data.featured,
        status,
        published_at: publishedAt,
        author_name: 'Admin', // TODO: Get from auth context
        author_id: 'admin-id', // TODO: Get from auth context
        reading_time: Math.ceil(data.content_md.length / 1000) // Rough estimate
      };

      if (id) {
        const { error } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('blog_posts')
          .insert(postData);

        if (error) throw error;
      }

      toast({
        title: id ? "Artigo atualizado" : "Artigo criado",
        description: `Artigo ${action === 'draft' ? 'salvo como rascunho' : action === 'schedule' ? 'agendado' : 'publicado'} com sucesso`,
      });

      navigate('/admin-v3/revista');
    } catch (error: any) {
      toast({
        title: "Erro ao salvar artigo",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Alert before leaving if there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (loadingPost) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminV3Header />
      <div className="pt-16 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <AdminV3Breadcrumb 
            items={[
              { label: 'Revista', path: '/admin-v3/revista' },
              { label: id ? 'Editar Artigo' : 'Novo Artigo' }
            ]} 
          />
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin-v3/revista')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {id ? 'Editar Artigo' : 'Novo Artigo'}
              </h1>
              {isDirty && (
                <p className="text-sm text-muted-foreground">
                  Alterações não salvas
                </p>
              )}
            </div>
          </div>

      <Form {...form}>
        <form className="space-y-6">
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="cover">Capa</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="publish">Publicação</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Escreva um título direto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subtítulo</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Subtítulo do artigo" />
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
                          <div className="relative">
                            <Input 
                              {...field} 
                              onChange={(e) => handleSlugChange(e.target.value)}
                              placeholder="slug-do-artigo"
                              className={slugAvailable ? '' : 'border-destructive'}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {slugChecking ? (
                                <LoadingSpinner />
                              ) : slugAvailable ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-destructive">✗</span>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        {!slugAvailable && (
                          <p className="text-sm text-destructive">Slug indisponível</p>
                        )}
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Escolha uma seção" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sao-paulo">São Paulo</SelectItem>
                              <SelectItem value="rio-de-janeiro">Rio de Janeiro</SelectItem>
                              <SelectItem value="porto-alegre">Porto Alegre</SelectItem>
                              <SelectItem value="curitiba">Curitiba</SelectItem>
                              <SelectItem value="florianopolis">Florianópolis</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="featured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Artigo em Destaque</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Destacar este artigo na lista
                            </p>
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
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (máximo 10)</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <Button type="button" onClick={addTag} variant="outline">
                        Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('tags').map((tag, index) => (
                        <Badge key={index} variant="secondary" className="gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="summary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resumo *</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Resumo até 240 caracteres" rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cover">
              <Card>
                <CardHeader>
                  <CardTitle>Imagem de Capa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cover_image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Imagem de Capa *</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            onRemove={() => field.onChange('')}
                            bucket="revista-covers"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cover_alt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto Alternativo (ALT) *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Descrição da imagem para acessibilidade" />
                        </FormControl>
                        {!field.value && form.formState.touchedFields.cover_alt && (
                          <p className="text-sm text-destructive">
                            ALT da capa é obrigatório para publicar
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Artigo</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="content_md"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conteúdo (Markdown) *</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div>
                              <Textarea 
                                {...field} 
                                placeholder="Cole seu markdown aqui"
                                rows={20}
                                className="font-mono text-sm"
                              />
                            </div>
                            <div className="border rounded-md p-4 bg-muted/10">
                              <h4 className="text-sm font-medium mb-2">Preview:</h4>
                              <div 
                                className="prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ 
                                  __html: convertMarkdownToHtml(field.value || '') 
                                }}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo">
              <Card>
                <CardHeader>
                  <CardTitle>Otimização para Mecanismos de Busca</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="seo_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título SEO</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Título otimizado para SEO" />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Máximo 60 caracteres. Se vazio, usará o título do artigo.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seo_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição SEO</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descrição otimizada para SEO" rows={3} />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Máximo 160 caracteres. Se vazio, usará o resumo do artigo.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publish">
              <Card>
                <CardHeader>
                  <CardTitle>Publicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="published_at"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data e Hora de Publicação</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="datetime-local"
                            min={format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm")}
                          />
                        </FormControl>
                        <p className="text-sm text-muted-foreground">
                          Para agendamento, selecione uma data pelo menos 15 minutos no futuro
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onSubmit(form.getValues(), 'draft')}
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar rascunho
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onSubmit(form.getValues(), 'schedule')}
                      disabled={isLoading || !form.watch('published_at')}
                      title={!form.watch('published_at') ? 'Selecione uma data para agendar' : ''}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Agendar
                    </Button>

                    <Button
                      type="button"
                      onClick={() => onSubmit(form.getValues(), 'publish')}
                      disabled={isLoading || !canPublish()}
                      title={getPublishErrorMessage()}
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      Publicar agora
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
        </div>
      </div>
    </div>
  );
}