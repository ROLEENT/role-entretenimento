import React, { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventV5Schema, EventV5Form } from '@/schemas/v5/event';
import { useEntityFormV5, useAutosaveV5 } from '@/hooks/v5/useEntityFormV5';
import { FormShellV5 } from './FormShellV5';
import { 
  RHFText,
  RHFTextarea, 
  RHFSlug,
  RHFImageUpload,
  RHFSelect,
  RHFDateTimeUTC,
  RHFComboboxAsync,
  RHFChips
} from './index';
import { supabase } from '@/integrations/supabase/client';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Music, Clock } from 'lucide-react';

interface EventFormV5Props {
  initialData?: Partial<EventV5Form>;
  onSuccess?: (data: any) => void;
  backUrl?: string;
}

export function EventFormV5({ 
  initialData, 
  onSuccess,
  backUrl = '/admin-v3/eventos'
}: EventFormV5Props) {
  const methods = useForm<EventV5Form>({
    resolver: zodResolver(eventV5Schema),
    defaultValues: {
      status: 'draft',
      city: '',
      price_from: 0,
      organizers: [],
      artists: [],
      ...initialData,
    },
  });

  const { watch, setValue } = methods;
  const watchedTitle = watch('title');
  const watchedStatus = watch('status');

  // Generate slug from title
  useEffect(() => {
    if (watchedTitle && !initialData?.slug) {
      const slug = watchedTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
      setValue('slug', slug);
    }
  }, [watchedTitle, setValue, initialData?.slug]);

  const saveForm = useEntityFormV5({
    entityType: 'events',
    onSuccess,
  });

  const autosave = useAutosaveV5({ entityType: 'events' });

  // Search functions for async comboboxes
  const searchVenues = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('venues')
      .select('id, name, city, address')
      .order('name')
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,city.ilike.%${query}%,address.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;
    if (error) {
      console.error('Erro ao buscar venues:', error);
      return [];
    }

    return (data || []).map(venue => ({
      id: venue.id,
      name: venue.name,
      value: venue.id,
      subtitle: `${venue.city} • ${venue.address}`,
    }));
  };

  const searchOrganizers = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('organizers')
      .select('id, name, city')
      .order('name')
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,city.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;
    if (error) {
      console.error('Erro ao buscar organizadores:', error);
      return [];
    }

    return (data || []).map(organizer => ({
      id: organizer.id,
      name: organizer.name,
      value: organizer.id,
      subtitle: organizer.city,
    }));
  };

  const searchArtists = async (query: string): Promise<ComboboxAsyncOption[]> => {
    let supabaseQuery = supabase
      .from('artists')
      .select('id, name, city, genre')
      .order('name')
      .limit(20);

    if (query.trim()) {
      supabaseQuery = supabaseQuery.or(
        `name.ilike.%${query}%,city.ilike.%${query}%,genre.ilike.%${query}%`
      );
    }

    const { data, error } = await supabaseQuery;
    if (error) {
      console.error('Erro ao buscar artistas:', error);
      return [];
    }

    return (data || []).map(artist => ({
      id: artist.id,
      name: artist.name,
      value: artist.id,
      subtitle: `${artist.genre || 'Sem gênero'} • ${artist.city || 'Sem cidade'}`,
    }));
  };

  const handleSubmit = async (data: EventV5Form) => {
    await saveForm.mutateAsync(data);
  };

  const handleAutosave = async (data: EventV5Form) => {
    if (data.title && data.title.length > 3) {
      await autosave.mutateAsync(data);
    }
  };

  const statusOptions = [
    { value: 'draft', label: 'Rascunho' },
    { value: 'scheduled', label: 'Agendado' },
    { value: 'published', label: 'Publicado' },
  ];

  const ageRatingOptions = [
    { value: 'Livre', label: 'Livre' },
    { value: '16', label: '16 anos' },
    { value: '18', label: '18 anos' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <FormShellV5
      title={initialData?.id ? 'Editar Evento' : 'Novo Evento'}
      description="Gerencie todas as informações do seu evento"
      form={methods}
      onSubmit={handleSubmit}
      backUrl={backUrl}
      isSubmitting={saveForm.isPending}
      enableAutosave={true}
      onAutosave={handleAutosave}
    >
      <FormProvider {...methods}>
        <div className="space-y-8">
          
          {/* Informações Básicas */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Calendar className="h-5 w-5" />
              Informações Básicas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFText
                name="title"
                label="Título do Evento"
                placeholder="Nome do seu evento"
                required
              />
              
              <RHFSlug
                name="slug"
                label="URL do Evento"
                table="events"
                generateFrom="title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <RHFSelect
                name="status"
                label="Status"
                options={statusOptions}
              />
              
              <RHFText
                name="city"
                label="Cidade"
                placeholder="São Paulo"
                required
              />
              
              <RHFSelect
                name="age_rating"
                label="Classificação Etária"
                options={ageRatingOptions}
                placeholder="Selecione..."
              />
            </div>

            <RHFTextarea
              name="description"
              label="Descrição"
              placeholder="Descreva seu evento em detalhes..."
              rows={4}
            />
          </div>

          <Separator />

          {/* Data e Horário */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5" />
              Data e Horário
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFDateTimeUTC
                name="start_utc"
                label="Data e Hora de Início"
                required
              />
              
              <RHFDateTimeUTC
                name="end_utc"
                label="Data e Hora de Término"
                required
              />
            </div>

            <RHFText
              name="price_from"
              label="Preço a partir de (R$)"
              type="number"
              placeholder="0"
            />
          </div>

          <Separator />

          {/* Local e Organização */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-5 w-5" />
              Local e Organização
            </div>
            
            <RHFComboboxAsync
              name="venue_id"
              label="Local do Evento"
              placeholder="Buscar local..."
              onSearch={searchVenues}
              emptyText="Nenhum local encontrado"
              createNewText="Criar novo local"
              required={watchedStatus === 'published'}
            />

            <div>
              <p className="text-sm font-medium mb-2">Organizadores</p>
              <RHFChips
                name="organizers"
                placeholder="Digite IDs dos organizadores..."
                description="IDs dos responsáveis pela organização do evento"
                required={watchedStatus === 'published'}
              />
            </div>
          </div>

          <Separator />

          {/* Lineup */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Music className="h-5 w-5" />
              Lineup
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Artistas</p>
              <RHFChips
                name="artists"
                placeholder="Digite IDs dos artistas..."
                description="IDs dos artistas que irão se apresentar"
                required={watchedStatus === 'published'}
              />
            </div>

            <RHFTextarea
              name="lineup_notes"
              label="Observações do Lineup"
              placeholder="Informações adicionais sobre as apresentações..."
              rows={3}
            />
          </div>

          <Separator />

          {/* Imagem de Capa */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5" />
              Imagem de Capa
            </div>
            
            <RHFImageUpload
              name="cover_url"
              altName="cover_alt"
              label="Imagem de Capa"
              bucket="events"
              accept="image/*"
              required={watchedStatus === 'published'}
            />
          </div>

        </div>
      </FormProvider>
    </FormShellV5>
  );
}