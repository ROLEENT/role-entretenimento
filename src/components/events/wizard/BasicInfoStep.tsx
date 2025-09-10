import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
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
import { SelectionReasonsManager } from './SelectionReasonsManager';
import { CuratorialCriteria } from '@/components/admin/events/CuratorialCriteria';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Hook para buscar cidades da base de dados
const useCities = () => {
  const [cities, setCities] = useState<Array<{ id: string; name: string; uf?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('agenda_cities')
          .select('id, name, uf')
          .order('name');

        if (!error && data) {
          setCities(data);
        } else {
          // Fallback para lista de cidades básicas
          setCities([
            { id: '1', name: 'São Paulo', uf: 'SP' },
            { id: '2', name: 'Rio de Janeiro', uf: 'RJ' },
            { id: '3', name: 'Belo Horizonte', uf: 'MG' },
            { id: '4', name: 'Salvador', uf: 'BA' },
            { id: '5', name: 'Brasília', uf: 'DF' },
            { id: '6', name: 'Recife', uf: 'PE' },
            { id: '7', name: 'Fortaleza', uf: 'CE' },
            { id: '8', name: 'Porto Alegre', uf: 'RS' },
            { id: '9', name: 'Curitiba', uf: 'PR' },
            { id: '10', name: 'Manaus', uf: 'AM' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        // Fallback mesmo em caso de erro
        setCities([
          { id: '1', name: 'São Paulo', uf: 'SP' },
          { id: '2', name: 'Rio de Janeiro', uf: 'RJ' },
          { id: '3', name: 'Belo Horizonte', uf: 'MG' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading };
};

// helpers
const toISO = (v?: Date | string | null) =>
  v ? new Date(v).toISOString() : '';

const fromISO = (iso?: string | null) =>
  iso ? new Date(iso) : undefined;

export const BasicInfoStep: React.FC = () => {
  const methods = useFormContext<EventFormData>();
  const { control, watch, setValue } = methods;
  const { cities, loading: citiesLoading } = useCities();
  const { user } = useAuth(); // Para verificar permissões de admin/editor
  
  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const highlightType = watch('highlight_type');

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
                  className="font-mono flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (watchedTitle) {
                      const newSlug = watchedTitle
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-')
                        .trim()
                        .replace(/^-|-$/g, '');
                      setValue('slug', newSlug);
                    }
                  }}
                  disabled={!watchedTitle}
                >
                  Gerar
                </Button>
              </div>
            </FormControl>
            <FormDescription>
              URL amigável - clique em "Gerar" para criar automaticamente a partir do título
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
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.name}>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {city.name} {city.uf && `- ${city.uf}`}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

      </div>

      {/* Highlight Type */}
      <FormField
        control={control}
        name="highlight_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Categoria de Destaque</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de destaque" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">Sem destaque</SelectItem>
                <SelectItem value="curatorial">Destaque Curatorial</SelectItem>
                <SelectItem value="vitrine">Vitrine Cultural</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Selection Reasons - Only for curatorial highlights */}
      <SelectionReasonsManager />

      {/* Critérios de Curadoria - Only for curatorial highlights and admin/editor users */}
      {highlightType === 'curatorial' && user && (
        <CuratorialCriteria form={methods} />
      )}

      {/* Tags */}
      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags (máx. 12)</FormLabel>
            <FormControl>
              <Input 
                placeholder="festa, eletrônica, techno, house (separadas por vírgula)"
                value={field.value?.join(', ') || ''}
                onChange={(e) => {
                  const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean).slice(0, 12);
                  field.onChange(tags);
                }}
              />
            </FormControl>
            <FormDescription>
              Palavras-chave para classificar o evento, separadas por vírgula
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Genres */}
      <FormField
        control={control}
        name="genres"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Gêneros Musicais (máx. 12)</FormLabel>
            <FormControl>
              <Input 
                placeholder="techno, house, trance, progressive (separados por vírgula)"
                value={field.value?.join(', ') || ''}
                onChange={(e) => {
                  const genres = e.target.value.split(',').map(genre => genre.trim()).filter(Boolean).slice(0, 12);
                  field.onChange(genres);
                }}
              />
            </FormControl>
            <FormDescription>
              Gêneros musicais do evento, separados por vírgula
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Age Rating */}
      <FormField
        control={control}
        name="age_rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Classificação Etária</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a classificação" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="L">Livre</SelectItem>
                <SelectItem value="10">10 anos</SelectItem>
                <SelectItem value="12">12 anos</SelectItem>
                <SelectItem value="14">14 anos</SelectItem>
                <SelectItem value="16">16 anos</SelectItem>
                <SelectItem value="18">18 anos</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Age Notes */}
      <FormField
        control={control}
        name="age_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações sobre Classificação</FormLabel>
            <FormControl>
              <Input 
                placeholder="Ex: Menores de 18 anos acompanhados dos pais"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Informações adicionais sobre restrições etárias
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />



      {/* Series and Edition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="series_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Série do Evento</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Festival de Verão, Noites Eletrônicas..."
                  value={field.value || ''}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Deixe em branco se for evento único
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="edition_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número da Edição</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Número da edição (obrigatório se for série)
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