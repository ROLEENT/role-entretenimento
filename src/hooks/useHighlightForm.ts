import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { advancedHighlightSchema, AdvancedHighlightFormData, getPublishChecklist } from '@/lib/advancedHighlightSchema';

export const useHighlightForm = (highlightId?: string) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();

  const form = useForm<AdvancedHighlightFormData>({
    resolver: zodResolver(advancedHighlightSchema),
    defaultValues: {
      title: '',
      slug: '',
      subtitle: '',
      summary: '',
      city: 'porto_alegre',
      status: 'draft',
      start_at: '',
      end_at: '',
      cover_url: '',
      alt_text: '',
      focal_point_x: 0.5,
      focal_point_y: 0.5,
      ticket_url: '',
      tags: [],
      type: '',
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
      // Campos de compatibilidade
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
    }
  });

  // Gerar slug automaticamente a partir do título
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .replace(/^-|-$/g, ''); // Remove hífens do início e fim
  };

  // Detectar mudanças no título para gerar slug
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'title' && value.title && !form.getValues('slug')) {
        const slug = generateSlug(value.title);
        form.setValue('slug', slug);
      }
      
      // Marcar como não salvo
      setHasUnsavedChanges(true);
      
      // Programar autosave
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      autosaveTimeoutRef.current = setTimeout(() => {
        if (value.title) { // Só autosave se tem título
          handleAutosave(value as AdvancedHighlightFormData);
        }
      }, 20000); // 20 segundos
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Preencher dados a partir de evento selecionado
  const handleEventSelection = async (eventId: string) => {
    if (!eventId) return;
    
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('city, start_at, end_at, title')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (event) {
        form.setValue('city', event.city);
        form.setValue('start_at', event.start_at);
        form.setValue('end_at', event.end_at);
        // Se não tem título ainda, sugerir baseado no evento
        if (!form.getValues('title')) {
          form.setValue('title', `Destaque: ${event.title}`);
        }
        toast.success('Dados do evento preenchidos automaticamente');
      }
    } catch (error) {
      toast.error('Erro ao carregar dados do evento');
    }
  };

  // Validar slug único
  const validateSlug = async (slug: string) => {
    if (!slug) return false;
    
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('id')
        .eq('slug', slug)
        .neq('id', highlightId || '')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Se encontrou dados, significa que o slug já existe
      return !data;
    } catch (error) {
      return false;
    }
  };

  // Sugerir slug alternativo
  const suggestAlternativeSlug = async (baseSlug: string) => {
    let counter = 2;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (!(await validateSlug(newSlug))) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
    
    return newSlug;
  };

  // Autosave
  const handleAutosave = async (data: AdvancedHighlightFormData) => {
    if (!data.title) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const highlightData = {
        ...data,
        status: 'draft' as const,
        created_by: user.id,
        updated_by: user.id,
      };

      if (highlightId) {
        await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', highlightId);
      } else {
        await supabase
          .from('highlights')
          .insert(highlightData);
      }

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Erro no autosave:', error);
    }
  };

  // Salvar rascunho
  const saveDraft = async (data: AdvancedHighlightFormData) => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const highlightData = {
        ...data,
        status: 'draft' as const,
        created_by: user.id,
        updated_by: user.id,
      };

      let result;
      if (highlightId) {
        result = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', highlightId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('highlights')
          .insert(highlightData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      toast.success('Rascunho salvo com sucesso!');
      
      return result.data;
    } catch (error) {
      toast.error('Erro ao salvar rascunho');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Publicar
  const publish = async (data: AdvancedHighlightFormData) => {
    const checklist = getPublishChecklist(data);
    const isReady = checklist.every(item => item.completed);
    
    if (!isReady) {
      toast.error('Complete todos os requisitos antes de publicar');
      return;
    }

    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const highlightData = {
        ...data,
        status: 'published' as const,
        created_by: user.id,
        updated_by: user.id,
      };

      let result;
      if (highlightId) {
        result = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', highlightId)
          .select()
          .single();
      } else {
        result = await supabase
          .from('highlights')
          .insert(highlightData)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      
      setHasUnsavedChanges(false);
      toast.success('Destaque publicado com sucesso!');
      navigate('/admin-v2/highlights');
    } catch (error) {
      toast.error('Erro ao publicar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  // Duplicar de outro destaque
  const duplicateFrom = async (sourceId: string) => {
    try {
      setIsDuplicating(true);
      
      const { data: sourceHighlight, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', sourceId)
        .single();

      if (error) throw error;

      if (sourceHighlight) {
        const newTitle = `Cópia de ${sourceHighlight.title}`;
        const newSlug = await suggestAlternativeSlug(generateSlug(newTitle));
        
        const newData = {
          ...sourceHighlight,
          title: newTitle,
          slug: newSlug,
          status: 'draft' as const,
          // Limpar campos que não devem ser duplicados
          id: undefined,
          created_at: undefined,
          updated_at: undefined,
          created_by: undefined,
          updated_by: undefined,
        };

        form.reset(newData);
        toast.success('Dados duplicados com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao duplicar destaque');
    } finally {
      setIsDuplicating(false);
    }
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

  // Cleanup autosave timeout
  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  return {
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
  };
};