import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useSimulationMode } from '@/hooks/useSimulationMode';
import { Loader2, ArrowLeft } from 'lucide-react';
import { 
  getAdvertisement, 
  upsertAdvertisement, 
  type AdvertisementData 
} from '@/lib/repositories/advertisements';

const advertisementSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  cta_text: z.string().min(1, 'Texto do botão é obrigatório'),
  cta_url: z.string().url('URL inválida').optional().or(z.literal('')),
  badge_text: z.string().optional(),
  gradient_from: z.string().min(1, 'Cor inicial é obrigatória'),
  gradient_to: z.string().min(1, 'Cor final é obrigatória'),
  type: z.enum(['card', 'banner', 'newsletter']),
  position: z.number().min(0, 'Posição deve ser maior ou igual a 0'),
  active: z.boolean()
});

type AdvertisementFormData = z.infer<typeof advertisementSchema>;

export default function AdvertisementForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { isSimulating, simulateOperation, isReadOnlyError } = useSimulationMode();

  const isEditing = Boolean(id && id !== 'new');

  const form = useForm<AdvertisementFormData>({
    resolver: zodResolver(advertisementSchema),
    defaultValues: {
      title: '',
      description: '',
      image_url: '',
      cta_text: '',
      cta_url: '',
      badge_text: '',
      gradient_from: '#3B82F6',
      gradient_to: '#8B5CF6',
      type: 'card',
      position: 0,
      active: true
    }
  });

  const watchedFields = form.watch();

  useEffect(() => {
    if (isEditing) {
      loadAdvertisement();
    }
  }, [isEditing, id]);

  const loadAdvertisement = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const advertisement = await getAdvertisement(id);
      form.reset({
        title: advertisement.title,
        description: advertisement.description || '',
        image_url: advertisement.image_url || '',
        cta_text: advertisement.cta_text,
        cta_url: advertisement.cta_url || '',
        badge_text: advertisement.badge_text || '',
        gradient_from: advertisement.gradient_from,
        gradient_to: advertisement.gradient_to,
        type: advertisement.type as 'card' | 'banner' | 'newsletter',
        position: advertisement.position,
        active: advertisement.active
      });
    } catch (error: any) {
      console.error('Error loading advertisement:', error);
      toast.error(error.message || 'Erro ao carregar anúncio');
      navigate('/admin/advertisements');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: AdvertisementFormData) => {
    setSaving(true);
    
    try {
      const advertisementData: AdvertisementData = {
        title: data.title,
        description: data.description || undefined,
        image_url: data.image_url || undefined,
        cta_text: data.cta_text,
        cta_url: data.cta_url || undefined,
        badge_text: data.badge_text || undefined,
        gradient_from: data.gradient_from,
        gradient_to: data.gradient_to,
        type: data.type,
        position: data.position,
        active: data.active
      };

      await upsertAdvertisement(isEditing ? id! : null, advertisementData);
      
      toast.success(
        isEditing 
          ? 'Anúncio atualizado com sucesso!' 
          : 'Anúncio criado com sucesso!'
      );
      navigate('/admin/advertisements');
    } catch (error: any) {
      if (isReadOnlyError(error)) {
        simulateOperation(
          isEditing ? 'Atualização' : 'Criação', 
          'anúncio',
          () => navigate('/admin/advertisements')
        );
      } else {
        console.error('Error saving advertisement:', error);
        toast.error(error.message || 'Erro ao salvar anúncio');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/admin/advertisements')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Editar Anúncio' : 'Novo Anúncio'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing 
              ? 'Atualize as informações do anúncio' 
              : 'Preencha as informações do novo anúncio'
            }
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Anúncio</CardTitle>
            <CardDescription>
              Preencha os dados do anúncio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o título do anúncio" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição do anúncio..." 
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cta_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Botão *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Saiba Mais" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cta_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Botão</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://exemplo.com" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="badge_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Texto do Badge</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Novo, Promoção" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL da Imagem</FormLabel>
                        <FormControl>
                          <Input 
                            type="url" 
                            placeholder="https://exemplo.com/imagem.jpg" 
                            {...field}
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
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="banner">Banner</SelectItem>
                            <SelectItem value="newsletter">Newsletter</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posição</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            placeholder="0"
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
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Anúncio visível na plataforma
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gradient_from"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Inicial do Gradiente *</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gradient_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cor Final do Gradiente *</FormLabel>
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={saving || isSimulating}
                    className="flex-1"
                  >
                    {(saving || isSimulating) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isEditing ? 'Atualizar' : 'Criar'} Anúncio
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/admin/advertisements')}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Visualização do anúncio em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 rounded-lg text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(to right, ${watchedFields.gradient_from}, ${watchedFields.gradient_to})`
              }}
            >
              {watchedFields.badge_text && (
                <Badge variant="secondary" className="mb-3 bg-white/20 text-white border-0">
                  {watchedFields.badge_text}
                </Badge>
              )}
              <h3 className="text-xl font-bold mb-2">
                {watchedFields.title || 'Título do anúncio'}
              </h3>
              {watchedFields.description && (
                <p className="text-white/90 text-sm mb-4">
                  {watchedFields.description}
                </p>
              )}
              <button className="bg-white text-primary px-4 py-2 rounded text-sm font-medium">
                {watchedFields.cta_text || 'Botão'}
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="capitalize">{watchedFields.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posição:</span>
                <span>{watchedFields.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={watchedFields.active ? 'default' : 'secondary'}>
                  {watchedFields.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}