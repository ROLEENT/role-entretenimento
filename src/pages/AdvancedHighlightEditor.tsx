/**
 * @deprecated Use CreateHighlight or EditHighlight from admin-v2/highlights/ instead
 */
import { useState, useEffect, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { FocalPointSelector } from '@/components/highlights/FocalPointSelector';
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
  Search,
  X,
  Upload,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  Keyboard,
  ChevronsUpDown,
  Check
} from 'lucide-react';

// Tipos e schemas
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

type FormData = {
  // Campos básicos
  title: string;
  slug: string;
  city: string;
  subtitle?: string;
  summary?: string;
  start_at: string;
  end_at: string;
  
  // Mídia
  cover_url: string;
  alt_text: string;
  focal_point_x: number;
  focal_point_y: number;
  
  // Publicação
  status: 'draft' | 'published' | 'scheduled';
  publish_at?: string;
  unpublish_at?: string;
  
  // Conteúdo
  ticket_url?: string;
  tags: string[];
  type?: string;
  patrocinado: boolean;
  anunciante?: string;
  cupom?: string;
  priority: number;
  
  // SEO
  meta_title?: string;
  meta_description?: string;
  noindex: boolean;
  
  // Relacionamentos
  event_id?: string;
  organizer_id?: string;
  venue_id?: string;
  
  // Campos legados para compatibilidade
  venue?: string;
  role_text?: string;
  selection_reasons: string[];
  image_url?: string;
  photo_credit?: string;
  event_date?: string;
  event_time?: string;
  ticket_price?: string;
  sort_order: number;
  is_published: boolean;
};

