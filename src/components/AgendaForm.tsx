import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VenueAutocomplete } from '@/components/ui/venue-autocomplete';
import { OrganizerAutocomplete } from '@/components/ui/organizer-autocomplete';
import { EditConflictDialog } from '@/components/highlights/EditConflictDialog';
import { 
  Save, 
  Send, 
  Copy, 
  Trash2, 
  Upload, 
  X, 
  Clock,
  Plus,
  Hash,
  MapPin,
  Minus,
  Image as ImageIcon,
  GripVertical,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/useAutosave';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSlugHistory } from '@/hooks/useSlugHistory';
import { usePreviewToken } from '@/hooks/usePreviewToken';
import { useStorageUpload } from '@/hooks/useStorageUpload';
import { ValidationBadges, PublishErrorSummary } from '@/components/agenda/ValidationBadges';
import { validateUrl, validatePriceRange, validateOccurrence, getPublishValidationErrors } from '@/utils/agendaValidation';
import { supabase } from '@/integrations/supabase/client';
import { 
  CITY_OPTIONS, 
  VISIBILITY_OPTIONS,
  TICKET_STATUS_OPTIONS,
  TYPE_OPTIONS,
  AGE_RATING_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  AgendaDraftSchema,
  TicketStatusEnum,
  type AgendaDraftData,
  type TicketStatus
} from '@/schemas/agenda';

// Form values type with proper TicketStatus typing
interface AgendaFormValues {
  item: {
    title: string;
    slug: string;
    city?: string;
    start_at?: string;
    end_at?: string;
    type?: string;
    priority: number;
    status: 'draft' | 'published';
    visibility_type: 'curadoria' | 'vitrine';
    tags: string[];
    currency: string;
    accessibility: Record<string, boolean>;
    noindex: boolean;
    patrocinado: boolean;
    subtitle?: string;
    summary?: string;
    cover_url?: string;
    alt_text?: string;
    ticket_url?: string;
    source_url?: string;
    venue_id?: string;
    organizer_id?: string;
    event_id?: string;
    anunciante?: string;
    cupom?: string;
    meta_title?: string;
    meta_description?: string;
    canonical_url?: string;
    meta_image_url?: string;
    share_text?: string;
    editorial_notes?: string;
    location_name?: string;
    address?: string;
    neighborhood?: string;
    latitude?: number;
    longitude?: number;
    price_min?: number;
    price_max?: number;
    ticket_status?: TicketStatus;
    age_rating?: string;
    focal_point_x?: number;
    focal_point_y?: number;
    publish_at?: string;
    unpublish_at?: string;
    preview_token?: string;
    created_by?: string;
    updated_by?: string;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
  };
  occurrences: Array<{
    id?: string;
    agenda_id?: string;
    start_at: string;
    end_at: string;
    created_at?: string;
  }>;
  ticket_tiers: Array<{
    id?: string;
    agenda_id?: string;
    name: string;
    price: number;
    currency: string;
    link?: string;
    available: boolean;
    created_at?: string;
  }>;
  media: Array<{
    id?: string;
    agenda_id?: string;
    url: string;
    alt_text?: string;
    kind: 'image' | 'video';
    position: number;
  }>;
}

interface AgendaFormProps {
  mode: 'create' | 'edit';
}

interface TicketTier {
  id?: string;
  name: string;
  price: number;
  currency: string;
  link?: string;
  available: boolean;
}

interface Occurrence {
  id?: string;
  start_at: string;
  end_at: string;
}

interface MediaItem {
  id?: string;
  url: string;
  alt_text?: string;
  kind: 'image' | 'video';
  position: number;
}

// Helper function to convert empty strings to null
const toNull = <T extends string | undefined>(v: T): T extends string ? string | null : T => {
  return (v == null || v === '') ? null as any : v as any;
};

// Build payload for API submission
const buildPayload = (formData: AgendaFormValues) => ({
  ...formData.item,
  title: toNull(formData.item.title),
  slug: toNull(formData.item.slug),
  city: toNull(formData.item.city),
  subtitle: toNull(formData.item.subtitle),
  summary: toNull(formData.item.summary),
  cover_url: toNull(formData.item.cover_url),
  alt_text: toNull(formData.item.alt_text),
  start_at: toNull(formData.item.start_at),
  end_at: toNull(formData.item.end_at),
  ticket_url: toNull(formData.item.ticket_url),
  source_url: toNull(formData.item.source_url),
  venue_id: toNull(formData.item.venue_id),
  organizer_id: toNull(formData.item.organizer_id),
  event_id: toNull(formData.item.event_id),
  type: toNull(formData.item.type),
  anunciante: toNull(formData.item.anunciante),
  cupom: toNull(formData.item.cupom),
  meta_title: toNull(formData.item.meta_title),
  meta_description: toNull(formData.item.meta_description),
  canonical_url: toNull(formData.item.canonical_url),
  meta_image_url: toNull(formData.item.meta_image_url),
  share_text: toNull(formData.item.share_text),
  editorial_notes: toNull(formData.item.editorial_notes),
  location_name: toNull(formData.item.location_name),
  address: toNull(formData.item.address),
  neighborhood: toNull(formData.item.neighborhood),
  age_rating: toNull(formData.item.age_rating),
  publish_at: toNull(formData.item.publish_at),
  unpublish_at: toNull(formData.item.unpublish_at),
  preview_token: toNull(formData.item.preview_token),
  ticket_status: toNull(formData.item.ticket_status),
  // Keep non-string fields as-is
  priority: formData.item.priority,
  status: formData.item.status,
  visibility_type: formData.item.visibility_type,
  tags: formData.item.tags,
  currency: formData.item.currency,
  accessibility: formData.item.accessibility,
  noindex: formData.item.noindex,
  patrocinado: formData.item.patrocinado,
  latitude: formData.item.latitude,
  longitude: formData.item.longitude,
  price_min: formData.item.price_min,
  price_max: formData.item.price_max,
  focal_point_x: formData.item.focal_point_x,
  focal_point_y: formData.item.focal_point_y,
});

export function AgendaForm({ mode }: AgendaFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [newTag, setNewTag] = useState('');
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | null>(null);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string>('');
  const [currentUpdatedAt, setCurrentUpdatedAt] = useState<string>('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflictData, setConflictData] = useState<any>(null);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [showPublishErrors, setShowPublishErrors] = useState(false);

  // Advanced features hooks
  const { saveSlugChange } = useSlugHistory();
  const { openSecurePreview, isGenerating: isGeneratingPreview } = usePreviewToken();
  const { uploadFile, deleteFile, uploading, uploadProgress } = useStorageUpload();

  const form = useForm<AgendaFormValues>({
    resolver: zodResolver(AgendaDraftSchema),
    defaultValues: {
      item: {
        title: '',
        slug: '',
        city: undefined,
        start_at: undefined,
        end_at: undefined,
        type: undefined,
        priority: 0,
        status: 'draft',
        visibility_type: 'curadoria',
        tags: [],
        currency: 'BRL',
        accessibility: {},
        noindex: false,
        patrocinado: false,
        ticket_status: undefined,
      },
      occurrences: [],
      ticket_tiers: [],
      media: [],
    },
  });

  // Initialize with default occurrences and tiers for demonstration
  useEffect(() => {
    if (mode === 'create') {
      setOccurrences([
        { 
          start_at: '', 
          end_at: '' 
        },
        { 
          start_at: '', 
          end_at: '' 
        }
      ]);
      
      setTicketTiers([
        {
          name: 'Pista',
          price: 50,
          currency: 'BRL',
          available: true
        },
        {
          name: 'VIP',
          price: 100,
          currency: 'BRL',
          available: true
        }
      ]);
    }
  }, [mode]);

  // Watch form data for advanced features
  const formData = form.watch();
  const isDraft = form.watch('item.status') === 'draft';

  // Form actions (need to be defined before hooks)
  const handleSaveDraft = async (data?: any): Promise<void> => {
    try {
      setSaving(true);
      
      const currentFormData = data || form.getValues();
      
      // For draft: only require title and slug
      if (!currentFormData.item?.title?.trim() || !currentFormData.item?.slug?.trim()) {
        toast({
          title: "Campos obrigatórios",
          description: "Título e slug são obrigatórios para salvar rascunho",
          variant: "destructive"
        });
        return;
      }
      
      // Check for slug change and save history
      const currentSlug = currentFormData.item?.slug;
      if (mode === 'edit' && originalSlug && currentSlug !== originalSlug) {
        await saveSlugChange(id!, originalSlug);
        setOriginalSlug(currentSlug);
      }
      
      // Build payload with proper null conversion
      const payload = buildPayload(currentFormData);
      
      // TODO: Replace with actual API call
      // const { error } = await supabase
      //   .from('agenda_itens')
      //   .upsert(payload);
      // if (error) throw error;
      
      // Mock save for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      // Check for conflict
      if (error instanceof Error && error.message.includes('conflict')) {
        setConflictData({
          currentUpdatedAt: currentUpdatedAt,
          serverUpdatedAt: new Date().toISOString(),
          updatedBy: 'Outro usuário'
        });
        setShowConflictDialog(true);
        throw error;
      }
      
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        navigate('/admin-v3/agenda');
      }
    } else {
      navigate('/admin-v3/agenda');
    }
  };

  const handleDuplicate = async () => {
    try {
      const currentData = form.getValues();
      
      // Generate new slug with -2 suffix
      const originalSlug = currentData.item?.slug || '';
      const newSlug = originalSlug.includes('-2') ? 
        originalSlug.replace('-2', '-3') : 
        `${originalSlug}-2`;
      
      // Create duplicate without media
      const duplicateData = {
        ...currentData,
        item: {
          ...currentData.item,
          title: `${currentData.item?.title || ''} (Cópia)`,
          slug: newSlug,
          cover_url: '', // Remove uploaded media
          alt_text: '',
          status: 'draft',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        media: [], // Clear media array
      };
      
      // Mock duplicate - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Item duplicado",
        description: `Novo item criado com slug: ${newSlug}`
      });
      
      // Navigate to edit the new duplicate
      navigate(`/admin-v3/agenda/${newSlug}/edit`);
    } catch (error) {
      toast({
        title: "Erro ao duplicar",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Mock delete - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Item excluído"
      });
      
      navigate('/admin-v3/agenda');
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        variant: "destructive"
      });
    }
  };

  // Advanced features hooks (after functions are defined)
  const { hasChanges: hasAutosaveChanges } = useAutosave({
    data: formData,
    onSave: handleSaveDraft,
    enabled: true,
    isDraft,
  });

  useNavigationGuard({
    hasUnsavedChanges: hasUnsavedChanges || hasAutosaveChanges,
  });

  useKeyboardShortcuts({
    onSave: () => handleSaveDraft(),
    onCancel: handleCancel,
    onDuplicate: mode === 'edit' ? handleDuplicate : () => {},
    onDelete: mode === 'edit' ? () => {
      if (confirm('Deseja realmente excluir este item?')) {
        handleDelete();
      }
    } : () => {},
    enabled: true,
  });

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

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

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const checkSlugExists = async (slug: string, excludeId?: string) => {
    // Mock implementation - replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 300));
    const exists = Math.random() > 0.7; // 30% chance of conflict
    return {
      exists,
      suggestion: exists ? `${slug}-2` : undefined,
    };
  };

  const handleTitleChange = async (title: string) => {
    form.setValue('item.title', title);
    
    // Auto-generate slug if creating new item
    if (mode === 'create' && title.trim()) {
      const slug = generateSlug(title);
      const { exists, suggestion } = await checkSlugExists(slug);
      
      if (exists && suggestion) {
        form.setValue('item.slug', suggestion);
        form.setError('item.slug', {
          message: `Slug "${slug}" já existe. Sugerido: ${suggestion}`
        });
      } else {
        form.setValue('item.slug', slug);
        form.clearErrors('item.slug');
      }
    }
  };

  const handleSlugChange = async (slug: string) => {
    form.setValue('item.slug', slug);
    
    if (slug.trim()) {
      const { exists, suggestion } = await checkSlugExists(slug, id);
      
      if (exists && suggestion) {
        form.setError('item.slug', {
          message: `Slug já existe. Sugerido: ${suggestion}`
        });
      } else {
        form.clearErrors('item.slug');
      }
    }
  };
  // Convert dates between local and UTC
  const toLocalDateTime = (utcString?: string) => {
    if (!utcString) return '';
    try {
      const date = parseISO(utcString);
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  };

  const toUTCString = (localDateTime: string) => {
    if (!localDateTime) return '';
    try {
      const date = new Date(localDateTime);
      return date.toISOString();
    } catch {
      return '';
    }
  };

  // Image upload handlers
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo inválido",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        variant: "destructive"
      });
      return;
    }

    try {
      const uploadedUrl = await uploadFile(file);
      if (uploadedUrl) {
        form.setValue('item.cover_url', uploadedUrl);
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erro no upload",
        variant: "destructive"
      });
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    
    setFocalPoint({ x, y });
    form.setValue('item.focal_point_x', x);
    form.setValue('item.focal_point_y', y);
    
    toast({
      title: "Ponto focal definido"
    });
  };

  const handleRemoveImage = async () => {
    const currentUrl = form.getValues('item.cover_url');
    if (currentUrl) {
      const deleted = await deleteFile(currentUrl);
      if (deleted) {
        form.setValue('item.cover_url', '');
        form.setValue('item.alt_text', '');
        form.setValue('item.focal_point_x', undefined);
        form.setValue('item.focal_point_y', undefined);
        setFocalPoint(null);
        setHasUnsavedChanges(true);
      }
    }
  };

  // Tag management
  const addTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = form.getValues('item.tags') || [];
    if (currentTags.length >= 6) {
      toast({
        title: "Máximo 6 tags",
        variant: "destructive"
      });
      return;
    }
    
    if (newTag.length > 24) {
      toast({
        title: "Tag muito longa",
        variant: "destructive"
      });
      return;
    }
    
    if (currentTags.includes(newTag)) {
      toast({
        title: "Tag já existe",
        variant: "destructive"
      });
      return;
    }
    
    form.setValue('item.tags', [...currentTags, newTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('item.tags') || [];
    form.setValue('item.tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Ticket tier management
  const addTicketTier = () => {
    setTicketTiers([...ticketTiers, {
      name: '',
      price: 0,
      currency: 'BRL',
      link: '',
      available: true
    }]);
  };

  const removeTicketTier = (index: number) => {
    setTicketTiers(ticketTiers.filter((_, i) => i !== index));
  };

  const updateTicketTier = (index: number, field: keyof TicketTier, value: any) => {
    const updated = [...ticketTiers];
    updated[index] = { ...updated[index], [field]: value };
    setTicketTiers(updated);
  };

  // Occurrence management
  const addOccurrence = () => {
    setOccurrences([...occurrences, {
      start_at: '',
      end_at: ''
    }]);
  };

  const removeOccurrence = (index: number) => {
    setOccurrences(occurrences.filter((_, i) => i !== index));
  };

  const updateOccurrence = (index: number, field: keyof Occurrence, value: string) => {
    const updated = [...occurrences];
    updated[index] = { ...updated[index], [field]: value };
    setOccurrences(updated);
  };

  // Validate occurrence duration
  const validateOccurrenceDuration = (start: string, end: string) => {
    if (!start || !end) return true;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return diffMinutes >= 15;
  };

  // Additional form actions
  const handlePublish = async () => {
    try {
      setPublishing(true);
      setShowPublishErrors(false);
      
      // Validate before publishing
      const formData = form.getValues();
      const errors = getPublishValidationErrors(formData);
      
      if (errors.length > 0) {
        setPublishErrors(errors);
        setShowPublishErrors(true);
        setPublishing(false);
        return;
      }
      
      // Build payload and publish
      const payload = buildPayload(formData);
      payload.status = 'published';
      
      // TODO: Replace with actual API call  
      // const { error } = await supabase
      //   .from('agenda_itens')
      //   .upsert(payload);
      // if (error) throw error;
      
      // Mock publish for now
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      form.setValue('item.status', 'published');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Item publicado"
      });
    } catch (error) {
      toast({
        title: "Erro ao publicar",
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      form.setValue('item.status', 'draft');
      await handleSaveDraft();
      
      toast({
        title: "Item despublicado"
      });
    } catch (error) {
      toast({
        title: "Erro ao despublicar",
        variant: "destructive"
      });
    }
  };


  // Conflict resolution handlers
  const handleReloadData = async () => {
    // Mock reload - replace with actual API call
    try {
      const freshData = {}; // Load fresh data from server
      form.reset({
        item: {
          title: '',
          slug: '',
          city: undefined,
          start_at: undefined,
          end_at: undefined,
          type: undefined,
          priority: 0,
          status: 'draft',
          visibility_type: 'curadoria',
          tags: [],
          currency: 'BRL',
          accessibility: {},
          noindex: false,
          patrocinado: false,
          ticket_status: undefined,
        },
        occurrences: [],
        ticket_tiers: [],
        media: [],
      });
      setShowConflictDialog(false);
      setHasUnsavedChanges(false);
      toast({
        title: "Dados recarregados",
        description: "Os dados mais recentes foram carregados do servidor."
      });
    } catch (error) {
      toast({
        title: "Erro ao recarregar",
        variant: "destructive"
      });
    }
  };

  const handleOverwriteData = async () => {
    setShowConflictDialog(false);
    try {
      await handleSaveDraft();
      toast({
        title: "Dados sobrescritos",
        description: "Suas alterações foram salvas com sucesso."
      });
    } catch (error) {
      // Error already handled in handleSaveDraft
    }
  };

  const handlePreview = async () => {
    const currentData = form.getValues();
    const slug = currentData.item?.slug;
    
    if (!slug) {
      toast({
        title: "Slug necessário",
        description: "Defina um slug antes de visualizar.",
        variant: "destructive"
      });
      return;
    }

    if (mode === 'edit' && id) {
      await openSecurePreview(id, slug);
    } else {
      toast({
        title: "Salve primeiro",
        description: "Salve o item antes de visualizar.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Edit Conflict Dialog */}
      <EditConflictDialog
        open={showConflictDialog}
        onReload={handleReloadData}
        onOverwrite={handleOverwriteData}
        conflictData={conflictData}
      />

      {/* Validation Badges */}
      <ValidationBadges formData={formData} mode={mode} />

      {/* Publish Error Summary */}
      <PublishErrorSummary 
        errors={publishErrors}
        onClose={() => setShowPublishErrors(false)}
      />
      {/* Fixed Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b p-4 -mx-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Criar Item' : 'Editar Item'}
              </h1>
              
              {lastSaved && (
                <div className="text-sm text-muted-foreground">
                  Rascunho salvo {format(lastSaved, 'HH:mm:ss')}
                </div>
              )}
              
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="w-3 h-3" />
                  Alterações não salvas
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
              
              {form.watch('item.status') === 'published' && mode === 'edit' && (
                <Button
                  variant="secondary"
                  onClick={handleUnpublish}
                  className="gap-2"
                >
                  Despublicar
                </Button>
              )}
              
              <Button
                onClick={handlePublish}
                disabled={publishing}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {publishing ? 'Publicando...' : 'Publicar'}
              </Button>
              
              {mode === 'edit' && (
                <>
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isGeneratingPreview}
                    className="gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {isGeneratingPreview ? 'Gerando...' : 'Prévia'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleDuplicate}
                    className="gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicar
                  </Button>
                  
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Deseja realmente excluir este item?')) {
                        handleDelete();
                      }
                    }}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          {/* Accordion Sections */}
          <Accordion type="multiple" defaultValue={["basic", "content", "media"]} className="space-y-4">
            
            {/* Básico */}
            <AccordionItem value="basic">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Básico</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="item.title"
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Título *</FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 onChange={(e) => handleTitleChange(e.target.value)}
                                 placeholder="Nome do evento"
                               />
                             </FormControl>
                             <FormMessage />
                             <p className="text-xs text-muted-foreground">Gera slug automaticamente</p>
                           </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="item.slug"
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Slug *</FormLabel>
                             <FormControl>
                               <Input 
                                 {...field} 
                                 onChange={(e) => handleSlugChange(e.target.value)}
                                 placeholder="url-amigavel-do-evento"
                               />
                             </FormControl>
                             <FormMessage />
                             <p className="text-xs text-muted-foreground">URL única para o evento</p>
                           </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="item.city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade *</FormLabel>
                          <Select value={field.value || ''} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a cidade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background z-50">
                              {CITY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="item.start_at"
                        render={({ field }) => (
                           <FormItem>
                             <FormLabel>Data de Início *</FormLabel>
                             <FormControl>
                               <Input
                                 type="datetime-local"
                                 value={toLocalDateTime(field.value)}
                                 onChange={(e) => {
                                   const newValue = toUTCString(e.target.value);
                                   field.onChange(newValue);
                                   
                                   // Validate end date if both are filled
                                   const endAt = form.getValues('item.end_at');
                                   if (endAt) {
                                     const error = validateOccurrence(newValue, endAt);
                                     if (error) {
                                       form.setError('item.end_at', { message: error });
                                     } else {
                                       form.clearErrors('item.end_at');
                                     }
                                   }
                                 }}
                               />
                             </FormControl>
                             <FormMessage />
                             <p className="text-xs text-muted-foreground">Hora local, convertida para UTC</p>
                           </FormItem>
                         )}
                       />
                       
                       <FormField
                         control={form.control}
                         name="item.end_at"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Data de Fim *</FormLabel>
                             <FormControl>
                               <Input
                                 type="datetime-local"
                                 value={toLocalDateTime(field.value)}
                                 onChange={(e) => {
                                   const newValue = toUTCString(e.target.value);
                                   field.onChange(newValue);
                                   
                                   // Validate against start date
                                   const startAt = form.getValues('item.start_at');
                                   if (startAt) {
                                     const error = validateOccurrence(startAt, newValue);
                                     if (error) {
                                       form.setError('item.end_at', { message: error });
                                     } else {
                                       form.clearErrors('item.end_at');
                                     }
                                   }
                                 }}
                               />
                             </FormControl>
                             <FormMessage />
                             <p className="text-xs text-muted-foreground">Mínimo 15 min após início</p>
                           </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="item.type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                       />
                       
                       <FormField
                         control={form.control}
                         name="item.ticket_status"
                         render={({ field }) => (
                           <FormItem>
                             <FormLabel>Status do Ingresso</FormLabel>
                             <FormControl>
                               <Select
                                 value={field.value ?? undefined}
                                 onValueChange={field.onChange}
                               >
                                 <SelectTrigger aria-label="Status do ingresso">
                                   <SelectValue placeholder="Selecionar status" />
                                 </SelectTrigger>
                                 <SelectContent className="bg-background z-50">
                                   {TICKET_STATUS_OPTIONS.map((option) => (
                                     <SelectItem key={option.value} value={option.value}>
                                       {option.label}
                                     </SelectItem>
                                   ))}
                                 </SelectContent>
                               </Select>
                             </FormControl>
                             <FormMessage />
                             <p className="text-xs text-muted-foreground">Status atual dos ingressos</p>
                           </FormItem>
                         )}
                       />
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Conteúdo */}
            <AccordionItem value="content">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Conteúdo</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="item.subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="Descrição breve do evento" />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Máximo 300 caracteres</p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="item.summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resumo</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ''} 
                              placeholder="Descrição completa do evento"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Máximo 500 caracteres. Mínimo 10 para publicar</p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="item.share_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto de Compartilhamento</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ''} 
                              placeholder="Texto para redes sociais"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Máximo 280 caracteres</p>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Ingressos e Preços */}
            <AccordionItem value="tickets">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Ingressos e Preços</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="item.price_min"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Mínimo</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || undefined;
                                  field.onChange(value);
                                  
                                  // Validate price range
                                  const priceMax = form.getValues('item.price_max');
                                  if (value != null && priceMax != null) {
                                    const error = validatePriceRange(value, priceMax);
                                    if (error) {
                                      form.setError('item.price_max', { message: error });
                                    } else {
                                      form.clearErrors('item.price_max');
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground">Em BRL</p>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="item.price_max"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço Máximo</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => {
                                  const value = parseFloat(e.target.value) || undefined;
                                  field.onChange(value);
                                  
                                  // Validate price range
                                  const priceMin = form.getValues('item.price_min');
                                  if (value != null && priceMin != null) {
                                    const error = validatePriceRange(priceMin, value);
                                    if (error) {
                                      form.setError('item.price_max', { message: error });
                                    } else {
                                      form.clearErrors('item.price_max');
                                    }
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground">Deve ser ≥ preço mínimo</p>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="item.currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Moeda</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || 'BRL'} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-muted-foreground">Padrão: BRL</p>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="item.ticket_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Ingressos</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ''} 
                              placeholder="https://exemplo.com/ingressos"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                
                                // Validate URL
                                const error = validateUrl(e.target.value, 'URL de ingressos');
                                if (error) {
                                  form.setError('item.ticket_url', { message: error });
                                } else {
                                  form.clearErrors('item.ticket_url');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Deve começar com http:// ou https://</p>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Ocorrências extras */}
            <AccordionItem value="occurrences">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Ocorrências Extras</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      {occurrences.map((occurrence, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label className="text-sm">Início</Label>
                              <Input
                                type="datetime-local"
                                value={toLocalDateTime(occurrence.start_at)}
                                onChange={(e) => {
                                  const utcValue = toUTCString(e.target.value);
                                  updateOccurrence(index, 'start_at', utcValue);
                                }}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Fim</Label>
                              <Input
                                type="datetime-local"
                                value={toLocalDateTime(occurrence.end_at)}
                                onChange={(e) => {
                                  const utcValue = toUTCString(e.target.value);
                                  updateOccurrence(index, 'end_at', utcValue);
                                }}
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOccurrence(index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addOccurrence}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Ocorrência
                    </Button>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Ticket Tiers */}
            <AccordionItem value="ticket-tiers">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Tiers de Ingressos</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <div className="space-y-3">
                      {ticketTiers.map((tier, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div>
                              <Label className="text-sm">Nome</Label>
                              <Input
                                value={tier.name}
                                onChange={(e) => updateTicketTier(index, 'name', e.target.value)}
                                placeholder="Pista, VIP..."
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Preço</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={tier.price}
                                onChange={(e) => updateTicketTier(index, 'price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            <div>
                              <Label className="text-sm">Moeda</Label>
                              <Input
                                value={tier.currency}
                                onChange={(e) => updateTicketTier(index, 'currency', e.target.value)}
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`available-${index}`}
                                checked={tier.available}
                                onCheckedChange={(checked) => updateTicketTier(index, 'available', checked)}
                              />
                              <Label htmlFor={`available-${index}`} className="text-sm">
                                Disponível
                              </Label>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTicketTier(index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTicketTier}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Tier
                    </Button>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
            <AccordionItem value="media">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Mídia</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    {/* Cover Upload */}
                    <div className="space-y-2">
                      <Label>Capa</Label>
                      
                      {form.watch('item.cover_url') ? (
                        <div className="relative">
                          <img
                            ref={imageRef}
                            src={form.watch('item.cover_url') || ''}
                            alt="Capa"
                            className="w-full max-w-md h-48 object-cover rounded-lg cursor-crosshair"
                            onClick={handleImageClick}
                          />
                          
                          {focalPoint && (
                            <div
                              className="absolute w-3 h-3 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                              style={{
                                left: `${focalPoint.x * 100}%`,
                                top: `${focalPoint.y * 100}%`,
                              }}
                            />
                          )}
                          
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemoveImage}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground mb-1">
                            Clique para enviar uma imagem
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PNG, JPG, JPEG, WebP até 5MB
                          </p>
                        </div>
                      )}
                      
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpg,image/jpeg,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      
                      {uploading && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Enviando...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <Progress value={uploadProgress} />
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">Obrigatória para publicar. Clique na imagem para definir ponto focal</p>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="item.alt_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto Alternativo (obrigatório para publicar)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} placeholder="Descrição da imagem para acessibilidade" />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Descreva a imagem para acessibilidade</p>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Operacional */}
            <AccordionItem value="operational">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Operacional</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="item.source_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Origem</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              value={field.value || ''} 
                              placeholder="https://fonte-original.com"
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                
                                // Validate URL
                                const error = validateUrl(e.target.value, 'URL de origem');
                                if (error) {
                                  form.setError('item.source_url', { message: error });
                                } else {
                                  form.clearErrors('item.source_url');
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Deve começar com http:// ou https://</p>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="item.editorial_notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notas Editoriais</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              value={field.value || ''} 
                              placeholder="Anotações internas"
                              rows={3}
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-xs text-muted-foreground">Visível apenas para editores</p>
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="item.patrocinado"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel>Patrocinado</FormLabel>
                              <p className="text-xs text-muted-foreground">Conteúdo pago</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value || false}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="item.anunciante"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Anunciante</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} placeholder="Nome do anunciante" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="item.cupom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cupom</FormLabel>
                            <FormControl>
                              <Input {...field} value={field.value || ''} placeholder="Código promocional" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

          </Accordion>
        </form>
      </Form>
    </div>
  );
}
