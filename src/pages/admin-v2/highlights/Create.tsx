import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  HighlightFormSchema, 
  HighlightDraftSchema,
  HighlightForm, 
  getPublishChecklist, 
  getErrorSummary, 
  checkSlugUnique, 
  suggestAlternativeSlug 
} from '@/schemas/highlight';
import { toDB } from '@/adapters/highlightAdapters';
import { BasicSection } from './sections/Basic';
import { MediaSection } from './sections/Media';
import { PublicationSection } from './sections/Publication';
import { SEOSection } from './sections/SEO';
import { RelationsSection } from './sections/Relations';
import { AdvancedSection } from './sections/Advanced';
import { QualityBadges } from '@/components/highlights/QualityBadges';
import { PublishChecklist } from '@/components/highlights/PublishChecklist';
import { AutosaveIndicator } from '@/components/highlights/AutosaveIndicator';
import { NavigationGuard } from '@/components/highlights/NavigationGuard';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Plus, X, AlertCircle } from 'lucide-react';

export default function CreateHighlight() {
  const navigate = useNavigate();
  
  const form = useForm<HighlightForm>({
    resolver: zodResolver(HighlightFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      city: 'porto_alegre',
      start_at: '',
      end_at: '',
      status: 'draft',
      cover_url: '',
      alt_text: '',
      focal_point_x: 0.5,
      focal_point_y: 0.5,
      subtitle: '',
      summary: '',
      ticket_url: '',
      tags: [],
      type: '',
      patrocinado: false,
      anunciante: '',
      cupom: '',
      priority: 100,
      meta_title: '',
      meta_description: '',
      noindex: false,
      publish_at: '',
      unpublish_at: '',
      event_id: '',
      organizer_id: '',
      venue_id: '',
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showNavigationGuard, setShowNavigationGuard] = useState(false);
  const watchedData = form.watch();
  const checklist = getPublishChecklist(watchedData);
  const formErrors = form.formState.errors;
  const errorSummary = getErrorSummary(formErrors);

  // Auto-gerar slug quando título muda e track changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !form.getValues('slug')) {
        const slug = value.title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        form.setValue('slug', slug);
      }
      // Mark as having unsaved changes
      setHasUnsavedChanges(true);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Autosave functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      const formData = form.getValues();
      if (formData.title) {
        handleAutosave(formData);
      }
    }, 20000); // 20 seconds

    return () => clearTimeout(timeoutId);
  }, [hasUnsavedChanges, form]);

  // Navigation guard
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

  // Auto-save implementation
  const handleAutosave = async (data: HighlightForm) => {
    if (!data.title?.trim() || isSaving || isLoading) return;
    
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB({ ...data, status: 'draft' }),
        created_by: user.id,
        updated_by: user.id,
      };
      
      const { error } = await supabase
        .from('highlights')
        .insert(payload);
      
      if (error) throw error;
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Validar slug único
  const validateSlug = async (slug: string) => {
    if (!slug) return;
    
    const isUnique = await checkSlugUnique(slug);
    if (!isUnique) {
      const suggestion = await suggestAlternativeSlug(slug);
      setSlugError(`Slug já existe. Sugestão: ${suggestion}`);
      return false;
    }
    setSlugError(null);
    return true;
  };

  // Aplicar slug sugerido
  const applySuggestedSlug = async () => {
    const currentSlug = form.getValues('slug');
    if (currentSlug) {
      const suggestion = await suggestAlternativeSlug(currentSlug);
      form.setValue('slug', suggestion);
      setSlugError(null);
      // Focar no campo
      const slugField = document.querySelector('input[name="slug"]') as HTMLInputElement;
      if (slugField) slugField.focus();
    }
  };

  const handleSaveDraft = async () => {
    // Para rascunho, validar apenas title
    const draftData = { ...form.getValues(), status: 'draft' as const };
    const draftValidation = HighlightDraftSchema.safeParse(draftData);
    
    if (!draftValidation.success) {
      toast.error('Título é obrigatório para salvar rascunho');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB(draftValidation.data),
        created_by: user.id,
        updated_by: user.id,
      };

      const { data: result, error } = await supabase
        .from('highlights')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      toast.success('Rascunho salvo com sucesso!');
      navigate(`/admin-v2/highlights/${result.id}/edit`);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar rascunho');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (data: HighlightForm) => {
    // Validar slug único antes de publicar
    if (data.slug && !(await validateSlug(data.slug))) {
      toast.error('Slug deve ser único para publicar');
      return;
    }

    if (!checklist.canPublish) {
      toast.error('Complete todos os campos obrigatórios antes de publicar');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB({ ...data, status: 'published' }),
        created_by: user.id,
        updated_by: user.id,
      };

      const { error } = await supabase
        .from('highlights')
        .insert(payload);

      if (error) throw error;

      setHasUnsavedChanges(false);

      toast.success('Destaque publicado com sucesso!');
      navigate('/admin-v2/highlights');
    } catch (error) {
      console.error('Erro ao publicar:', error);
      toast.error('Erro ao publicar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndCreateAnother = async (data: HighlightForm) => {
    // Validar e salvar
    if (data.slug && !(await validateSlug(data.slug))) {
      toast.error('Slug deve ser único');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB(data),
        created_by: user.id,
        updated_by: user.id,
      };

      const { error } = await supabase
        .from('highlights')
        .insert(payload);

      if (error) throw error;

      setHasUnsavedChanges(false);

      toast.success('Destaque salvo! Criando novo...');
      
      // Reset form para criar outro
      form.reset({
        title: '',
        slug: '',
        city: 'porto_alegre',
        start_at: '',
        end_at: '',
        status: 'draft',
        cover_url: '',
        alt_text: '',
        focal_point_x: 0.5,
        focal_point_y: 0.5,
        subtitle: '',
        summary: '',
        ticket_url: '',
        tags: [],
        type: '',
        patrocinado: false,
        anunciante: '',
        cupom: '',
        priority: 100,
        meta_title: '',
        meta_description: '',
        noindex: false,
        publish_at: '',
        unpublish_at: '',
        event_id: '',
        organizer_id: '',
        venue_id: '',
      });
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndReturn = async (data: HighlightForm) => {
    // Validar e salvar
    if (data.slug && !(await validateSlug(data.slug))) {
      toast.error('Slug deve ser único');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB(data),
        created_by: user.id,
        updated_by: user.id,
      };

      const { error } = await supabase
        .from('highlights')
        .insert(payload);

      if (error) throw error;

      setHasUnsavedChanges(false);

      toast.success('Destaque salvo com sucesso!');
      navigate('/admin-v2/highlights');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => {
                if (hasUnsavedChanges) {
                  setShowNavigationGuard(true);
                } else {
                  navigate('/admin-v2/highlights');
                }
              }}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold">Criar Destaque</h1>
              <AutosaveIndicator 
                lastSaved={lastSaved}
                hasUnsavedChanges={hasUnsavedChanges}
                isSaving={isSaving}
              />
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveDraft} 
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Rascunho
              </Button>
              <Button 
                onClick={form.handleSubmit(handlePublish)} 
                disabled={isLoading || !checklist.canPublish}
              >
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={form.handleSubmit(handleSaveAndCreateAnother)} 
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Salvar + Novo
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={form.handleSubmit(handleSaveAndReturn)} 
                disabled={isLoading}
              >
                Salvar + Voltar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  if (hasUnsavedChanges) {
                    setShowNavigationGuard(true);
                  } else {
                    navigate('/admin-v2/highlights');
                  }
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quality Badges */}
        <QualityBadges data={watchedData} slugError={slugError} />

        {/* Resumo de erros */}
        {errorSummary.length > 0 && (
          <Alert className="mb-6 border-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Corrija os seguintes erros:</div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errorSummary.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Erro de slug */}
        {slugError && (
          <Alert className="mb-6 border-warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{slugError}</span>
              <Button size="sm" variant="outline" onClick={applySuggestedSlug}>
                Aplicar sugestão
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Coluna 1 */}
              <div className="space-y-6">
                <BasicSection form={form} slugError={slugError} onSlugChange={validateSlug} />
                <MediaSection form={form} />
                <SEOSection form={form} />
              </div>

              {/* Coluna 2 */}
              <div className="space-y-6">
                <PublicationSection form={form} />
                <RelationsSection form={form} />
                <AdvancedSection form={form} />
                <PublishChecklist data={watchedData} slugError={slugError} />
              </div>

            </div>
          </form>
        </Form>

        <NavigationGuard
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={async () => {
            const data = form.getValues();
            await handleSaveDraft();
          }}
          isOpen={showNavigationGuard}
          onOpenChange={setShowNavigationGuard}
        />
      </div>
    </div>
  );
}