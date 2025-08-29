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
  GripVertical
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  CITY_OPTIONS, 
  VISIBILITY_OPTIONS,
  AgendaDraftSchema,
  type AgendaDraftData
} from '@/schemas/agenda';

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
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const form = useForm<AgendaDraftData>({
    resolver: zodResolver(AgendaDraftSchema),
    defaultValues: {
      item: {
        title: '',
        slug: '',
        city: '',
        start_at: '',
        end_at: '',
        type: '',
        priority: 0,
        status: 'draft',
        visibility_type: 'curadoria',
        tags: [],
        currency: 'BRL',
        accessibility: {},
        noindex: false,
        patrocinado: false,
      },
      occurrences: [],
      ticket_tiers: [],
      media: [],
    },
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

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        navigate('/admin-v3/agenda');
      }
    } else {
      navigate('/admin-v3/agenda');
    }
  };

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
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Mock upload - replace with actual upload logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileName = `agenda-covers/${Date.now()}-${file.name}`;
      form.setValue('item.cover_url', fileName);
      
      setUploadProgress(100);
      setUploading(false);
      
      toast({
        title: "Imagem enviada"
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
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

  const handleRemoveImage = () => {
    form.setValue('item.cover_url', '');
    form.setValue('item.alt_text', '');
    form.setValue('item.focal_point_x', undefined);
    form.setValue('item.focal_point_y', undefined);
    setFocalPoint(null);
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

  // Form actions
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setSaving(false);
      
      toast({
        title: "Rascunho salvo"
      });
    } catch (error) {
      setSaving(false);
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      
      // Mock publish - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      form.setValue('item.status', 'published');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setPublishing(false);
      
      toast({
        title: "Item publicado"
      });
    } catch (error) {
      setPublishing(false);
      toast({
        title: "Erro ao publicar",
        variant: "destructive"
      });
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

  const handleDuplicate = async () => {
    try {
      // Mock duplicate - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Item duplicado"
      });
      
      navigate('/admin-v3/agenda');
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

  return (
    <div className="space-y-6">
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
                              />
                            </FormControl>
                            <FormMessage />
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
                              />
                            </FormControl>
                            <FormMessage />
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
                                onChange={(e) => field.onChange(toUTCString(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
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
                                onChange={(e) => field.onChange(toUTCString(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
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
                        name="item.priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                max="10"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormItem>
                        <FormLabel>Status do Ingresso</FormLabel>
                        <Select 
                          value={(form.getValues('item') as any)?.ticket_status || ''} 
                          onValueChange={(value: 'free' | 'paid' | 'sold_out' | 'invite_only') => {
                            const currentItem = form.getValues('item');
                            form.setValue('item', { ...currentItem, ticket_status: value });
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background z-50">
                            <SelectItem value="free">Gratuito</SelectItem>
                            <SelectItem value="paid">Pago</SelectItem>
                            <SelectItem value="sold_out">Esgotado</SelectItem>
                            <SelectItem value="invite_only">Apenas convite</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Mídia */}
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
                        </FormItem>
                      )}
                    />
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