import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { EventAutocomplete } from '@/components/ui/event-autocomplete';
import { OrganizerAutocomplete } from '@/components/ui/organizer-autocomplete';
import { VenueAutocomplete } from '@/components/ui/venue-autocomplete';
import { HighlightForm } from '@/schemas/highlight';
import { Link2, Calendar, Users, MapPin, Info } from 'lucide-react';
import { toast } from 'sonner';

interface RelationsSectionProps {
  form: UseFormReturn<HighlightForm>;
}

export function RelationsSection({ form }: RelationsSectionProps) {
  
  const handleEventSelect = (event: any) => {
    if (event) {
      // Preencher automaticamente campos relacionados
      const cityMap: Record<string, string> = {
        'Porto Alegre': 'porto_alegre',
        'Florianópolis': 'florianopolis', 
        'Curitiba': 'curitiba',
        'São Paulo': 'sao_paulo',
        'Rio de Janeiro': 'rio_de_janeiro'
      };

      // Mapear cidade
      const mappedCity = cityMap[event.city] || event.city?.toLowerCase().replace(/\s+/g, '_');
      if (mappedCity && ['porto_alegre','florianopolis','curitiba','sao_paulo','rio_de_janeiro'].includes(mappedCity)) {
        form.setValue('city', mappedCity as any);
      }

      // Preencher datas
      if (event.start_at || event.date_start) {
        const startDate = new Date(event.start_at || event.date_start);
        form.setValue('start_at', startDate.toISOString());
      }

      if (event.end_at) {
        const endDate = new Date(event.end_at);
        form.setValue('end_at', endDate.toISOString());
      } else if (event.start_at || event.date_start) {
        // Se não tem end_at, usar start_at + 2 horas como padrão
        const startDate = new Date(event.start_at || event.date_start);
        startDate.setHours(startDate.getHours() + 2);
        form.setValue('end_at', startDate.toISOString());
      }

      form.setValue('event_id', event.id);
      
      toast.success('Evento selecionado! Campos preenchidos automaticamente. Você pode editá-los manualmente.');
    } else {
      form.setValue('event_id', '');
    }
  };

  const handleOrganizerSelect = (organizer: any) => {
    if (organizer) {
      form.setValue('organizer_id', organizer.id);
    } else {
      form.setValue('organizer_id', '');
    }
  };

  const handleVenueSelect = (venue: any) => {
    if (venue) {
      form.setValue('venue_id', venue.id);
    } else {
      form.setValue('venue_id', '');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Relacionamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Evento */}
        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Evento relacionado
              </FormLabel>
              <EventAutocomplete
                value={field.value}
                onSelect={handleEventSelect}
                placeholder="Buscar evento..."
              />
              <FormDescription className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
                <span>
                  Ao selecionar um evento, os campos cidade, data de início e fim serão preenchidos automaticamente.
                  Você pode editá-los manualmente depois.
                </span>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organizador */}
        <FormField
          control={form.control}
          name="organizer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Organizador
              </FormLabel>
              <OrganizerAutocomplete
                value={field.value}
                onSelect={handleOrganizerSelect}
                placeholder="Buscar organizador..."
              />
              <FormDescription>
                Organizador responsável pelo evento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Local */}
        <FormField
          control={form.control}
          name="venue_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Local do evento
              </FormLabel>
              <VenueAutocomplete
                value={field.value}
                onSelect={handleVenueSelect}
                placeholder="Buscar local..."
              />
              <FormDescription>
                Local onde o evento será realizado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
}