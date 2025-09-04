import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, MapPin, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Venue {
  id: string;
  name: string;
  city?: string;
  address?: string;
}

interface VenueSelectorProps {
  value?: string;
  onSelect: (venue: Venue | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function VenueSelector({ 
  value, 
  onSelect, 
  placeholder = "Selecionar Local", 
  disabled 
}: VenueSelectorProps) {
  const [open, setOpen] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [search, setSearch] = useState('');

  // Buscar venues
  const searchVenues = async (query: string = '') => {
    console.log('DEBUG: Searching venues with query:', query);
    setLoading(true);
    try {
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
        setVenues([]);
        return;
      }

      console.log('DEBUG: Found venues:', data);
      setVenues(data || []);
    } catch (error) {
      console.error('Erro ao buscar venues:', error);
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
          .select('id, name, city, address')
          .eq('id', value)
          .maybeSingle();

        if (data && !error) {
          setSelectedVenue(data);
        }
      };
      fetchSelectedVenue();
    }
  }, [value, selectedVenue]);

  // Carregar venues iniciais ao abrir
  useEffect(() => {
    if (open && venues.length === 0) {
      searchVenues();
    }
  }, [open]);

  // Debounce da busca
  useEffect(() => {
    if (!open) return;
    
    const timer = setTimeout(() => {
      searchVenues(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, open]);

  const handleSelect = (venue: Venue) => {
    console.log('DEBUG: Selecting venue:', venue);
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
    return parts.join(' • ');
  };

  const formatVenueSubtitle = (venue: Venue) => {
    const parts = [];
    if (venue.address) parts.push(venue.address);
    if (venue.city && !venue.address) parts.push(venue.city);
    return parts.join(' • ');
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={(newOpen) => {
        console.log('DEBUG: Popover open state changing:', newOpen);
        setOpen(newOpen);
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[2.5rem] px-3 py-2"
            disabled={disabled}
            onClick={() => console.log('DEBUG: Button clicked!')}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              {selectedVenue ? (
                <div className="text-left flex-1 min-w-0">
                  <div className="font-medium truncate">{selectedVenue.name}</div>
                  {(selectedVenue.city || selectedVenue.address) && (
                    <div className="text-sm text-muted-foreground truncate">
                      {formatVenueSubtitle(selectedVenue)}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground flex-1 text-left">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {selectedVenue && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[--radix-popover-trigger-width] p-0 bg-background border border-border shadow-lg" 
          align="start"
          style={{ zIndex: 9999 }}
        >
          <Command shouldFilter={false}>
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                placeholder="Buscar por nome, cidade ou endereço..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-[300px]">
              {loading ? (
                <CommandEmpty>Buscando locais...</CommandEmpty>
              ) : venues.length === 0 ? (
                <CommandEmpty>
                  {search ? 'Nenhum local encontrado.' : 'Nenhum local cadastrado.'}
                </CommandEmpty>
              ) : (
                <CommandGroup>
                  {venues.map((venue) => (
                    <CommandItem
                      key={venue.id}
                      value={venue.id}
                      onSelect={() => handleSelect(venue)}
                      className="flex items-start gap-2 p-3"
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 flex-shrink-0",
                          selectedVenue?.id === venue.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{venue.name}</div>
                        {(venue.city || venue.address) && (
                          <div className="text-sm text-muted-foreground">
                            {formatVenueSubtitle(venue)}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}