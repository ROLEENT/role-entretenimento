import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAgendaForm } from '@/hooks/useAgendaForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Save, 
  Send, 
  Copy, 
  Trash2, 
  Upload, 
  X, 
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Plus,
  Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  CITY_OPTIONS, 
  STATUS_OPTIONS, 
  VISIBILITY_OPTIONS,
  AgendaFormData 
} from '@/schemas/agendaForm';

interface AgendaFormProps {
  mode: 'create' | 'edit';
}

export function AgendaForm({ mode }: AgendaFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  const [newTag, setNewTag] = useState('');
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number } | null>(null);

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
    checkSlugExists,
    generateSlug,
    uploadCoverImage,
    handleSaveDraft,
    handlePublish,
    handleUnpublish,
    handleDuplicate,
    handleDelete,
  } = useAgendaForm({ 
    agendaId: id, 
    mode 
  });

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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }

      // Esc to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveDraft]);

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (confirm('Há alterações não salvas. Deseja realmente sair?')) {
        navigate('/admin-v3/agenda');
      }
    } else {
      navigate('/admin-v3/agenda');
    }
  };

  const handleTitleChange = async (title: string) => {
    form.setValue('title', title);
    
    // Auto-generate slug if creating new item
    if (mode === 'create' && title.trim()) {
      const slug = generateSlug(title);
      const { exists, suggestion } = await checkSlugExists(slug);
      
      if (exists && suggestion) {
        form.setValue('slug', suggestion);
        form.setError('slug', {
          message: `Slug "${slug}" já existe. Sugerido: ${suggestion}`
        });
      } else {
        form.setValue('slug', slug);
        form.clearErrors('slug');
      }
    }
  };

  const handleSlugChange = async (slug: string) => {
    form.setValue('slug', slug);
    
    if (slug.trim()) {
      const { exists, suggestion } = await checkSlugExists(slug, id);
      
      if (exists && suggestion) {
        form.setError('slug', {
          message: `Slug já existe. Sugerido: ${suggestion}`
        });
      } else {
        form.clearErrors('slug');
      }
    }
  };

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
      const fileName = await uploadCoverImage(file);
      form.setValue('cover_url', fileName);
      
      toast({
        title: "Imagem enviada"
      });
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
    form.setValue('focal_point_x', x);
    form.setValue('focal_point_y', y);
    
    toast({
      title: "Ponto focal definido"
    });
  };

  const handleRemoveImage = () => {
    form.setValue('cover_url', '');
    form.setValue('alt_text', '');
    form.setValue('focal_point_x', undefined);
    form.setValue('focal_point_y', undefined);
    setFocalPoint(null);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const currentTags = form.getValues('tags') || [];
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
    
    form.setValue('tags', [...currentTags, newTag]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
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
                onClick={() => handleSaveDraft()}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>
              
              {form.watch('status') === 'published' && mode === 'edit' && (
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
          {/* Visibility Selector */}
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="visibility_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibilidade</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a visibilidade" />
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
            </CardContent>
          </Card>

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
                        name="title"
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
                        name="slug"
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
                        name="start_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Início *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy HH:mm")
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="end_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Data de Fim *</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy HH:mm")
                                    ) : (
                                      <span>Selecione a data</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
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
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
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
                      name="subtitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subtítulo</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Textarea {...field} rows={4} />
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
                          <FormLabel>URL do Ingresso</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="https://..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Tags (máx. 6)</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(form.watch('tags') || []).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="gap-1">
                            <Hash className="w-3 h-3" />
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1"
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
                          placeholder="Digite uma tag..."
                          maxLength={24}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTag}
                          disabled={(form.watch('tags') || []).length >= 6}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
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
                      
                      {form.watch('cover_url') ? (
                        <div className="relative">
                          <img
                            ref={imageRef}
                            src={form.watch('cover_url')}
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
                      name="alt_text"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Texto Alternativo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Descrição da imagem para acessibilidade" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* SEO */}
            <AccordionItem value="seo">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>SEO</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
                    <FormField
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Título (máx. 60 caracteres)</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={60} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            {(field.value || '').length}/60 caracteres
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Descrição (máx. 160 caracteres)</FormLabel>
                          <FormControl>
                            <Textarea {...field} maxLength={160} rows={3} />
                          </FormControl>
                          <div className="text-xs text-muted-foreground">
                            {(field.value || '').length}/160 caracteres
                          </div>
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
                              Não indexar
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Impedir que mecanismos de busca indexem esta página
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
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Publicação */}
            <AccordionItem value="publication">
              <Card>
                <AccordionTrigger className="px-6 pt-6 pb-2 hover:no-underline">
                  <CardTitle>Publicação</CardTitle>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="pt-0 space-y-4">
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
                              {STATUS_OPTIONS.map((option) => (
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
                        name="publish_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Publicar em</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy HH:mm")
                                    ) : (
                                      <span>Agendar publicação</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unpublish_at"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Despublicar em</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "dd/MM/yyyy HH:mm")
                                    ) : (
                                      <span>Agendar despublicação</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
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