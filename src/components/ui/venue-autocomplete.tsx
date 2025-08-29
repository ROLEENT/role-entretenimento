import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Venue {
  id: string;
  name: string;
  address?: string;
  city?: string;
  capacity?: string;
}

interface VenueAutocompleteProps {
  value?: string;
  onSelect: (venue: Venue | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VenueAutocomplete({ value, onSelect, placeholder = "Buscar local...", disabled }: VenueAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  // Buscar venues
  const searchVenues = async (query: string) => {
    if (!query.trim()) {
      setVenues([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('id, name, address, city, capacity')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%,city.ilike.%${query}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Erro ao buscar locais:', error);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar venue selecionado pelo ID
  useEffect(() => {
    if (value && !selectedVenue) {
      const fetchSelectedVenue = async () => {
        const { data, error } = await supabase
          .from('venues')
          .select('id, name, address, city, capacity')
          .eq('id', value)
          .maybeSingle();

        if (data && !error) {
          setSelectedVenue(data);
        }
      };
      fetchSelectedVenue();
    }
  }, [value, selectedVenue]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchVenues(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (venue: Venue) => {
    setSelectedVenue(venue);
    onSelect(venue);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelectedVenue(null);
    onSelect(null);
    setSearch('');
  };

  const formatVenueLabel = (venue: Venue) => {
    const parts = [venue.name];
    if (venue.city) parts.push(venue.city);
    if (venue.capacity) parts.push(`Cap: ${venue.capacity}`);
    return parts.join(' • ');
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
          {selectedVenue ? (
            <span className="truncate">{formatVenueLabel(selectedVenue)}</span>
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
              placeholder="Digite para buscar locais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {selectedVenue && (
              <CommandGroup>
                <CommandItem onSelect={handleClear} className="text-destructive">
                  Limpar seleção
                </CommandItem>
              </CommandGroup>
            )}
            {loading ? (
              <CommandEmpty>Buscando locais...</CommandEmpty>
            ) : venues.length === 0 && search ? (
              <CommandEmpty>Nenhum local encontrado.</CommandEmpty>
            ) : venues.length === 0 ? (
              <CommandEmpty>Digite para buscar locais.</CommandEmpty>
            ) : (
              <CommandGroup>
                {venues.map((venue) => (
                  <CommandItem
                    key={venue.id}
                    value={venue.id}
                    onSelect={() => handleSelect(venue)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedVenue?.id === venue.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{venue.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {venue.address && <span>{venue.address}</span>}
                        {venue.address && venue.city && <span> • </span>}
                        {venue.city && <span>{venue.city}</span>}
                        {venue.capacity && <span> • Cap: {venue.capacity}</span>}
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