export default function AdvancedHighlightEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  // Estados locais
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newTag, setNewTag] = useState('');
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventSearchOpen, setEventSearchOpen] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(highlightSchema),
    defaultValues: {
      title: '',
      slug: '',
      city: '',
      subtitle: '',
      summary: '',
      start_at: '',
      end_at: '',
      cover_url: '',
      alt_text: '',
      focal_point_x: 0.5,
      focal_point_y: 0.5,
      status: 'draft',
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
      event_id: '',
      organizer_id: '',
      venue_id: '',
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

  // Watch form changes
  const watchedData = form.watch();
  
  // Detectar mudanças
  useEffect(() => {
    const subscription = form.watch(() => {
      setHasUnsavedChanges(true);
      
      // Clear existing timeout
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
      
      // Set new autosave timeout (20 segundos)
      autosaveTimeoutRef.current = setTimeout(() => {
        handleAutosave();
      }, 20000);
    });
    
    return () => {
      subscription.unsubscribe();
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }
    };
  }, []);

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Há alterações não salvas. Deseja sair mesmo assim?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveDraft();
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              handlePublish();
            }
            break;
        }
      }
      
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && 
          document.activeElement?.tagName !== 'INPUT' && 
          document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (form.getValues('title')) {
          handleNewHighlight();
        } else {
          setDuplicateDialogOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  // Load existing data
  useEffect(() => {
    if (isEditing && id) {
      loadHighlight(id);
    }
  }, [id, isEditing]);

  // Load options
  useEffect(() => {
    loadEvents();
    loadOrganizers();
    loadVenues();
  }, []);

  // Utility functions
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  const validateSlug = async (slug: string): Promise<boolean> => {
    if (!slug || slug === form.getValues('slug')) return true;
    
    const { data } = await supabase
      .from('highlights')
      .select('id')
      .eq('slug', slug)
      .neq('id', id || '')
      .limit(1);
    
    return !data || data.length === 0;
  };

  const suggestAlternativeSlug = async (baseSlug: string): Promise<string> => {
    let counter = 2;
    let newSlug = `${baseSlug}-${counter}`;
    
    while (!(await validateSlug(newSlug))) {
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }
    
    return newSlug;
  };

  // Data loading functions
  const loadHighlight = async (highlightId: string) => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          title: data.event_title || '',
          slug: data.slug || '',
          city: data.city || '',
          subtitle: '', // Não existe na tabela atual
          summary: data.summary || '',
          start_at: data.start_at || '',
          end_at: data.end_at || '',
          cover_url: data.cover_url || data.image_url || '',
          alt_text: '', // Não existe na tabela atual
          focal_point_x: 0.5, // Não existe na tabela atual
          focal_point_y: 0.5, // Não existe na tabela atual
          status: data.status || 'draft',
          ticket_url: data.ticket_url || '',
          tags: [], // Não existe na tabela atual
          type: '', // Não existe na tabela atual
          patrocinado: false, // Não existe na tabela atual
          anunciante: '', // Não existe na tabela atual
          cupom: '', // Não existe na tabela atual
          priority: 100, // Não existe na tabela atual
          meta_title: '', // Não existe na tabela atual
          meta_description: '', // Não existe na tabela atual
          noindex: false, // Não existe na tabela atual
          event_id: '', // Não existe na tabela atual
          organizer_id: '', // Não existe na tabela atual
          venue_id: '', // Não existe na tabela atual
          venue: data.venue || '',
          role_text: data.role_text || '',
          selection_reasons: data.selection_reasons || [],
          image_url: data.image_url || '',
          photo_credit: data.photo_credit || '',
          event_date: data.event_date || '',
          event_time: data.event_time || '',
          ticket_price: data.ticket_price || '',
          sort_order: data.sort_order || 100,
          is_published: data.is_published || false
        });
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Erro ao carregar destaque:', error);
      toast.error('Erro ao carregar destaque');
    }
  };

  const loadEvents = async () => {
    try {
      const { data } = await supabase
        .from('events')
        .select('id, title, city, start_at, end_at')
        .eq('status', 'active')
        .order('start_at', { ascending: false })
        .limit(50);
      
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    }
  };

  const loadOrganizers = async () => {
    try {
      const { data } = await supabase
        .from('organizers')
        .select('id, name')
        .order('name')
        .limit(50);
      
      setOrganizers(data || []);
    } catch (error) {
      console.error('Erro ao carregar organizadores:', error);
    }
  };

  const loadVenues = async () => {
    try {
      const { data } = await supabase
        .from('venues')
        .select('id, name')
        .order('name')
        .limit(50);
      
      setVenues(data || []);
    } catch (error) {
      console.error('Erro ao carregar locais:', error);
    }
  };

  // Form handlers
  const handleTitleChange = async (title: string) => {
    const currentSlug = form.getValues('slug');
    if (!currentSlug || currentSlug === generateSlug(form.getValues('title'))) {
      const newSlug = generateSlug(title);
      form.setValue('slug', newSlug);
    }
  };

  const handleSlugBlur = async () => {
    const slug = form.getValues('slug');
    if (!slug) return;

    const isValid = await validateSlug(slug);
    if (!isValid) {
      const newSlug = await suggestAlternativeSlug(slug);
      form.setValue('slug', newSlug);
      toast.warning(`Slug já existe. Sugerido: ${newSlug}`);
      // Focus no campo slug
      const slugField = document.querySelector('input[name="slug"]') as HTMLInputElement;
      if (slugField) {
        slugField.focus();
        slugField.select();
      }
    }
  };

  const handleEventSelection = async (eventId: string) => {
    try {
      const { data } = await supabase
        .from('events')
        .select('city, start_at, end_at, venue_id')
        .eq('id', eventId)
        .single();

      if (data) {
        form.setValue('city', data.city);
        if (data.start_at) form.setValue('start_at', data.start_at);
        if (data.end_at) form.setValue('end_at', data.end_at);
        if (data.venue_id) form.setValue('venue_id', data.venue_id);
        
        toast.success('Dados do evento preenchidos automaticamente');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do evento:', error);
      toast.error('Erro ao carregar dados do evento');
    }
  };

  const addTag = () => {
    const tags = form.getValues('tags') || [];
    const trimmedTag = newTag.trim();
    
    if (!trimmedTag) return;
    
    if (trimmedTag.length > 24) {
      toast.error('Tag deve ter no máximo 24 caracteres');
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      toast.error('Tag já existe');
      return;
    }
    
    if (tags.length >= 6) {
      toast.error('Máximo de 6 tags');
      return;
    }

    form.setValue('tags', [...tags, trimmedTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const tags = form.getValues('tags') || [];
    form.setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setUploadProgress(0);
      
      // Validações
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo deve ter no máximo 5MB');
      }
      
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Tipo de arquivo não suportado. Use PNG, JPG, JPEG ou WebP');
      }
      
      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      // Upload para o bucket admin
      const fileName = `highlight-${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('admin')
        .upload(fileName, file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (error) throw error;
      
      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('admin')
        .getPublicUrl(fileName);
      
      const imageUrl = urlData.publicUrl;
      
      form.setValue('cover_url', imageUrl);
      form.setValue('image_url', imageUrl); // Compatibilidade
      
      // Auto-preencher alt_text se vazio
      if (!form.getValues('alt_text')) {
        const title = form.getValues('title');
        form.setValue('alt_text', title || 'Imagem do evento');
      }
      
      toast.success('Imagem carregada com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImageRemove = () => {
    form.setValue('cover_url', '');
    form.setValue('image_url', '');
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', 0.5);
    form.setValue('focal_point_y', 0.5);
  };

  // Save functions
  const handleAutosave = async () => {
    try {
      const data = form.getValues();
      
      // Só fazer autosave se tiver pelo menos o título
      if (!data.title?.trim()) return;
      
      await saveDraft(data, true);
    } catch (error) {
      console.error('Erro no autosave:', error);
    }
  };

  const saveDraft = async (data: FormData, isAutosave = false) => {
    try {
      if (!isAutosave) setIsLoading(true);
      
      // Validações mínimas para rascunho
      if (!data.title?.trim()) {
        toast.error('Título é obrigatório');
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Mapear dados para a estrutura da tabela
      const highlightData = {
        event_title: data.title.trim(),
        city: data.city,
        venue: data.venue || 'A definir',
        role_text: data.role_text || data.summary || 'Destaque em desenvolvimento',
        selection_reasons: data.selection_reasons.length > 0 
                          ? data.selection_reasons 
                          : (data.tags.length > 0 ? data.tags : ['evento-imperdivel']),
        image_url: data.cover_url || '',
        is_published: false,
        ticket_url: data.ticket_url || null,
        photo_credit: data.photo_credit || null,
        event_date: data.start_at ? new Date(data.start_at).toISOString().split('T')[0] : null,
        event_time: data.event_time || null,
        ticket_price: data.ticket_price || null,
        sort_order: data.priority || 100,
        slug: data.slug || null,
        summary: data.summary || null,
        status: 'draft',
        cover_url: data.cover_url || null,
        start_at: data.start_at || null,
        end_at: data.end_at || null,
        created_by: user.id,
        updated_by: user.id
      };

      let result;
      if (isEditing && id) {
        result = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', id)
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
      
      if (!isAutosave) {
        toast.success('Rascunho salvo com sucesso!');
      }
      
      return result.data;
    } catch (error: any) {
      console.error('Erro ao salvar rascunho:', error);
      if (!isAutosave) {
        toast.error(error.message || 'Erro ao salvar rascunho');
      }
      throw error;
    } finally {
      if (!isAutosave) setIsLoading(false);
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit((data) => saveDraft(data))();
  };

  const handlePublish = () => {
    form.handleSubmit(publish)();
  };

  const publish = async (data: FormData) => {
    try {
      setIsLoading(true);
      
      // Validações rigorosas para publicação
      const errors: string[] = [];
      
      if (!data.title?.trim()) errors.push('Título é obrigatório');
      if (!data.slug?.trim()) errors.push('Slug é obrigatório');
      if (!data.city) errors.push('Cidade é obrigatória');
      if (!data.start_at) errors.push('Data de início é obrigatória');
      if (!data.end_at) errors.push('Data de fim é obrigatória');
      if (!data.cover_url?.trim()) errors.push('Imagem de capa é obrigatória');
      if (data.cover_url && !data.alt_text?.trim()) errors.push('Texto alternativo da imagem é obrigatório');
      
      // Validar datas
      if (data.start_at && data.end_at) {
        const startDate = new Date(data.start_at);
        const endDate = new Date(data.end_at);
        
        if (startDate >= endDate) {
          errors.push('Data de fim deve ser posterior à data de início');
        }
        
        const diffMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
        if (diffMinutes < 15) {
          errors.push('Diferença mínima de 15 minutos entre início e fim');
        }
      }
      
      // Validar URL do ticket
      if (data.ticket_url && !data.ticket_url.startsWith('http')) {
        errors.push('URL do ticket deve começar com http ou https');
      }
      
      // Verificar slug único
      const isSlugValid = await validateSlug(data.slug);
      if (!isSlugValid) {
        errors.push('Slug já existe');
      }
      
      if (errors.length > 0) {
        toast.error('Corrija os erros antes de publicar: ' + errors.join(', '));
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Mapear dados para publicação
      const highlightData = {
        event_title: data.title.trim(),
        city: data.city,
        venue: data.venue || 'A definir',
        role_text: data.role_text || data.summary || 'Destaque selecionado pela equipe ROLE',
        selection_reasons: data.selection_reasons.length > 0 
                          ? data.selection_reasons 
                          : (data.tags.length > 0 ? data.tags : ['evento-imperdivel']),
        image_url: data.cover_url.trim(),
        is_published: true,
        ticket_url: data.ticket_url?.trim() || null,
        photo_credit: data.photo_credit?.trim() || null,
        event_date: data.start_at ? new Date(data.start_at).toISOString().split('T')[0] : null,
        event_time: data.event_time || null,
        ticket_price: data.ticket_price?.trim() || null,
        sort_order: data.priority || 100,
        slug: data.slug.trim(),
        summary: data.summary?.trim() || null,
        status: 'published',
        cover_url: data.cover_url.trim(),
        start_at: data.start_at,
        end_at: data.end_at,
        created_by: user.id,
        updated_by: user.id
      };

      let result;
      if (isEditing && id) {
        result = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', id)
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
    } catch (error: any) {
      console.error('Erro ao publicar destaque:', error);
      toast.error(error.message || 'Erro ao publicar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  // Other handlers
  const handleNewHighlight = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja continuar?')) {
        form.reset();
        setHasUnsavedChanges(false);
      }
    } else {
      form.reset();
    }
  };

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
      const currentCity = form.getValues('city');
      const currentType = form.getValues('type');
      form.reset();
      form.setValue('city', currentCity);
      form.setValue('type', currentType);
      setHasUnsavedChanges(false);
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

  // Quality badges
  const getQualityBadges = () => {
    const badges = [];
    
    if (!watchedData.cover_url) {
      badges.push({ label: 'Sem capa', variant: 'destructive' as const });
    }
    
    if (!watchedData.city) {
      badges.push({ label: 'Sem cidade', variant: 'destructive' as const });
    }
    
    if (watchedData.start_at && watchedData.end_at) {
      const start = new Date(watchedData.start_at);
      const end = new Date(watchedData.end_at);
      if (start >= end) {
        badges.push({ label: 'Datas invertidas', variant: 'destructive' as const });
      }
    }
    
    return badges;
  };

  // Publish checklist
  const getPublishChecklist = () => {
    return [
      { 
        label: 'Título preenchido', 
        completed: !!watchedData.title?.trim(),
        required: true
      },
      { 
        label: 'Slug único', 
        completed: !!watchedData.slug?.trim(),
        required: true
      },
      { 
        label: 'Cidade selecionada', 
        completed: !!watchedData.city,
        required: true
      },
      { 
        label: 'Data de início', 
        completed: !!watchedData.start_at,
        required: true
      },
      { 
        label: 'Data de fim', 
        completed: !!watchedData.end_at,
        required: true
      },
      { 
        label: 'Imagem de capa', 
        completed: !!watchedData.cover_url,
        required: true
      },
      { 
        label: 'Texto alternativo', 
        completed: !watchedData.cover_url || !!watchedData.alt_text?.trim(),
        required: true
      },
      { 
        label: 'Resumo/Descrição', 
        completed: !!watchedData.summary?.trim() || !!watchedData.role_text?.trim(),
        required: false
      },
      { 
        label: 'Tags ou categorias', 
        completed: watchedData.tags.length > 0 || watchedData.selection_reasons.length > 0,
        required: false
      }
    ];
  };

  const qualityBadges = getQualityBadges();
  const publishChecklist = getPublishChecklist();
  const canPublish = publishChecklist.filter(item => item.required).every(item => item.completed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin-v2/highlights')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {isEditing ? 'Editar Destaque' : 'Criar Destaque'}
                </h1>
                {lastSaved && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Rascunho salvo {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isLoading}
                title="Ctrl/Cmd + S"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar rascunho
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={isLoading || !canPublish}
                title="Ctrl/Cmd + Shift + Enter"
                className="bg-[#c77dff] hover:bg-[#b865ff] text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>

              <Button variant="outline" onClick={handleSaveAndCreateAnother}>
                <Plus className="w-4 h-4 mr-2" />
                Salvar e criar outro
              </Button>

              <Button variant="outline" onClick={handleSaveAndReturn}>
                Salvar e voltar
              </Button>

              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>

              <Button
                variant="outline"
                onClick={() => setPreviewDialogOpen(true)}
                disabled={!watchedData.title}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Keyboard className="w-3 h-3" />
              Ctrl+S: Salvar | Ctrl+Shift+Enter: Publicar | N: Novo/Duplicar
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Quality badges */}
        {qualityBadges.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {qualityBadges.map((badge, index) => (
              <Badge key={index} variant={badge.variant} className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna principal - 2/3 */}
              <div className="lg:col-span-2 space-y-6">
                <Accordion type="multiple" defaultValue={["basic", "media"]} className="space-y-4">
                  {/* Básico */}
                  <AccordionItem value="basic" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Básico</span>
                        <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Mídia */}
                  <AccordionItem value="media" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Mídia</span>
                        <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        {/* Upload de imagem */}
                        <div className="space-y-4">
                          <FormLabel>Imagem de Capa *</FormLabel>
                          
                          {!watchedData.cover_url ? (
                            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                              <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                  Arraste uma imagem ou clique para selecionar
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PNG, JPG, JPEG ou WebP - Máximo 5MB
                                </p>
                                <input
                                  type="file"
                                  accept="image/png,image/jpg,image/jpeg,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(file);
                                  }}
                                  className="hidden"
                                  id="image-upload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById('image-upload')?.click()}
                                  disabled={isLoading}
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Selecionar imagem
                                </Button>
                              </div>
                              
                              {uploadProgress > 0 && (
                                <div className="mt-4">
                                  <Progress value={uploadProgress} className="w-full" />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Enviando... {uploadProgress}%
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="relative">
                                <img
                                  src={watchedData.cover_url}
                                  alt="Preview"
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={handleImageRemove}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              
                              <FocalPointSelector
                                imageUrl={watchedData.cover_url}
                                initialX={watchedData.focal_point_x}
                                initialY={watchedData.focal_point_y}
                                onFocalPointChange={(x, y) => {
                                  form.setValue('focal_point_x', x);
                                  form.setValue('focal_point_y', y);
                                }}
                              />
                            </div>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="alt_text"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Texto Alternativo *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Descrição da imagem para acessibilidade"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Obrigatório quando há imagem de capa
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="photo_credit"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Crédito da Foto</FormLabel>
                              <FormControl>
                                <Input placeholder="Fotógrafo ou fonte da imagem" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Publicação */}
                  <AccordionItem value="publication" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Publicação</span>
                        <Badge variant="secondary" className="text-xs">Configurações</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
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
                                  <SelectItem value="scheduled">Agendado</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                0 = maior prioridade
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {watchedData.status === 'scheduled' && (
                          <>
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
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}

                        <FormField
                          control={form.control}
                          name="ticket_url"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>URL dos Ingressos</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://exemplo.com/ingressos"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Deve começar com http ou https
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tags */}
                        <div className="md:col-span-2 space-y-2">
                          <FormLabel>Tags ({watchedData.tags?.length || 0}/6)</FormLabel>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {watchedData.tags?.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                  onClick={() => removeTag(tag)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              placeholder="Nova tag"
                              maxLength={24}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addTag();
                                }
                              }}
                            />
                            <Button type="button" onClick={addTag} disabled={!newTag.trim() || watchedData.tags?.length >= 6}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Máximo 24 caracteres por tag, 6 tags no total
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Evento</FormLabel>
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
                          name="patrocinado"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Patrocinado</FormLabel>
                                <FormDescription>
                                  Marcar como conteúdo patrocinado
                                </FormDescription>
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

                        {watchedData.patrocinado && (
                          <>
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
                                  <FormLabel>Cupom de Desconto</FormLabel>
                                  <FormControl>
                                    <Input placeholder="CODIGO10" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* SEO */}
                  <AccordionItem value="seo" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">SEO</span>
                        <Badge variant="outline" className="text-xs">Opcional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="meta_title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Título ({field.value?.length || 0}/60)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Título para mecanismos de busca"
                                  maxLength={60}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Recomendado até 60 caracteres
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
                              <FormLabel>Meta Descrição ({field.value?.length || 0}/160)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descrição para mecanismos de busca"
                                  maxLength={160}
                                  className="min-h-20"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Recomendado até 160 caracteres
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
                                <FormLabel className="text-base">No Index</FormLabel>
                                <FormDescription>
                                  Não indexar nos mecanismos de busca
                                </FormDescription>
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
                    </AccordionContent>
                  </AccordionItem>

                  {/* Relacionamentos */}
                  <AccordionItem value="relationships" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Relacionamentos</span>
                        <Badge variant="outline" className="text-xs">Opcional</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="event_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Evento Relacionado</FormLabel>
                              <Popover open={eventSearchOpen} onOpenChange={setEventSearchOpen}>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className="w-full justify-between"
                                    >
                                      {field.value
                                        ? events.find((event) => event.id === field.value)?.title
                                        : "Selecione um evento"}
                                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Buscar evento..." />
                                    <CommandEmpty>Nenhum evento encontrado.</CommandEmpty>
                                    <CommandGroup>
                                      {events.map((event) => (
                                        <CommandItem
                                          key={event.id}
                                          value={event.title}
                                          onSelect={() => {
                                            field.onChange(event.id);
                                            handleEventSelection(event.id);
                                            setEventSearchOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              event.id === field.value ? "opacity-100" : "opacity-0"
                                            }`}
                                          />
                                          <div>
                                            <div className="font-medium">{event.title}</div>
                                            <div className="text-sm text-muted-foreground">
                                              {event.city} • {new Date(event.start_at).toLocaleDateString()}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                              <FormDescription>
                                Ao selecionar, cidade e datas serão preenchidas automaticamente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="organizer_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Organizador</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {organizers.map((organizer) => (
                                      <SelectItem key={organizer.id} value={organizer.id}>
                                        {organizer.name}
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
                            name="venue_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Local</FormLabel>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {venues.map((venue) => (
                                      <SelectItem key={venue.id} value={venue.id}>
                                        {venue.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Avançado (campos legados) */}
                  <AccordionItem value="advanced" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Avançado</span>
                        <Badge variant="outline" className="text-xs">Campos legados</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="venue"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local (texto)</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ticket_price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Preço do Ingresso</FormLabel>
                              <FormControl>
                                <Input placeholder="R$ 50,00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="role_text"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Texto ROLE</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Texto descritivo do destaque..."
                                  className="min-h-20"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Sidebar - 1/3 */}
              <div className="space-y-6">
                {/* Checklist de publicação */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Checklist de Publicação
                      {canPublish ? (
                        <Badge className="bg-[#28a745] text-white">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pronto
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {publishChecklist.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {item.completed ? (
                          <CheckCircle className="w-4 h-4 text-[#28a745]" />
                        ) : (
                          <div className={`w-4 h-4 rounded-full border ${item.required ? 'border-[#dc3545]' : 'border-[#ffc107]'}`} />
                        )}
                        <span className={`text-sm ${item.completed ? 'text-foreground' : item.required ? 'text-[#dc3545]' : 'text-[#ffc107]'}`}>
                          {item.label}
                          {item.required && !item.completed && ' *'}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Ações rápidas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setDuplicateDialogOpen(true)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicar de outro destaque
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => setPreviewDialogOpen(true)}
                      disabled={!watchedData.title}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar preview
                    </Button>
                    
                    {isEditing && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => window.open(`/highlights/${watchedData.slug}`, '_blank')}
                        disabled={!watchedData.slug}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver no site
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Info do destaque */}
                {isEditing && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">ID:</span> {id}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span>{' '}
                        <Badge variant={watchedData.status === 'published' ? 'default' : 'secondary'}>
                          {watchedData.status}
                        </Badge>
                      </div>
                      {lastSaved && (
                        <div>
                          <span className="font-medium">Última alteração:</span>{' '}
                          {lastSaved.toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>

      {/* Dialog de preview */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Destaque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {watchedData.cover_url && (
              <img
                src={watchedData.cover_url}
                alt={watchedData.alt_text}
                className="w-full h-48 object-cover rounded-lg"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{watchedData.title}</h2>
              {watchedData.subtitle && (
                <p className="text-lg text-muted-foreground">{watchedData.subtitle}</p>
              )}
            </div>
            {watchedData.summary && (
              <p className="text-muted-foreground">{watchedData.summary}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {watchedData.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary">{tag}</Badge>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Cidade:</span> {cities.find(c => c.value === watchedData.city)?.label}
              </div>
              <div>
                <span className="font-medium">Tipo:</span> {watchedData.type}
              </div>
              {watchedData.start_at && (
                <div>
                  <span className="font-medium">Início:</span> {new Date(watchedData.start_at).toLocaleString()}
                </div>
              )}
              {watchedData.end_at && (
                <div>
                  <span className="font-medium">Fim:</span> {new Date(watchedData.end_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de duplicar */}
      <Dialog open={duplicateDialogOpen} onOpenChange={setDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Destaque</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Buscar destaque para duplicar</label>
              <Input
                placeholder="Digite o título do destaque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                // Implementar busca e duplicação
                setDuplicateDialogOpen(false);
                toast.success('Funcionalidade em desenvolvimento');
              }}
              disabled={!searchQuery.trim()}
            >
              Duplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
