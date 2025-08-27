import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { eventSchema, EventFormData } from '@/lib/eventSchema';

interface EventFormProps {
  mode: 'create' | 'edit';
}

const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba', 'Florianópolis'];
const states = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC'];

export default function EventForm({ mode }: EventFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      cover_url: '',
      start_at: '',
      end_at: '',
      venue_id: '',
      city: '',
      state: '',
      external_url: '',
      organizer_id: '',
      price_min: 0,
      price_max: 0,
      tags: [],
      status: 'active',
    },
  });

  useEffect(() => {
    fetchData();
    if (mode === 'edit' && id) {
      fetchEvent(id);
    }
  }, [mode, id]);

  useEffect(() => {
    const description = form.watch('description');
    setCharacterCount(description.length);
  }, [form.watch('description')]);

  const fetchData = async () => {
    try {
      const [venuesRes, organizersRes] = await Promise.all([
        supabase.from('venues').select('id, name, address'),
        supabase.from('organizers').select('id, name')
      ]);

      if (venuesRes.data) setVenues(venuesRes.data);
      if (organizersRes.data) setOrganizers(organizersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          title: data.title,
          description: data.description || '',
          cover_url: data.cover_url || '',
          start_at: data.start_at ? new Date(data.start_at).toISOString().slice(0, 16) : '',
          end_at: data.end_at ? new Date(data.end_at).toISOString().slice(0, 16) : '',
          venue_id: data.venue_id || '',
          city: data.city,
          state: data.state,
          external_url: data.external_url || '',
          organizer_id: data.organizer_id || '',
          price_min: data.price_min || 0,
          price_max: data.price_max || 0,
          tags: data.tags || [],
          status: data.status || 'active',
        });
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o evento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EventFormData) => {
    setLoading(true);
    try {
      const eventData = {
        ...data,
        start_at: new Date(data.start_at).toISOString(),
        end_at: data.end_at ? new Date(data.end_at).toISOString() : null,
        external_url: data.external_url || null,
        organizer_id: data.organizer_id || null,
        price_min: data.price_min || null,
        price_max: data.price_max || null,
      };

      if (mode === 'create') {
        const { error } = await supabase.from('events').insert(eventData);
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Evento criado com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', id);
        if (error) throw error;
        
        toast({
          title: 'Sucesso',
          description: 'Evento atualizado com sucesso!',
        });
      }

      navigate('/admin-v2/events');
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o evento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag && !form.getValues('tags').includes(newTag)) {
      const currentTags = form.getValues('tags');
      form.setValue('tags', [...currentTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  if (loading && mode === 'edit') {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {mode === 'create' ? 'Criar Evento' : 'Editar Evento'}
        </h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Campos Obrigatórios */}
        <Card>
          <CardHeader>
            <CardTitle>Campos Obrigatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Evento *</Label>
                <Input
                  id="title"
                  {...form.register('title')}
                  placeholder="Ex: Festival de Rock"
                />
                {form.formState.errors.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cover_url">URL da Imagem de Capa *</Label>
                <Input
                  id="cover_url"
                  {...form.register('cover_url')}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                {form.formState.errors.cover_url && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.cover_url.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição ({characterCount}/400) *</Label>
              <Textarea
                id="description"
                {...form.register('description')}
                placeholder="Descreva o evento..."
                maxLength={400}
                rows={3}
              />
              {form.formState.errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_at">Data/Hora de Início *</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  {...form.register('start_at')}
                />
                {form.formState.errors.start_at && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.start_at.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="end_at">Data/Hora de Fim</Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  {...form.register('end_at')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="venue_id">Local *</Label>
                <Select onValueChange={(value) => form.setValue('venue_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.venue_id && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.venue_id.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Select onValueChange={(value) => form.setValue('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.city && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="state">Estado *</Label>
                <Select onValueChange={(value) => form.setValue('state', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.state && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="external_url">Link de Ingressos</Label>
              <Input
                id="external_url"
                {...form.register('external_url')}
                placeholder="https://exemplo.com/ingressos"
              />
              {form.formState.errors.external_url && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.external_url.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Campos Complementares */}
        <Card>
          <CardHeader>
            <CardTitle>Campos Complementares</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="organizer_id">Organizador</Label>
              <Select onValueChange={(value) => form.setValue('organizer_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o organizador" />
                </SelectTrigger>
                <SelectContent>
                  {organizers.map((organizer) => (
                    <SelectItem key={organizer.id} value={organizer.id}>
                      {organizer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_min">Preço Mínimo (R$)</Label>
                <Input
                  id="price_min"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('price_min', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="price_max">Preço Máximo (R$)</Label>
                <Input
                  id="price_max"
                  type="number"
                  min="0"
                  step="0.01"
                  {...form.register('price_max', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label>Tags/Categorias</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Adicionar tag..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {form.watch('tags').map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'create' ? 'Criar Evento' : 'Salvar Alterações'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/admin-v2/events')}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}