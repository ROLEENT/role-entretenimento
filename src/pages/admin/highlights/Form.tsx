import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { highlightSchema, type HighlightFormData } from '@/lib/highlightSchema';
import { useAdminV2Auth } from '@/hooks/useAdminV2Auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { HighlightEditSkeleton } from '@/components/HighlightEditSkeleton';
import { ErrorBox } from '@/components/ui/error-box';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminFileUpload } from '@/components/ui/admin-file-upload';
import { useAdminEmail } from '@/hooks/useAdminEmail';
import { SaveButton, PublishButton } from '@/components/ui/admin-button';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Plus, X, Save, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { useToast } from '@/hooks/use-toast';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

interface HighlightFormProps {
  mode: 'create' | 'edit';
}

export default function HighlightForm({ mode }: HighlightFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, status } = useAdminV2Auth();
  const { toast } = useToast();
  const adminEmail = useAdminEmail();
  const [loading, setLoading] = useState(mode === 'edit');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newReason, setNewReason] = useState('');
  const [imagePreview, setImagePreview] = useState<string>('');

  const form = useForm<HighlightFormData>({
    resolver: zodResolver(highlightSchema),
    defaultValues: {
      city: 'porto_alegre',
      event_title: '',
      venue: '',
      ticket_url: '',
      role_text: '',
      selection_reasons: [],
      image_url: '',
      photo_credit: '',
      event_date: '',
      event_time: '',
      ticket_price: '',
      sort_order: 100,
      is_published: false,
    },
  });

  const { watch, setValue, handleSubmit, formState: { errors, isValid } } = form;
  const selectionReasons = watch('selection_reasons');
  const imageUrl = watch('image_url');

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
      if (e.key === 'Escape') {
        navigate('/admin-v2/highlights');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleSubmit, navigate]);

  // Image preview update
  useEffect(() => {
    if (imageUrl) {
      setImagePreview(imageUrl);
    }
  }, [imageUrl]);

  // Carregar dados para edição
  useEffect(() => {
    console.log('[EDIT] status', status, 'id', id, 'user', user?.email);
    
    if (mode === 'edit' && id) {
      console.log('[EDIT] disparando loadHighlight', { id, status, user: user?.email });
      loadHighlight();
    }
  }, [mode, id, status, user?.email]);

  const loadHighlight = async () => {
    if (!id) return;

    // Fallback para email do localStorage se user?.email não estiver disponível
    const saved = JSON.parse(localStorage.getItem('admin-v2-session') || '{}');
    const email = user?.email || saved?.email;
    
    if (!email) {
      console.warn('[EDIT] sem email de admin');
      setLoadError('NO_EMAIL');
      return;
    }

    console.log('[EDIT] chamando RPC', { id, email });
    setLoading(true);
    setLoadError(null);
    
    try {
      const { data, error } = await supabase.rpc('admin_get_highlight_by_id', {
        p_admin_email: email,
        p_highlight_id: id
      });

      if (error) {
        // Tratar erros específicos
        if (error.message?.includes('not found') || error.code === 'PGRST116') {
          setLoadError('HIGHLIGHT_NOT_FOUND');
        } else if (error.message?.includes('denied') || error.code === '42501') {
          setLoadError('ACCESS_DENIED');
        } else {
          setLoadError(`RPC_ERROR: ${error.message}`);
        }
        return;
      }
      
      if (data && data.length > 0) {
        const highlight = data[0];
        
        const formData = {
          city: highlight.city,
          event_title: highlight.event_title || '',
          venue: highlight.venue || '',
          ticket_url: highlight.ticket_url || '',
          role_text: highlight.role_text || '',
          selection_reasons: Array.isArray(highlight.selection_reasons) ? highlight.selection_reasons : ['Padrão'],
          image_url: highlight.image_url || '',
          photo_credit: highlight.photo_credit || '',
          event_date: highlight.event_date || '',
          event_time: highlight.event_time || '',
          ticket_price: highlight.ticket_price || '',
          sort_order: Number(highlight.sort_order) || 100,
          is_published: Boolean(highlight.is_published),
        };
        
        form.reset(formData);
        
        toast({
          title: 'Destaque carregado',
          description: 'Dados carregados com sucesso.',
        });
      } else {
        setLoadError('HIGHLIGHT_NOT_FOUND');
      }
    } catch (error: any) {
      console.error('Error loading highlight:', error);
      setLoadError(`NETWORK_ERROR: ${error?.message || 'Erro de conexão'}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: HighlightFormData) => {
    if (!user?.email) return;

    setSaving(true);
    try {
      if (mode === 'create') {
        const { error } = await supabase.rpc('admin_create_highlight_v2', {
          p_admin_email: user.email,
          p_city: data.city,
          p_event_title: data.event_title,
          p_venue: data.venue,
          p_ticket_url: data.ticket_url || null,
          p_role_text: data.role_text,
          p_selection_reasons: data.selection_reasons,
          p_image_url: data.image_url,
          p_photo_credit: data.photo_credit || null,
          p_event_date: data.event_date || null,
          p_event_time: data.event_time || null,
          p_ticket_price: data.ticket_price || null,
          p_sort_order: data.sort_order || 100,
          p_is_published: data.is_published,
        });

        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('admin_update_highlight_v2', {
          p_admin_email: user.email,
          p_highlight_id: id!,
          p_city: data.city,
          p_event_title: data.event_title,
          p_venue: data.venue,
          p_ticket_url: data.ticket_url || null,
          p_role_text: data.role_text,
          p_selection_reasons: data.selection_reasons,
          p_image_url: data.image_url,
          p_photo_credit: data.photo_credit || null,
          p_event_date: data.event_date || null,
          p_event_time: data.event_time || null,
          p_ticket_price: data.ticket_price || null,
          p_sort_order: data.sort_order || 100,
          p_is_published: data.is_published,
        });

        if (error) throw error;
      }

      toast({
        title: mode === 'create' ? 'Destaque criado!' : 'Destaque atualizado!',
        description: `O destaque foi ${mode === 'create' ? 'criado' : 'atualizado'} com sucesso.`,
      });
      
      navigate('/admin-v2/highlights');
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Ocorreu um erro inesperado.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addReason = () => {
    if (newReason.trim()) {
      const updatedReasons = [...selectionReasons, newReason.trim()];
      setValue('selection_reasons', updatedReasons);
      setNewReason('');
    }
  };

  const removeReason = (index: number) => {
    const updatedReasons = selectionReasons.filter((_, i) => i !== index);
    setValue('selection_reasons', updatedReasons);
  };

  // Guards de carregamento e erro
  if (status === 'loading') {
    return <HighlightEditSkeleton />;
  }

  if (status === 'error') {
    return (
      <ErrorBox
        title="Sessão Expirada"
        message="Sua sessão de administrador expirou. Faça login novamente."
        onBack={() => navigate('/admin-v2/login')}
        type="warning"
      />
    );
  }

  if (mode === 'edit' && !id) {
    return (
      <ErrorBox
        title="ID Inválido"
        message="ID do destaque não foi fornecido na URL."
        onBack={() => navigate('/admin-v2/highlights')}
        type="warning"
      />
    );
  }

  if (loading) {
    return <HighlightEditSkeleton />;
  }

  if (loadError) {
    const getErrorInfo = (error: string) => {
      if (error === 'HIGHLIGHT_NOT_FOUND') {
        return {
          title: 'Destaque Não Encontrado',
          message: 'O destaque solicitado não existe ou foi removido.',
          type: 'warning' as const
        };
      }
      if (error === 'ACCESS_DENIED') {
        return {
          title: 'Acesso Não Autorizado',
          message: 'Você não tem permissão para acessar este destaque.',
          type: 'error' as const
        };
      }
      return {
        title: 'Erro ao Carregar',
        message: 'Não foi possível carregar o destaque.',
        type: 'error' as const
      };
    };

    const errorInfo = getErrorInfo(loadError);
    return (
      <ErrorBox
        title={errorInfo.title}
        message={errorInfo.message}
        details={loadError}
        onRetry={loadHighlight}
        onBack={() => navigate('/admin-v2/highlights')}
        type={errorInfo.type}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <AdminBreadcrumbs />
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin-v2/highlights')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === 'create' ? 'Criar Novo Destaque' : 'Editar Destaque'}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' 
                ? 'Preencha os dados do novo destaque semanal'
                : 'Altere os dados do destaque selecionado'
              }
            </p>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+S</kbd> para salvar • 
          <kbd className="px-2 py-1 bg-muted rounded text-xs ml-1">Esc</kbd> para voltar
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Coluna Esquerda */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map(city => (
                                <SelectItem key={city.value} value={city.value}>
                                  {city.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="event_title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título do Evento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Festa de Ano Novo no Rooftop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Local</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Beira Mar Shopping" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="event_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data do Evento</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="event_time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ticket_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: R$ 50,00" {...field} />
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
                          <FormLabel>Link do Ingresso</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Texto do ROLE</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="role_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Escreva o texto que aparecerá no destaque (50-400 caracteres)..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-sm text-muted-foreground text-right">
                          {field.value?.length || 0}/400 caracteres
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Coluna Direita */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Imagem do Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <AdminFileUpload
                          bucket="highlights"
                          currentUrl={field.value}
                          adminEmail={adminEmail}
                          onUploadComplete={(url) => {
                            field.onChange(url);
                            setImagePreview(url);
                          }}
                          label="Imagem Principal"
                        />
                        {imagePreview && (
                          <div className="mt-3">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-48 object-cover rounded-lg border"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="photo_credit"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Crédito da Foto</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: @fotografo_insta" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Motivos de Seleção</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Adicionar motivo..."
                      value={newReason}
                      onChange={(e) => setNewReason(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
                    />
                    <Button type="button" onClick={addReason} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {selectionReasons.map((reason, index) => (
                      <div key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
                        <span className="text-sm">{reason}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeReason(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {selectionReasons.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Adicione pelo menos um motivo de seleção
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sort_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem de Exibição</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="999"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <FormLabel>Status de Publicação</FormLabel>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={field.value ? "default" : "secondary"}>
                              {field.value ? "Publicado" : "Rascunho"}
                            </Badge>
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
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <SaveButton
              onClick={handleSubmit(onSubmit)}
              disabled={saving || !isValid}
              loadingText="Salvando..."
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar {mode === 'create' ? 'Destaque' : 'Alterações'}
            </SaveButton>

            {mode === 'create' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setValue('is_published', true);
                  handleSubmit(onSubmit)();
                }}
                disabled={saving || !isValid}
              >
                <Eye className="h-4 w-4 mr-2" />
                Salvar e Publicar
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin-v2/highlights')}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>

          {/* Validation errors summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-2">
                Corrija os seguintes erros:
              </p>
              <ul className="text-sm text-destructive space-y-1">
                {Object.entries(errors).map(([field, error]) => (
                  <li key={field}>• {error.message}</li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}