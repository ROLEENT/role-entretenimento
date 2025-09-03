import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RHFDropdownSelect } from '@/components/form/RHFDropdownSelect';
import RHFDateTime from '@/components/form/RHFDateTime';
import { RHFSelectAsync } from '@/components/form/RHFSelectAsync';
import { useVenueSearch } from '@/hooks/useVenueSearch';
import { MapPin } from 'lucide-react';

const CITIES = [
  'São Paulo',
  'Rio de Janeiro',
  'Belo Horizonte',
  'Brasília',
  'Porto Alegre',
  'Recife',
  'Fortaleza',
  'Salvador',
  'Curitiba',
  'Manaus',
  'Belém',
  'Goiânia',
  'Campinas',
  'São Luís',
  'Maceió',
  'Natal',
  'João Pessoa',
  'Teresina',
  'Campo Grande',
  'Cuiabá'
];

export const BasicInfoStep: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  const { searchVenues } = useVenueSearch();
  
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

  // Preparar options para cidades
  const cityOptions = CITIES.map(city => ({
    label: city,
    value: city
  }));

  // Função para carregar venues
  const loadVenues = async () => {
    const venues = await searchVenues('');
    return venues.map(venue => ({
      label: venue.name,
      value: venue.id
    }));
  };

  // Auto-generate slug preview
  React.useEffect(() => {
    if (watchedTitle && !watchedSlug) {
      const autoSlug = watchedTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
        .replace(/^-|-$/g, '');
      
      setValue('slug', autoSlug);
    }
  }, [watchedTitle, watchedSlug, setValue]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Title */}
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Título do Evento *</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome do seu evento"
                  {...field}
                  className="text-lg font-medium"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Subtitle */}
        <FormField
          control={control}
          name="subtitle"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Subtítulo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Subtítulo ou linha de apoio"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Slug */}
        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>URL do Evento</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">meuevent.com/eventos/</span>
                  <Input 
                    placeholder="url-do-evento"
                    {...field}
                    className="font-mono"
                  />
                </div>
              </FormControl>
              <FormDescription>
                URL amigável gerada automaticamente a partir do título
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <FormField
          control={control}
          name="summary"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Resumo</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Breve descrição do evento (máximo 200 caracteres)"
                  {...field}
                  maxLength={200}
                  rows={3}
                />
              </FormControl>
              <FormDescription>
                {field.value?.length || 0}/200 caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <div>
          <RHFDropdownSelect
            name="city"
            label="Cidade *"
            placeholder="Selecione a cidade"
            options={cityOptions}
          />
        </div>

        {/* Start Date */}
        <div>
          <RHFDateTime
            name="date_start"
            label="Data de Início *"
          />
        </div>

        {/* End Date */}
        <div>
          <RHFDateTime
            name="date_end"
            label="Data de Fim"
          />
          <FormDescription>
            Deixe em branco se for evento de um dia
          </FormDescription>
        </div>

        {/* Venue */}
        <div>
          <RHFSelectAsync
            name="venue_id"
            label="Local/Venue"
            placeholder="Buscar venue..."
            loadOptions={loadVenues}
          />
          <FormDescription>
            Busque por venues cadastrados ou deixe em branco para usar local personalizado
          </FormDescription>
        </div>

        {/* Custom Location */}
        <FormField
          control={control}
          name="location_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do Local</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Nome personalizado do local"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Use este campo se não encontrou o venue na busca
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Description */}
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição Completa</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Descrição detalhada do evento, lineup, informações importantes..."
                {...field}
                rows={8}
                className="resize-none"
              />
            </FormControl>
            <FormDescription>
              Descrição completa que aparecerá na página do evento
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};