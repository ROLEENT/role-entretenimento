import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import { HighlightFormSchema, HighlightForm, getPublishChecklist } from '@/schemas/highlight';
import { fromDB, toDB } from '@/adapters/highlightAdapters';
import { BasicSection } from './sections/Basic';
import { MediaSection } from './sections/Media';
import { PublicationSection } from './sections/Publication';
import { SEOSection } from './sections/SEO';
import { RelationsSection } from './sections/Relations';
import { AdvancedSection } from './sections/Advanced';
import { toast } from 'sonner';
import { ArrowLeft, Save, Send, Trash2 } from 'lucide-react';

export default function EditHighlight() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
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

  const watchedData = form.watch();
  const checklist = getPublishChecklist(watchedData);

  // Carregar dados do destaque
  useEffect(() => {
    if (id) {
      loadHighlight(id);
    }
  }, [id]);

  const loadHighlight = async (highlightId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .single();

      if (error) throw error;

      if (data) {
        const formData = fromDB(data);
        form.reset(formData);
        setDataLoaded(true);
      }
    } catch (error) {
      console.error('Erro ao carregar destaque:', error);
      toast.error('Erro ao carregar destaque');
      navigate('/admin-v2/highlights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: HighlightForm) => {
    if (!id) return;

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const payload = {
        ...toDB(data),
        updated_by: user.id,
      };

      const { error } = await supabase
        .from('highlights')
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      toast.success('Destaque atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async (data: HighlightForm) => {
    if (!checklist.canPublish) {
      toast.error('Complete todos os campos obrigatórios antes de publicar');
      return;
    }

    await handleSave({ ...data, status: 'published' });
  };

  const handleDelete = async () => {
    if (!id) return;
    
    if (!confirm('Tem certeza que deseja excluir este destaque?')) {
      return;
    }

    try {
      setIsDeleting(true);
      
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Destaque excluído com sucesso!');
      navigate('/admin-v2/highlights');
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir destaque');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!dataLoaded && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin-v2/highlights')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <h1 className="text-xl font-semibold">Editar Destaque</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Trash2 className="mr-2 h-4 w-4" />}
                Excluir
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={form.handleSubmit(handleSave)} 
                disabled={isLoading}
              >
                {isLoading ? <LoadingSpinner className="mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                Salvar
              </Button>
              <Button 
                onClick={form.handleSubmit(handlePublish)} 
                disabled={isLoading || !checklist.canPublish}
              >
                <Send className="mr-2 h-4 w-4" />
                Publicar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Coluna 1 */}
              <div className="space-y-6">
                <BasicSection form={form} />
                <MediaSection form={form} />
                <SEOSection form={form} />
              </div>

              {/* Coluna 2 */}
              <div className="space-y-6">
                <PublicationSection form={form} />
                <RelationsSection form={form} />
                <AdvancedSection form={form} />
              </div>

            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}