import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useHighlightsManagement, HighlightFormData } from '@/hooks/useHighlightsManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { withAdminAuth } from '@/components/withAdminAuth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

const highlightSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  summary: z.string().optional(),
  city: z.string().min(1, 'Cidade é obrigatória'),
  cover_url: z.string().optional(),
  start_at: z.string().optional(),
  end_at: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
});

interface HighlightFormProps {
  mode: 'create' | 'edit';
}

function HighlightForm({ mode }: HighlightFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    createHighlight, 
    updateHighlight, 
    getHighlight,
    isCreating, 
    isUpdating 
  } = useHighlightsManagement();

  const form = useForm<HighlightFormData>({
    resolver: zodResolver(highlightSchema),
    defaultValues: {
      title: '',
      summary: '',
      city: 'porto_alegre',
      cover_url: '',
      start_at: '',
      end_at: '',
      status: 'draft',
    },
  });

  // Carregar dados para edição
  const { data: highlight, isLoading } = mode === 'edit' && id ? getHighlight(id) : { data: null, isLoading: false };

  React.useEffect(() => {
    if (mode === 'edit' && highlight) {
      console.log('[HIGHLIGHT FORM] Carregando dados para edição:', highlight);
      form.reset({
        title: highlight.title || '',
        summary: highlight.summary || '',
        city: highlight.city || 'porto_alegre',
        cover_url: highlight.cover_url || '',
        start_at: highlight.start_at || '',
        end_at: highlight.end_at || '',
        status: highlight.status || 'draft',
      });
    }
  }, [highlight, mode, form]);

  const onSubmit = async (data: HighlightFormData) => {
    try {
      console.log('[HIGHLIGHT FORM] Salvando highlight:', data);
      
      if (mode === 'create') {
        await createHighlight(data);
      } else if (id) {
        await updateHighlight({ id, data });
      }
      
      navigate('/admin-v2/highlights');
    } catch (error) {
      console.error('[HIGHLIGHT FORM] Erro ao salvar:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" text="Carregando destaque..." />
      </div>
    );
  }

  const isSubmitting = isCreating || isUpdating;

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
                ? 'Preencha os dados do novo destaque'
                : 'Altere os dados do destaque selecionado'
              }
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título *</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título do destaque" {...field} />
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
                        placeholder="Descrição breve do destaque..."
                        className="min-h-[100px]"
                        {...field}
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
                name="cover_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem de Capa</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="https://exemplo.com/imagem.jpg" 
                          {...field} 
                        />
                        <Button type="button" variant="outline" size="icon">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
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
                      <FormLabel>Data/Hora de Início</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
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
                      <FormLabel>Data/Hora de Fim</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publicar Destaque
                      </FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Deixe ativo para publicar imediatamente
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value === 'published'}
                        onCheckedChange={(checked) => 
                          field.onChange(checked ? 'published' : 'draft')
                        }
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin-v2/highlights')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar' : 'Salvar'} Destaque
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default withAdminAuth(HighlightForm, 'editor');