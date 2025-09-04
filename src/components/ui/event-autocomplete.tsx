import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  city: string;
  start_at: string;
  end_at: string;
  date_start: string;
  status: string;
}

interface EventAutocompleteProps {
  value?: string;
  onSelect: (event: Event | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EventAutocomplete({ value, onSelect, placeholder = "Buscar evento...", disabled }: EventAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Buscar eventos
  const searchEvents = async (query: string) => {
    if (!query.trim()) {
      setEvents([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, city, start_at, end_at, date_start, status')
        .or(`title.ilike.%${query}%,city.ilike.%${query}%`)
        .eq('status', 'published')
        .order('date_start', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar evento selecionado pelo ID
  useEffect(() => {
    if (value && !selectedEvent) {
      const fetchSelectedEvent = async () => {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, city, start_at, end_at, date_start, status')
          .eq('id', value)
          .maybeSingle();

        if (data && !error) {
          setSelectedEvent(data);
        }
      };
      fetchSelectedEvent();
    }
  }, [value, selectedEvent]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchEvents(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (event: Event) => {
    setSelectedEvent(event);
    onSelect(event);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelectedEvent(null);
    onSelect(null);
    setSearch('');
  };

  const formatEventLabel = (event: Event) => {
    const date = new Date(event.date_start || event.start_at);
    const dateStr = date.toLocaleDateString('pt-BR');
    return `${event.title} • ${event.city} • ${dateStr}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedEvent ? (
            <span className="truncate">{formatEventLabel(selectedEvent)}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              placeholder="Digite para buscar eventos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {selectedEvent && (
              <CommandGroup>
                <CommandItem onSelect={handleClear} className="text-destructive">
                  Limpar seleção
                </CommandItem>
              </CommandGroup>
            )}
            {loading ? (
              <CommandEmpty>Buscando eventos...</CommandEmpty>
            ) : events.length === 0 && search ? (
              <CommandEmpty>Nenhum evento encontrado.</CommandEmpty>
            ) : events.length === 0 ? (
              <CommandEmpty>Digite para buscar eventos.</CommandEmpty>
            ) : (
              <CommandGroup>
                {events.map((event) => (
                  <CommandItem
                    key={event.id}
                    value={event.id}
                    onSelect={() => handleSelect(event)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedEvent?.id === event.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.city} • {new Date(event.date_start || event.start_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}