import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ComboboxAsync } from '@/components/ui/combobox-async';
import { useVenueSearch } from '@/hooks/useVenueSearch';

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
  const { searchVenues, getVenueById } = useVenueSearch();
  
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');

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
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidade *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cidade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {city}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          control={control}
          name="date_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Início *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(field.value), "PPP", { locale: ptBR })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Selecione a data</span>
                        </div>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
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

        {/* End Date */}
        <FormField
          control={control}
          name="date_end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Fim</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {format(new Date(field.value), "PPP", { locale: ptBR })}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Mesmo dia</span>
                        </div>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date?.toISOString())}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Deixe em branco se for evento de um dia
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Venue */}
        <FormField
          control={control}
          name="venue_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Local/Venue</FormLabel>
              <FormControl>
                <ComboboxAsync
                  placeholder="Buscar venue..."
                  emptyMessage="Nenhum venue encontrado"
                  searchFunction={searchVenues}
                  getOptionById={getVenueById}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Busque por venues cadastrados ou deixe em branco para usar local personalizado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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