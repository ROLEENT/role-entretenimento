import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
import { 
  Save, 
  Send, 
  Copy, 
  ArrowLeft,
  Plus,
  Upload, 
  X, 
  Clock,
  Hash,
  MapPin,
  Image as ImageIcon,
  Eye,
  AlertTriangle,
  CheckCircle,
  Wand2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { OrganizerCombobox } from '@/components/OrganizerCombobox';
import { VenueCombobox } from '@/components/VenueCombobox';
import { 
  VISIBILITY_OPTIONS,
  TYPE_OPTIONS,
  AgendaFormSchema,
  AgendaForm as AgendaFormType
} from '@/schemas/agenda';

// Constants for capitals
const CAPITALS = ['POA', 'SP', 'RJ', 'FLN', 'CWB'] as const;

// City selector component
interface CitySelectorProps {
  value?: string;
  onChange: (value: string) => void;
}

const CitySelector = ({ value, onChange }: CitySelectorProps) => {
  const [mode, setMode] = useState<'capitals' | 'other'>(() => {
    return CAPITALS.includes(value as any) ? 'capitals' : 'other';
  });
  const [otherCity, setOtherCity] = useState(() => {
    return CAPITALS.includes(value as any) ? '' : value || '';
  });

  const handleModeChange = (newMode: 'capitals' | 'other') => {
    setMode(newMode);
    if (newMode === 'capitals') {
      setOtherCity('');
      onChange('POA'); // Default to POA
    } else {
      onChange(otherCity || '');
    }
  };

  const handleCapitalChange = (capital: string) => {
    onChange(capital);
  };

  const handleOtherCityChange = (city: string) => {
    const normalized = city.trim().replace(/\s+/g, ' ');
    setOtherCity(normalized);
    onChange(normalized);
  };

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={mode === 'capitals' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('capitals')}
        >
          Capitais
        </Button>
        <Button
          type="button"
          variant={mode === 'other' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleModeChange('other')}
        >
          Outra cidade
        </Button>
      </div>

      {/* Capital selector */}
      {mode === 'capitals' && (
        <div className="grid grid-cols-5 gap-2">
          {CAPITALS.map((capital) => (
            <Button
              key={capital}
              type="button"
              variant={value === capital ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCapitalChange(capital)}
              className="w-full"
            >
              {capital}
            </Button>
          ))}
        </div>
      )}

      {/* Other city input */}
      {mode === 'other' && (
        <Input
          placeholder="Ex: Belo Horizonte"
          value={otherCity}
          onChange={(e) => handleOtherCityChange(e.target.value)}
          className="w-full"
        />
      )}
    </div>
  );
};

