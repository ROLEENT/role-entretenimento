import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  agendaFormSchema, 
  agendaDraftSchema,
  publishSchema, 
  AgendaFormData, 
  PublishFormData 
} from '@/schemas/agendaForm';

interface UseAgendaFormProps {
  agendaId?: string;
  mode: 'create' | 'edit';
}

export function useAgendaForm({ agendaId, mode }: UseAgendaFormProps) {
  const navigate = useNavigate();
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
      status: 'draft',
      visibility_type: 'curadoria',
      priority: 0,
      tags: [],
      noindex: false,
    },
  });

  const { watch, reset, formState: { isDirty } } = form;

  // Watch for changes to set unsaved flag
  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  // Load agenda data for editing
  const loadAgenda = useCallback(async () => {
    if (mode === 'create' || !agendaId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('*')
        .eq('id', agendaId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Item não encontrado",
          variant: "destructive"
        });
        navigate('/admin-v3/agenda');
        return;
      }

      // Helper to convert null to empty string for text fields
      const asStr = (v: unknown) => (v == null ? '' : String(v));
      
      // Convert UTC dates to local for form
      const formData: AgendaFormData = {
        ...data,
        start_at: new Date(data.start_at),
        end_at: new Date(data.end_at),
        publish_at: data.publish_at ? new Date(data.publish_at) : undefined,
        unpublish_at: data.unpublish_at ? new Date(data.unpublish_at) : undefined,
        tags: data.tags || [],
        // Convert null to empty strings for optional text fields
        subtitle: asStr(data.subtitle),
        summary: asStr(data.summary),
        ticket_url: asStr(data.ticket_url),
        cover_url: asStr(data.cover_url),
        alt_text: asStr(data.alt_text),
        meta_title: asStr(data.meta_title),
        meta_description: asStr(data.meta_description),
        type: asStr(data.type),
        anunciante: asStr(data.anunciante),
        cupom: asStr(data.cupom),
      };

      setOriginalUpdatedAt(data.updated_at);
      reset(formData);
      setHasUnsavedChanges(false);
      
    } catch (error) {
      console.error('Error loading agenda:', error);
      toast({
        title: "Erro ao carregar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [agendaId, mode, reset, toast, navigate]);

  // Check if slug exists
  const checkSlugExists = useCallback(async (slug: string, currentId?: string) => {
    try {
      let query = supabase
        .from('agenda_itens')
        .select('id')
        .ilike('slug', slug)
        .is('deleted_at', null);
      
      if (currentId) {
        query = query.neq('id', currentId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      
      return { 
        exists: !!data,
        suggestion: data ? `${slug}-2` : undefined
      };
    } catch (error) {
      console.error('Error checking slug:', error);
      return { exists: false };
    }
  }, []);

  // Generate slug from title
  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Keep only letters, numbers, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (mode === 'edit' && hasUnsavedChanges && form.getValues('status') === 'draft') {
      const timer = setTimeout(() => {
        handleSaveDraft(true); // Auto-save silently
      }, 20000); // 20 seconds

      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, mode, form]);

  // Upload cover image
  const uploadCoverImage = useCallback(async (file: File) => {
    if (!agendaId && mode === 'edit') {
      throw new Error('Agenda ID é necessário para upload');
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `agenda/${agendaId || 'temp'}/cover_${Date.now()}.${fileExt}`;

      // Remove old cover if exists
      const currentCover = form.getValues('cover_url');
      if (currentCover) {
        try {
          await supabase.storage.from('admin').remove([currentCover]);
        } catch (error) {
          console.log('Error removing old cover:', error);
        }
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('admin')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      setUploadProgress(100);
      return fileName;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [agendaId, mode, form]);

  // Save draft
  const handleSaveDraft = useCallback(async (silent = false) => {
    try {
      setSaving(true);
      
      const formData = form.getValues();
      
      // Validate with draft schema (only title and slug required)
      const validationResult = agendaDraftSchema.safeParse({
        ...formData,
        status: 'draft'
      });
      
      if (!validationResult.success) {
        validationResult.error.errors.forEach((error) => {
          if (error.path.length > 0) {
            form.setError(error.path[0] as keyof AgendaFormData, {
              message: error.message
            });
          }
        });
        
        toast({
          title: "Campos obrigatórios",
          description: "Verifique os campos destacados",
          variant: "destructive"
        });
        return;
      }

      // Convert dates to UTC for API, handling undefined values
      const payload = {
        ...formData,
        status: 'draft' as const,
        start_at: formData.start_at?.toISOString(),
        end_at: formData.end_at?.toISOString(),
        publish_at: formData.publish_at?.toISOString(),
        unpublish_at: formData.unpublish_at?.toISOString(),
        // Empty strings will be handled by schema transform
      };

      let result;
      
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('agenda_itens')
          .insert([payload])
          .select('id, updated_at')
          .single();
          
        if (error) throw error;
        result = data;
        
        // Redirect to edit mode
        navigate(`/admin-v3/agenda/${data.id}/edit`, { replace: true });
      } else {
        const { data, error } = await supabase
          .from('agenda_itens')
          .update(payload)
          .eq('id', agendaId)
          .select('updated_at')
          .single();
          
        if (error) throw error;
        result = data;
      }

      setOriginalUpdatedAt(result.updated_at);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      if (!silent) {
        toast({
          title: "Rascunho salvo"
        });
      }
      
    } catch (error: any) {
      console.error('Error saving draft:', error);
      console.log('Error code:', error.code);
      
      let errorMessage = "Erro ao salvar";
      
      // Handle Supabase constraint errors
      if (error.code === '23502') {
        // NOT NULL constraint violation
        const column = error.details?.includes('title') ? 'título' :
                      error.details?.includes('slug') ? 'slug' :
                      'campo obrigatório';
        errorMessage = `${column} é obrigatório`;
      } else if (error.code === '23505') {
        // UNIQUE constraint violation
        errorMessage = "Slug já existe";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (!silent) {
        toast({
          title: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  }, [form, mode, agendaId, navigate, toast]);

  // Publish agenda
  const handlePublish = useCallback(async () => {
    try {
      setPublishing(true);
      
      const formData = form.getValues();
      
      // Validate with publish schema
      const validationResult = publishSchema.safeParse(formData);
      if (!validationResult.success) {
        // Set form errors
        validationResult.error.errors.forEach((error) => {
          if (error.path.length > 0) {
            form.setError(error.path[0] as keyof AgendaFormData, {
              message: error.message
            });
          }
        });
        
        toast({
          title: "Campos obrigatórios",
          description: "Verifique os campos destacados",
          variant: "destructive"
        });
        return;
      }

      // Convert dates to UTC
      const payload = {
        ...formData,
        status: 'published' as const,
        start_at: formData.start_at.toISOString(),
        end_at: formData.end_at.toISOString(),
        publish_at: formData.publish_at?.toISOString(),
        unpublish_at: formData.unpublish_at?.toISOString(),
      };

      let result;
      
      if (mode === 'create') {
        const { data, error } = await supabase
          .from('agenda_itens')
          .insert([payload])
          .select('id, updated_at')
          .single();
          
        if (error) throw error;
        result = data;
        
        navigate(`/admin-v3/agenda/${data.id}/edit`, { replace: true });
      } else {
        const { data, error } = await supabase
          .from('agenda_itens')
          .update(payload)
          .eq('id', agendaId)
          .select('updated_at')
          .single();
          
        if (error) throw error;
        result = data;
      }

      setOriginalUpdatedAt(result.updated_at);
      setHasUnsavedChanges(false);
      
      toast({
        title: "Item publicado"
      });
      
    } catch (error) {
      console.error('Error publishing:', error);
      toast({
        title: "Erro ao publicar",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  }, [form, mode, agendaId, navigate, toast]);

  // Unpublish agenda
  const handleUnpublish = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      const { error } = await supabase
        .from('agenda_itens')
        .update({ status: 'draft' })
        .eq('id', agendaId);
        
      if (error) throw error;
      
      form.setValue('status', 'draft');
      setHasUnsavedChanges(false);
      
      toast({
        title: "Item despublicado"
      });
      
    } catch (error) {
      console.error('Error unpublishing:', error);
      toast({
        title: "Erro ao despublicar",
        variant: "destructive"
      });
    }
  }, [agendaId, form, toast]);

  // Duplicate agenda
  const handleDuplicate = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      const formData = form.getValues();
      
      // Generate new slug
      const baseSlug = formData.slug;
      const { suggestion } = await checkSlugExists(baseSlug);
      
      const payload = {
        ...formData,
        slug: suggestion || `${baseSlug}-2`,
        status: 'draft' as const,
        start_at: formData.start_at.toISOString(),
        end_at: formData.end_at.toISOString(),
        publish_at: formData.publish_at?.toISOString(),
        unpublish_at: formData.unpublish_at?.toISOString(),
      };

      const { data, error } = await supabase
        .from('agenda_itens')
        .insert([payload])
        .select('id')
        .single();
        
      if (error) throw error;
      
      navigate(`/admin-v3/agenda/${data.id}/edit`);
      
      toast({
        title: "Item duplicado"
      });
      
    } catch (error) {
      console.error('Error duplicating:', error);
      toast({
        title: "Erro ao duplicar",
        variant: "destructive"
      });
    }
  }, [agendaId, form, checkSlugExists, navigate, toast]);

  // Delete agenda
  const handleDelete = useCallback(async () => {
    if (!agendaId) return;
    
    try {
      const { error } = await supabase
        .from('agenda_itens')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', agendaId);
        
      if (error) throw error;
      
      navigate('/admin-v3/agenda');
      
      toast({
        title: "Item excluído"
      });
      
    } catch (error) {
      console.error('Error deleting:', error);
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      });
    }
  }, [agendaId, navigate, toast]);

  // Load data on mount
  useEffect(() => {
    loadAgenda();
  }, [loadAgenda]);

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
    checkSlugExists,
    generateSlug,
    uploadCoverImage,
    handleSaveDraft,
    handlePublish,
    handleUnpublish,
    handleDuplicate,
    handleDelete,
  };
}