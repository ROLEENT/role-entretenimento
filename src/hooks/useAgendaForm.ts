import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { agendaFormSchema, publishSchema, AgendaFormData } from '@/schemas/agendaForm';

interface UseAgendaFormProps {
  agendaId?: string;
  mode: 'create' | 'edit';
}

export function useAgendaForm({ agendaId, mode }: UseAgendaFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [originalUpdatedAt, setOriginalUpdatedAt] = useState<string | null>(null);

  const form = useForm<AgendaFormData>({
    resolver: zodResolver(agendaFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      city: '',
      status: 'draft',
      visibility_type: 'curadoria',
      priority: 0,
      tags: [],
      noindex: false,
      focal_point_x: 0.5,
      focal_point_y: 0.5,
    },
  });

  // Watch form changes to set unsaved flag
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Auto-save for drafts
  useEffect(() => {
    if (form.watch('status') === 'draft' && hasUnsavedChanges && agendaId) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, agendaId]);

  // Load agenda data
  const loadAgenda = async () => {
    if (!agendaId || mode === 'create') return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('*')
        .eq('id', agendaId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "Agenda não encontrada",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      if (data) {
        // Convert dates to proper format
        const formattedData = {
          ...data,
          start_at: data.start_at ? new Date(data.start_at) : undefined,
          end_at: data.end_at ? new Date(data.end_at) : undefined,
          publish_at: data.publish_at ? new Date(data.publish_at) : undefined,
          unpublish_at: data.unpublish_at ? new Date(data.unpublish_at) : undefined,
          tags: data.tags || [],
        };

        form.reset(formattedData);
        setOriginalUpdatedAt(data.updated_at);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error loading agenda:', error);
      toast({
        title: "Erro ao carregar",
        description: "Não foi possível carregar a agenda.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Upload cover image
  const uploadCoverImage = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB.');
      }

      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      // Simulate progress for UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('agenda-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agenda-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const formData = form.getValues();
      
      // Prepare data for save
      const saveData = {
        ...formData,
        status: 'draft' as const,
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('agenda_itens')
          .insert([saveData])
          .select()
          .single();

        if (error) throw error;

        // Store the created item's ID (form doesn't need to track this)
      } else {
        const { error } = await supabase
          .from('agenda_itens')
          .update(saveData)
          .eq('id', agendaId);

        if (error) throw error;
      }

      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      toast({
        title: "Rascunho salvo",
        description: "Suas alterações foram salvas."
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o rascunho.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Publish
  const handlePublish = async () => {
    setPublishing(true);
    try {
      const formData = form.getValues();
      
      // Validate for publishing
      const result = publishSchema.safeParse(formData);
      if (!result.success) {
        const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        toast({
          title: "Dados incompletos",
          description: `Corrija os seguintes campos: ${errors.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      const publishData = {
        ...formData,
        status: 'published' as const,
        publish_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (mode === 'create') {
        const { data, error } = await supabase
          .from('agenda_itens')
          .insert([publishData])
          .select()
          .single();

        if (error) throw error;
        // Store the created item's ID (form doesn't need to track this)
      } else {
        const { error } = await supabase
          .from('agenda_itens')
          .update(publishData)
          .eq('id', agendaId);

        if (error) throw error;
      }

      form.setValue('status', 'published');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      toast({
        title: "Item publicado",
        description: "O item foi publicado com sucesso."
      });
    } catch (error) {
      console.error('Error publishing:', error);
      toast({
        title: "Erro ao publicar",
        description: "Não foi possível publicar o item.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setPublishing(false);
    }
  };

  // Unpublish
  const handleUnpublish = async () => {
    if (!agendaId) return;

    try {
      const { error } = await supabase
        .from('agenda_itens')
        .update({ 
          status: 'draft',
          unpublish_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', agendaId);

      if (error) throw error;

      form.setValue('status', 'draft');
      setHasUnsavedChanges(false);

      toast({
        title: "Item despublicado",
        description: "O item foi despublicado."
      });
    } catch (error) {
      console.error('Error unpublishing:', error);
      toast({
        title: "Erro ao despublicar",
        variant: "destructive"
      });
    }
  };

  // Duplicate
  const handleDuplicate = async () => {
    if (!agendaId) return;

    try {
      const formData = form.getValues();
      const duplicateData = {
        ...formData,
        title: `${formData.title} (Cópia)`,
        slug: `${formData.slug}-copia-${Date.now()}`,
        status: 'draft' as const,
        id: undefined, // Remove ID to create new
      };

      const { data, error } = await supabase
        .from('agenda_itens')
        .insert([duplicateData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Item duplicado",
        description: "Uma cópia foi criada como rascunho."
      });

      return data.id;
    } catch (error) {
      console.error('Error duplicating:', error);
      toast({
        title: "Erro ao duplicar",
        variant: "destructive"
      });
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!agendaId) return;

    try {
      const { error } = await supabase
        .from('agenda_itens')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', agendaId);

      if (error) throw error;

      toast({
        title: "Item excluído",
        description: "O item foi marcado como excluído."
      });
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      });
    }
  };

  // Load data on mount
  useEffect(() => {
    loadAgenda();
  }, [agendaId, mode]);

  return {
    form,
    loading,
    saving,
    publishing,
    uploading,
    uploadProgress,
    lastSaved,
    hasUnsavedChanges,
    conflictDetected,
    handleSaveDraft,
    handlePublish,
    handleUnpublish,
    handleDuplicate,
    handleDelete,
    uploadCoverImage
  };
}