// Status view-only component
const StatusBadge = ({ status }: { status?: string }) => {
  const statusConfig = {
    agendado: { label: 'Agendado', variant: 'secondary' as const },
    ativo: { label: 'Ativo', variant: 'default' as const },
    expirado: { label: 'Expirado', variant: 'destructive' as const },
    incompleto: { label: 'Incompleto', variant: 'outline' as const }
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.incompleto;
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

// Quality badges component
const QualityBadges = ({ formData }: { formData: any }) => {
  const issues = [];
  
  if (!formData.cover_url) issues.push('Sem capa');
  if (!formData.city) issues.push('Sem cidade');
  if (formData.start_at && formData.end_at && new Date(formData.end_at) <= new Date(formData.start_at)) {
    issues.push('Datas invertidas');
  }
  // Note: slug duplication would be checked via API
  
  return (
    <div className="flex gap-2 flex-wrap">
      {issues.map((issue, index) => (
        <Badge key={index} variant="destructive" className="text-xs">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {issue}
        </Badge>
      ))}
      {issues.length === 0 && (
        <Badge variant="default" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          Qualidade OK
        </Badge>
      )}
    </div>
  );
};

// Artists chips input component
const ArtistsChipsInput = ({ value = [], onChange }: { value?: string[], onChange: (value: string[]) => void }) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const addArtist = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || value.includes(trimmed) || value.length >= 12 || trimmed.length > 80) return;
    
    onChange([...value, trimmed]);
    setInputValue('');
  };
  
  const removeArtist = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addArtist(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeArtist(value.length - 1);
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {value.map((artist, index) => (
          <Badge key={index} variant="secondary" className="gap-1">
            {artist}
            <button
              type="button"
              onClick={() => removeArtist(index)}
              className="hover:bg-destructive/20 rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Digite o nome do artista e pressione ENTER" : ""}
          className="border-none shadow-none flex-1 min-w-[200px] h-auto p-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Use ENTER para adicionar. Até 12 nomes. {value.length}/12
      </p>
    </div>
  );
};

// Slug checker component
const SlugChecker = ({ value, onChange, mode }: { value: string, onChange: (value: string) => void, mode: 'create' | 'edit' }) => {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [suggestion, setSuggestion] = useState('');
  
  const checkSlug = useCallback(async (slug: string) => {
    if (!slug.trim() || slug === value) return;
    
    setChecking(true);
    setStatus('checking');
    
    try {
      // TODO: Replace with actual API call to /api/agenda/slug-exists
      await new Promise(resolve => setTimeout(resolve, 500));
      const exists = Math.random() > 0.7; // Mock 30% chance of conflict
      
      if (exists) {
        setStatus('taken');
        setSuggestion(`${slug}-2`);
      } else {
        setStatus('available');
        setSuggestion('');
      }
    } catch (error) {
      setStatus('idle');
    } finally {
      setChecking(false);
    }
  }, [value]);
  
  useEffect(() => {
    if (value.trim()) {
      const timeoutId = setTimeout(() => checkSlug(value), 300);
      return () => clearTimeout(timeoutId);
    } else {
      setStatus('idle');
    }
  }, [value, checkSlug]);
  
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="url-amigavel-do-evento"
            className={cn(
              "pr-8",
              status === 'available' && "border-green-500",
              status === 'taken' && "border-red-500"
            )}
          />
          {checking && (
            <Loader2 className="w-4 h-4 animate-spin absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {!checking && status === 'available' && (
            <CheckCircle className="w-4 h-4 text-green-500 absolute right-2 top-1/2 -translate-y-1/2" />
          )}
          {!checking && status === 'taken' && (
            <AlertTriangle className="w-4 h-4 text-red-500 absolute right-2 top-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      
      {status === 'taken' && suggestion && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-600">Slug já existe.</span>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => onChange(suggestion)}
          >
            Usar: {suggestion}
          </Button>
        </div>
      )}
    </div>
  );
};

// Date time input with UTC conversion and validation
const DateTimeInput = ({ value, onChange, label, placeholder }: { 
  value: string, 
  onChange: (value: string) => void, 
  label: string,
  placeholder?: string 
}) => {
  const toLocalDateTime = (utcString: string) => {
    if (!utcString) return '';
    try {
      const date = new Date(utcString);
      // Convert to local timezone for display
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - (offset * 60000));
      return localDate.toISOString().slice(0, 16);
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
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type="datetime-local"
        value={toLocalDateTime(value)}
        onChange={(e) => onChange(toUTCString(e.target.value))}
        placeholder={placeholder}
      />
    </div>
  );
};

// Image upload with focal point
const ImageUpload = ({ value, onChange, onFocalPointChange }: { 
  value?: string, 
  onChange: (url: string) => void,
  onFocalPointChange: (x: number, y: number) => void
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo inválido. Use PNG, JPG, JPEG ou WebP.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 5MB.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Mock upload with progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // TODO: Replace with actual upload to bucket 'admin'
      const mockUrl = URL.createObjectURL(file);
      onChange(mockUrl);
    } catch (error) {
      alert('Erro no upload');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };
  
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onFocalPointChange(x, y);
  };
  
  const handleRemove = () => {
    onChange('');
    onFocalPointChange(0.5, 0.5);
  };
  
  return (
    <div className="space-y-4">
      {!value ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Enviando...' : 'Enviar Capa'}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            PNG, JPG, JPEG ou WebP até 5MB
          </p>
          {uploading && (
            <Progress value={uploadProgress} className="mt-4" />
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={value}
              alt="Capa do evento"
              className="w-full h-48 object-cover rounded-lg cursor-crosshair"
              onClick={handleImageClick}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Clique na imagem para definir o ponto focal
          </p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
};

interface AgendaFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<AgendaFormType>;
}

export function AgendaForm({ mode, initialData }: AgendaFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [accordionValue, setAccordionValue] = useState<string[]>(['basic']);
  
  const form = useForm<AgendaFormType>({
    resolver: zodResolver(AgendaFormSchema),
    defaultValues: {
      visibility_type: 'curadoria',
      status: 'draft',
      title: '',
      slug: '',
      tags: [],
      artists_names: [],
      priority: 0,
      noindex: false,
      patrocinado: false,
      focal_point_x: 0.5,
      focal_point_y: 0.5,
      ...initialData,
    },
  });
  
  // Watch form changes
  const formData = form.watch();
  
  // Auto-save functionality (every 20s when draft)
  useEffect(() => {
    if (formData.status === 'draft' && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        handleSaveDraft();
      }, 20000);
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, formData.status]);
  
  // Watch form changes to set unsaved flag
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
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        navigate('/admin-v3/agenda/create');
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
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
  
  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
    
    // Auto-generate slug for new items
    if (mode === 'create' && title.trim()) {
      const slug = generateSlug(title);
      form.setValue('slug', slug);
    }
  };
  
  const validateDuration = (startAt: string, endAt: string) => {
    if (!startAt || !endAt) return true;
    const start = new Date(startAt);
    const end = new Date(endAt);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes >= 15;
  };
  
  const getPublishErrors = (data: AgendaFormType) => {
    const errors: string[] = [];
    
    if (!data.title?.trim()) errors.push('Título é obrigatório');
    if (!data.slug?.trim()) errors.push('Slug é obrigatório');
    if (!data.city) errors.push('Cidade é obrigatória');
    if (!data.start_at) errors.push('Data de início é obrigatória');
    if (!data.end_at) errors.push('Data de fim é obrigatória');
    if (!data.cover_url) errors.push('Capa é obrigatória');
    if (!data.alt_text) errors.push('Texto alternativo da capa é obrigatório');
    
    if (data.start_at && data.end_at && !validateDuration(data.start_at, data.end_at)) {
      errors.push('Duração mínima de 15 minutos');
    }
    
    if (data.ticket_url && !data.ticket_url.startsWith('http')) {
      errors.push('URL de ingressos deve começar com http:// ou https://');
    }
    
    if (data.tags && data.tags.length > 6) {
      errors.push('Máximo 6 tags');
    }
    
    if (data.meta_title && data.meta_title.length > 60) {
      errors.push('Meta título muito longo (máx 60 caracteres)');
    }
    
    if (data.meta_description && data.meta_description.length > 160) {
      errors.push('Meta descrição muito longa (máx 160 caracteres)');
    }
    
    if (data.artists_names && data.artists_names.length > 12) {
      errors.push('Máximo 12 artistas');
    }
    
    return errors;
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
  
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const data = form.getValues();
      
      // TODO: Replace with actual API call to POST/PATCH /api/agenda
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Rascunho salvo",
        description: "Suas alterações foram salvas."
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handlePublish = async () => {
    try {
      setPublishing(true);
      const data = form.getValues();
      
      // Validate for publication
      const errors = getPublishErrors(data);
      if (errors.length > 0) {
        setPublishErrors(errors);
        setAccordionValue(['publish-checklist']);
        return;
      }
      
      // TODO: Replace with actual API call to POST /api/agenda/:id/publish
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      form.setValue('status', 'published');
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      
      toast({
        title: "Item publicado",
        description: "O item foi publicado com sucesso."
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
  
  const handleSaveAndCreateAnother = async () => {
    await handleSaveDraft();
    navigate('/admin-v3/agenda/create');
  };
  
  const handleSaveAndGoBack = async () => {
    await handleSaveDraft();
    navigate('/admin-v3/agenda');
  };
  
  return (
    <div className="space-y-6">
      {/* Fixed Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b p-4 -mx-6 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">
                {mode === 'create' ? 'Criar Agenda' : 'Editar Agenda'}
              </h1>
              
              {/* Quality Badges */}
              <QualityBadges formData={formData} />
              
              {/* Status Badge */}
              <StatusBadge status={formData.status} />
              
              {lastSaved && (
                <div className="text-sm text-muted-foreground">
                  Rascunho salvo {lastSaved.toLocaleTimeString()}
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
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={!form.formState.isValid || !form.formState.isDirty || saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={!form.formState.isValid || !form.formState.isDirty || publishing}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {publishing ? 'Publicando...' : 'Publicar'}
              </Button>
              
              {mode === 'create' && (
                <Button
                  variant="outline"
                  onClick={handleSaveAndCreateAnother}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Salvar e criar outro
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleSaveAndGoBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Salvar e voltar
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form className="space-y-6">
          <Accordion 
            type="multiple" 
            value={accordionValue} 
            onValueChange={setAccordionValue}
            className="space-y-4"
          >
            {/* Tipo e Status */}
            <AccordionItem value="type-status">
              <AccordionTrigger>Tipo e Status</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="visibility_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Visibilidade</FormLabel>
                             <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                               <FormControl>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Selecione o tipo" />
                                 </SelectTrigger>
                               </FormControl>
                              <SelectContent>
                                {VISIBILITY_OPTIONS.map((option) => (
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
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Input value={field.value === 'published' ? 'Publicado' : 'Rascunho'} readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="publish_at"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Publicar em (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
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
                            <FormLabel>Despublicar em (opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Básico */}
            <AccordionItem value="basic">
              <AccordionTrigger>Básico</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título *</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e.target.value);
                                handleTitleChange(e.target.value);
                              }}
                              placeholder="Título do evento"
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
                          <FormLabel className="flex items-center gap-2">
                            Slug *
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const title = form.getValues('title');
                                if (title) {
                                  const slug = generateSlug(title);
                                  form.setValue('slug', slug);
                                }
                              }}
                              className="gap-1"
                            >
                              <Wand2 className="w-3 h-3" />
                              Gerar do título
                            </Button>
                          </FormLabel>
                          <FormControl>
                            <SlugChecker 
                              value={field.value} 
                              onChange={field.onChange} 
                              mode={mode}
                            />
                          </FormControl>
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
                          <CitySelector 
                            value={field.value} 
                            onChange={field.onChange} 
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="start_at"
                        render={({ field }) => (
                          <FormItem>
                            <DateTimeInput
                              value={field.value || ''}
                              onChange={field.onChange}
                              label="Data de Início *"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_at"
                        render={({ field }) => (
                          <FormItem>
                            <DateTimeInput
                              value={field.value || ''}
                              onChange={field.onChange}
                              label="Data de Fim *"
                            />
                            <FormMessage />
                            {formData.start_at && formData.end_at && !validateDuration(formData.start_at, formData.end_at) && (
                              <p className="text-sm text-red-600">Duração mínima de 15 minutos</p>
                            )}
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                             <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                               <FormControl>
                                 <SelectTrigger>
                                   <SelectValue placeholder="Selecione o tipo" />
                                 </SelectTrigger>
                               </FormControl>
                              <SelectContent>
                                {TYPE_OPTIONS.map((option) => (
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
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prioridade</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                min="0"
                                max="10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Line-up e Artistas */}
            <AccordionItem value="artists">
              <AccordionTrigger>Line-up e Artistas</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6">
                    <FormField
                      control={form.control}
                      name="artists_names"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Artistas</FormLabel>
                          <FormControl>
                            <ArtistsChipsInput 
                              value={field.value} 
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Conteúdo e Links */}
            <AccordionItem value="content">
              <AccordionTrigger>Conteúdo e Links</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Subtítulo do evento" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="summary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Resumo</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Descrição do evento"
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="ticket_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL de Ingressos</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="https://exemplo.com/ingressos"
                              type="url"
                            />
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
                            <Input {...field} placeholder="DESCONTO10" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Mídia */}
            <AccordionItem value="media">
              <AccordionTrigger>Mídia</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="cover_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Capa do Evento</FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              onFocalPointChange={(x, y) => {
                                form.setValue('focal_point_x', x);
                                form.setValue('focal_point_y', y);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {formData.cover_url && (
                      <FormField
                        control={form.control}
                        name="alt_text"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Texto Alternativo 
                              {formData.status === 'published' && ' *'}
                            </FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Descreva a imagem para acessibilidade"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* SEO */}
            <AccordionItem value="seo">
              <AccordionTrigger>SEO</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Título ({field.value?.length || 0}/60)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Título para SEO"
                              maxLength={60}
                            />
                          </FormControl>
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
                              {...field} 
                              placeholder="Descrição para SEO"
                              maxLength={160}
                              rows={3}
                            />
                          </FormControl>
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
                            <FormLabel className="text-base">
                              Não indexar (noindex)
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Impede que o evento apareça nos resultados de busca
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
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Publicação */}
            <AccordionItem value="publish-checklist">
              <AccordionTrigger>Checklist de Publicação</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6">
                    {publishErrors.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-destructive">
                          Pendências para publicação:
                        </h4>
                        <ul className="space-y-1">
                          {publishErrors.map((error, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-destructive">
                              <AlertTriangle className="w-4 h-4" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pronto para publicação!</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
            {/* Relacionamentos */}
            <AccordionItem value="relationships">
              <AccordionTrigger>Relacionamentos</AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <FormField
                      control={form.control}
                      name="event_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evento (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="ID do evento relacionado"
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="organizer_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organizador (opcional)</FormLabel>
                          <FormControl>
                            <OrganizerCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="venue_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local (opcional)</FormLabel>
                          <FormControl>
                            <VenueCombobox
                              value={field.value}
                              onValueChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </div>
  );
}