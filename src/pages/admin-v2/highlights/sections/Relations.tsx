import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { HighlightForm } from '@/schemas/highlight';
import { toast } from 'sonner';
import { Link2, Calendar, Building, Users, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RelationsSectionProps {
  form: UseFormReturn<HighlightForm>;
}

interface Event {
  id: string;
  title: string;
  city: string;
  start_at: string;
}

interface Organizer {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
}

export function RelationsSection({ form }: RelationsSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [eventOpen, setEventOpen] = useState(false);
  const [organizerOpen, setOrganizerOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRelationData();
  }, []);

  const loadRelationData = async () => {
    try {
      setLoading(true);
      
      const [eventsRes, organizersRes, venuesRes] = await Promise.all([
        supabase
          .from('events')
          .select('id, title, city, start_at')
          .eq('status', 'active')
          .order('start_at', { ascending: false })
          .limit(100),
        supabase
          .from('organizers')
          .select('id, name')
          .order('name')
          .limit(100),
        supabase
          .from('venues')
          .select('id, name')
          .order('name')
          .limit(100)
      ]);

      if (eventsRes.data) setEvents(eventsRes.data);
      if (organizersRes.data) setOrganizers(organizersRes.data);
      if (venuesRes.data) setVenues(venuesRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados de relacionamento');
    } finally {
      setLoading(false);
    }
  };

  const handleEventSelection = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    form.setValue('event_id', eventId);
    
    // Auto-preencher alguns campos do evento
    if (!form.getValues('title')) {
      form.setValue('title', `Destaque: ${event.title}`);
    }
    
    if (!form.getValues('city')) {
      form.setValue('city', event.city as any);
    }
    
    if (!form.getValues('start_at')) {
      form.setValue('start_at', event.start_at);
    }

    toast.success('Dados do evento aplicados!');
  };

  const selectedEvent = events.find(e => e.id === form.watch('event_id'));
  const selectedOrganizer = organizers.find(o => o.id === form.watch('organizer_id'));
  const selectedVenue = venues.find(v => v.id === form.watch('venue_id'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Relacionamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <FormField
          control={form.control}
          name="event_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Evento Relacionado
              </FormLabel>
              <Popover open={eventOpen} onOpenChange={setEventOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      {selectedEvent
                        ? selectedEvent.title
                        : "Selecionar evento..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar evento..." />
                    <CommandEmpty>Nenhum evento encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {events.map((event) => (
                        <CommandItem
                          key={event.id}
                          value={event.title}
                          onSelect={() => {
                            handleEventSelection(event.id);
                            setEventOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              event.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {event.city} • {new Date(event.start_at).toLocaleDateString()}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Vincular este destaque a um evento específico
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizer_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Organizador
              </FormLabel>
              <Popover open={organizerOpen} onOpenChange={setOrganizerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      {selectedOrganizer
                        ? selectedOrganizer.name
                        : "Selecionar organizador..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar organizador..." />
                    <CommandEmpty>Nenhum organizador encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {organizers.map((organizer) => (
                        <CommandItem
                          key={organizer.id}
                          value={organizer.name}
                          onSelect={() => {
                            form.setValue('organizer_id', organizer.id);
                            setOrganizerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organizer.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {organizer.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="venue_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Local
              </FormLabel>
              <Popover open={venueOpen} onOpenChange={setVenueOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={loading}
                    >
                      {selectedVenue
                        ? selectedVenue.name
                        : "Selecionar local..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar local..." />
                    <CommandEmpty>Nenhum local encontrado.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {venues.map((venue) => (
                        <CommandItem
                          key={venue.id}
                          value={venue.name}
                          onSelect={() => {
                            form.setValue('venue_id', venue.id);
                            setVenueOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              venue.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {venue.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
}