import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { highlightSchema, type HighlightFormData } from '@/lib/highlightSchema';

const cities = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
];

export default function AdminSimpleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [loading, setLoading] = useState(false);
  const [reasons, setReasons] = useState<string[]>([]);
  const [newReason, setNewReason] = useState('');

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

  useEffect(() => {
    if (isEditing && id) {
      loadHighlight(id);
    }
  }, [id, isEditing]);

  const loadHighlight = async (highlightId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          city: data.city,
          title: data.event_title,
          venue: data.venue,
          ticket_url: data.ticket_url || '',
          role_text: data.role_text,
          selection_reasons: data.selection_reasons || [],
          image_url: data.image_url,
          photo_credit: data.photo_credit || '',
          event_date: data.event_date || '',
          event_time: data.event_time || '',
          ticket_price: data.ticket_price || '',
          sort_order: data.sort_order || 100,
          is_published: data.is_published,
        });
        setReasons(data.selection_reasons || []);
      }
    } catch (error) {
      console.error('Erro ao carregar:', error);
      toast.error('Erro ao carregar destaque');
      navigate('/admin-simple');
    } finally {
      setLoading(false);
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

  const removeReason = (index: number) => {
    const updatedReasons = reasons.filter((_, i) => i !== index);
    setReasons(updatedReasons);
    form.setValue('selection_reasons', updatedReasons);
  };

  const onSubmit = async (data: HighlightFormData) => {
    try {
      setLoading(true);

      const highlightData = {
        ...data,
        selection_reasons: reasons,
        ticket_url: data.ticket_url || null,
        photo_credit: data.photo_credit || null,
        event_date: data.event_date || null,
        event_time: data.event_time || null,
        ticket_price: data.ticket_price || null,
      };

      if (isEditing && id) {
        const { error } = await supabase
          .from('highlights')
          .update(highlightData)
          .eq('id', id);

        if (error) throw error;
        toast.success('Destaque atualizado!');
      } else {
        const { error } = await supabase
          .from('highlights')
          .insert([highlightData]);

        if (error) throw error;
        toast.success('Destaque criado!');
      }

      navigate('/admin-simple');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar destaque');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/admin-simple">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? 'Editar Destaque' : 'Novo Destaque'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Select
                    value={form.watch('city')}
                    onValueChange={(value) => form.setValue('city', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título do Evento</Label>
                  <Input
                    {...form.register('title')}
                    placeholder="Nome do evento"
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="venue">Local</Label>
                  <Input
                    {...form.register('venue')}
                    placeholder="Nome do local"
                  />
                  {form.formState.errors.venue && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.venue.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_url">URL dos Ingressos</Label>
                  <Input
                    {...form.register('ticket_url')}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role_text">Descrição ROLE</Label>
                <Textarea
                  {...form.register('role_text')}
                  placeholder="Descreva o evento..."
                  rows={4}
                />
                {form.formState.errors.role_text && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.role_text.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Motivos da Seleção</Label>
                <div className="flex gap-2">
                  <Input
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="Adicionar motivo..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
                  />
                  <Button type="button" onClick={addReason} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reasons.map((reason, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm"
                    >
                      {reason}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReason(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  {...form.register('image_url')}
                  placeholder="https://..."
                />
                {form.formState.errors.image_url && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.image_url.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_date">Data</Label>
                  <Input
                    {...form.register('event_date')}
                    type="date"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event_time">Horário</Label>
                  <Input
                    {...form.register('event_time')}
                    type="time"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket_price">Preço</Label>
                  <Input
                    {...form.register('ticket_price')}
                    placeholder="R$ 50,00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch('is_published')}
                  onCheckedChange={(checked) => form.setValue('is_published', checked)}
                />
                <Label>Publicar destaque</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
                </Button>
                <Link to="/admin-simple">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}