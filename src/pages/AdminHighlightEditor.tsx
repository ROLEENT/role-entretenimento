import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { uploadImage } from '@/lib/simpleUpload';
import { useSupabaseAdminStandard } from '@/hooks/useSupabaseAdminStandard';
import { highlightSchema, type HighlightFormData } from '@/lib/highlightSchema';
import { toast } from 'sonner';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

const AdminHighlightEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [reasons, setReasons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  
  const { createHighlight, updateHighlight, getHighlightById } = useSupabaseAdminStandard();

  const form = useForm<HighlightFormData>({
    resolver: zodResolver(highlightSchema),
    defaultValues: {
      city: 'porto_alegre',
      title: '',
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

  // Verificar acesso de admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        console.log('🔐 Verificando acesso de admin...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('❌ Sem sessão, redirecionando...');
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('user_id', session.user.id)
          .single();

        if (!profile?.is_admin) {
          console.log('❌ Não é admin, redirecionando...');
          navigate('/');
          return;
        }

        console.log('✅ Acesso de admin confirmado');
        setHasAccess(true);
        setAuthChecked(true);
      } catch (error) {
        console.error('❌ Erro na verificação de admin:', error);
        setHasAccess(true); // Em desenvolvimento, permitir acesso
        setAuthChecked(true);
      }
    };

    checkAdminAccess();
  }, [navigate]);

  // Carregar dados do destaque para edição
  useEffect(() => {
    if (authChecked && hasAccess && isEditing && id) {
      console.log('🚀 Iniciando carregamento do destaque...');
      loadHighlight(id);
    }
  }, [authChecked, hasAccess, isEditing, id]);

  const loadHighlight = async (highlightId: string) => {
    try {
      console.log('📋 Iniciando carregamento do destaque:', highlightId);
      setIsLoading(true);
      
      // Validar ID antes de fazer a requisição
      if (!highlightId || highlightId === 'undefined') {
        console.error('❌ ID inválido:', highlightId);
        toast.error('ID do destaque inválido');
        navigate('/admin-v2/highlights');
        return;
      }
      
      const highlight = await getHighlightById(highlightId);
      console.log('📋 Dados carregados:', highlight);
      
      form.reset({
        city: highlight.city,
        title: highlight.event_title,
        venue: highlight.venue,
        ticket_url: highlight.ticket_url || '',
        role_text: highlight.role_text,
        selection_reasons: highlight.selection_reasons || [],
        image_url: highlight.image_url,
        photo_credit: highlight.photo_credit || '',
        event_date: highlight.event_date || '',
        event_time: highlight.event_time || '',
        ticket_price: highlight.ticket_price || '',
        sort_order: highlight.sort_order || 100,
        is_published: highlight.is_published,
      });
      
      setReasons(highlight.selection_reasons || []);
      console.log('✅ Form resetado com sucesso');
    } catch (error) {
      console.error('❌ Erro no loadHighlight:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar destaque';
      toast.error(errorMessage);
      navigate('/admin-v2/highlights');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      const imageUrl = await uploadImage(file, 'highlights', (progress) => {
        setUploadProgress(progress);
      });
      
      form.setValue('image_url', imageUrl);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar imagem');
    } finally {
      setUploadProgress(0);
    }
  };

  const addReason = () => {
    if (newReason.trim() && !reasons.includes(newReason.trim())) {
      const updatedReasons = [...reasons, newReason.trim()];
      setReasons(updatedReasons);
      form.setValue('selection_reasons', updatedReasons);
      setNewReason('');
    }
  };

  const removeReason = (reasonToRemove: string) => {
    const updatedReasons = reasons.filter(reason => reason !== reasonToRemove);
    setReasons(updatedReasons);
    form.setValue('selection_reasons', updatedReasons);
  };

  const onSubmit = async (data: HighlightFormData) => {
    try {
      console.log('📤 Enviando dados:', data);
      setIsLoading(true);
      
      if (isEditing && id) {
        await updateHighlight(id, data);
        toast.success('Destaque atualizado com sucesso!');
      } else {
        await createHighlight(data);
        toast.success('Destaque criado com sucesso!');
      }
      
      navigate('/admin-v2/highlights');
    } catch (error) {
      console.error('❌ Erro no submit:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar destaque');
    } finally {
      setIsLoading(false);
    }
  };

  // Estados de loading mais específicos
  if (!authChecked) {
    console.log('🔐 Verificando acesso...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">Verificando acesso...</span>
      </div>
    );
  }

  if (!hasAccess) {
    console.log('❌ Sem acesso');
    return null; // Já redirecionou
  }

  if (isEditing && isLoading) {
    console.log('📋 Carregando dados do destaque...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
        <span className="ml-2">Carregando destaque...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/admin-v2/highlights')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Destaques
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">
          {isEditing ? 'Editar Destaque' : 'Criar Destaque'}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? 'Edite as informações do destaque' : 'Crie um novo destaque para a plataforma'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Destaque</CardTitle>
          <CardDescription>
            Preencha os dados do evento em destaque
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a cidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.isArray(cities) ? cities.map((city) => (
                            <SelectItem key={city.value} value={String(city.value)}>
                              {city.label}
                            </SelectItem>
                          )) : []}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </div>

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Evento</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título do evento" {...field} />
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
                      <Input placeholder="Digite o local do evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              </div>

              <FormField
                control={form.control}
                name="ticket_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL dos Ingressos</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Role (50-400 caracteres)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o que torna este evento especial..."
                        className="min-h-24"
                        {...field} 
                      />
                    </FormControl>
                    <div className="text-sm text-muted-foreground">
                      {field.value?.length || 0} / 400 caracteres
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Motivos de Seleção</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Adicione um motivo..."
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
                  />
                  <Button type="button" onClick={addReason} variant="outline">
                    Adicionar
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {reasons.map((reason, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {reason}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeReason(reason)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <FormLabel>Imagem do Evento</FormLabel>
                <div className="border-2 border-dashed border-border rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>Selecionar Imagem</span>
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="bg-secondary rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {uploadProgress}% enviado
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {form.watch('image_url') && (
                  <div className="mt-4">
                    <img 
                      src={form.watch('image_url')} 
                      alt="Preview" 
                      className="max-w-xs rounded-lg"
                    />
                  </div>
                )}
              </div>

              <FormField
                control={form.control}
                name="photo_credit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crédito da Foto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do fotógrafo/fonte" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_published"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Publicar Destaque</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        O destaque ficará visível para os visitantes do site
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

              <div className="flex gap-4 pt-6">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? <LoadingSpinner className="mr-2" /> : null}
                  {isEditing ? 'Atualizar Destaque' : 'Criar Destaque'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/admin-v2/highlights')}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminHighlightEditor;