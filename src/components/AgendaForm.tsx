import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useWatch } from 'react-hook-form';
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
import { SlugInput } from '@/components/ui/slug-input';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useAgendaForm } from '@/hooks/useAgendaForm';
import { 
  VISIBILITY_OPTIONS,
  agendaFormSchema,
  AgendaFormData
} from '@/schemas/agendaForm';

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

// Focal point selector component
const FocalPointSelector = ({ value, onChange, imageUrl }: { 
  value: { x: number; y: number }, 
  onChange: (point: { x: number; y: number }) => void,
  imageUrl: string 
}) => {
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onChange({ x, y });
  };

  return (
    <div className="relative">
      <img
        src={imageUrl}
        alt="Capa do evento"
        className="w-full h-48 object-cover rounded-lg cursor-crosshair"
        onClick={handleImageClick}
      />
      {/* Focal point indicator */}
      <div 
        className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: `${value.x * 100}%`,
          top: `${value.y * 100}%`
        }}
      />
      <p className="text-xs text-muted-foreground mt-2">
        Clique na imagem para definir o ponto focal
      </p>
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

// Image upload component with real upload
const ImageUpload = ({ value, onChange, onFocalPointChange }: { 
  value?: string, 
  onChange: (url: string) => void,
  onFocalPointChange: (x: number, y: number) => void
}) => {
  const { uploadFile, uploading, progress: uploadProgress } = useFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const result = await uploadFile(file, {
        bucket: 'agenda-images',
        folder: 'covers',
        maxSize: 5 * 1024 * 1024,
        allowedTypes: ['image/png', 'image/jpeg', 'image/webp'],
        upsert: true
      });
      
      if (result.url) {
        onChange(result.url);
        toast({
          title: "Upload concluído",
          description: "Imagem enviada com sucesso."
        });
      } else {
        throw new Error(result.error || 'Erro no upload');
      }
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
    }
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
          <FocalPointSelector
            value={{ x: 0.5, y: 0.5 }}
            onChange={(point) => onFocalPointChange(point.x, point.y)}
            imageUrl={value}
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
          >
            <X className="w-4 h-4 mr-2" />
            Remover Imagem
          </Button>
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
  agendaId?: string;
}

export function AgendaForm({ mode, agendaId }: AgendaFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
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
  } = useAgendaForm({ 
    agendaId: agendaId || undefined, 
    mode 
  });
  
  const [accordionValue, setAccordionValue] = useState<string[]>(['basic']);
  
  const formData = form.watch();
  
  // Lock rules based on form data
  const city = useWatch({ control: form.control, name: "city" });
  const coverUrl = useWatch({ control: form.control, name: "cover_url" });
  const status = useWatch({ control: form.control, name: "status" });
  
  // Locking conditions
  const lockMedia = !city || !coverUrl;
  const lockContent = !city;
  const lockSeo = status !== 'published' && !formData.title;
  const lockPublish = !formData.title || !formData.start_at;
  
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
  }, [navigate, handleSaveDraft]);
  
  const handleTitleChange = (title: string) => {
    form.setValue('title', title);
  };
  
  const handleImageUpload = async (file: File) => {
    try {
      const url = await uploadCoverImage(file);
      form.setValue('cover_url', url);
      return url;
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive"
      });
      return null;
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
  
  const handleSaveAndCreateAnother = async () => {
    try {
      await handleSaveDraft();
      navigate('/admin-v3/agenda/create');
    } catch (error) {
      // Error already handled by useAgendaForm
    }
  };
  
  const handleSaveAndGoBack = async () => {
    try {
      await handleSaveDraft();
      navigate('/admin-v3/agenda');
    } catch (error) {
      // Error already handled by useAgendaForm
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Carregando agenda...</span>
      </div>
    );
  }
  
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
                onClick={() => handleSaveDraft()}
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
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[100]">
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
                           <FormLabel>Slug *</FormLabel>
                          <FormControl>
                            <SlugInput
                              value={field.value}
                              onChange={field.onChange}
                              sourceText={form.watch('title')}
                              table="agenda_itens"
                              excludeId={agendaId}
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
                               value={field.value ? (typeof field.value === 'string' ? field.value : field.value.toISOString()) : ''}
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
                               value={field.value ? (typeof field.value === 'string' ? field.value : field.value.toISOString()) : ''}
                               onChange={field.onChange}
                               label="Data de Fim *"
                             />
                            <FormMessage />
                             {formData.start_at && formData.end_at && (
                               (() => {
                                 const start = new Date(formData.start_at);
                                 const end = new Date(formData.end_at);
                                 const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
                                 return diffMinutes < 15;
                               })()
                             ) && (
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
                            <Select value={field.value ?? ""} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent position="popper" className="z-[100]">
                                <SelectItem value="show">Show</SelectItem>
                                <SelectItem value="festa">Festa</SelectItem>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="festival">Festival</SelectItem>
                                <SelectItem value="outro">Outro</SelectItem>
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
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                           <FormLabel>Tags</FormLabel>
                           <FormControl>
                             <ArtistsChipsInput 
                               value={field.value || []} 
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
              <AccordionTrigger className={cn(lockContent && "opacity-60")}>
                Conteúdo e Links
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <fieldset disabled={lockContent} className="contents">
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
                    </fieldset>
                   </CardContent>
                 </Card>
               </AccordionContent>
             </AccordionItem>
            
            {/* Mídia */}
            <AccordionItem value="media">
              <AccordionTrigger className={cn(lockMedia && "opacity-60")}>
                Mídia
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <fieldset disabled={lockMedia} className="contents">
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
                    </fieldset>
                  </CardContent>
                </Card>
              </AccordionContent>
            </AccordionItem>
            
             {/* SEO */}
            <AccordionItem value="seo">
              <AccordionTrigger className={cn(lockSeo && "opacity-60")}>
                SEO
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <fieldset disabled={lockSeo} className="contents">
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
                    </fieldset>
                   </CardContent>
                 </Card>
               </AccordionContent>
             </AccordionItem>
            
             {/* Publicação */}
            <AccordionItem value="publish-checklist">
              <AccordionTrigger className={cn(lockPublish && "opacity-60")}>
                Checklist de Publicação
              </AccordionTrigger>
              <AccordionContent>
                <Card>
                  <CardContent className="p-6">
                    <fieldset disabled={lockPublish} className="contents">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Pronto para publicação!</span>
                      </div>
                    </fieldset>
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
