import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Organizer {
  id: string;
  name: string;
  site?: string;
  instagram?: string;
}

interface OrganizerAutocompleteProps {
  value?: string;
  onSelect: (organizer: Organizer | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function OrganizerAutocomplete({ value, onSelect, placeholder = "Buscar organizador...", disabled }: OrganizerAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);

  // Buscar organizadores
  const searchOrganizers = async (query: string) => {
    if (!query.trim()) {
      setOrganizers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, site, instagram')
        .ilike('name', `%${query}%`)
        .order('name')
        .limit(10);

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Erro ao buscar organizadores:', error);
      setOrganizers([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar organizador selecionado pelo ID
  useEffect(() => {
    if (value && !selectedOrganizer) {
      const fetchSelectedOrganizer = async () => {
        const { data, error } = await supabase
          .from('organizers')
          .select('id, name, site, instagram')
          .eq('id', value)
          .maybeSingle();

        if (data && !error) {
          setSelectedOrganizer(data);
        }
      };
      fetchSelectedOrganizer();
    }
  }, [value, selectedOrganizer]);

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchOrganizers(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const handleSelect = (organizer: Organizer) => {
    setSelectedOrganizer(organizer);
    onSelect(organizer);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelectedOrganizer(null);
    onSelect(null);
    setSearch('');
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
          {selectedOrganizer ? (
            <span className="truncate">{selectedOrganizer.name}</span>
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
              placeholder="Digite para buscar organizadores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            {selectedOrganizer && (
              <CommandGroup>
                <CommandItem onSelect={handleClear} className="text-destructive">
                  Limpar seleção
                </CommandItem>
              </CommandGroup>
            )}
            {loading ? (
              <CommandEmpty>Buscando organizadores...</CommandEmpty>
            ) : organizers.length === 0 && search ? (
              <CommandEmpty>Nenhum organizador encontrado.</CommandEmpty>
            ) : organizers.length === 0 ? (
              <CommandEmpty>Digite para buscar organizadores.</CommandEmpty>
            ) : (
              <CommandGroup>
                {organizers.map((organizer) => (
                  <CommandItem
                    key={organizer.id}
                    value={organizer.id}
                    onSelect={() => handleSelect(organizer)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedOrganizer?.id === organizer.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{organizer.name}</div>
                      {(organizer.site || organizer.instagram) && (
                        <div className="text-sm text-muted-foreground">
                          {organizer.site && <span>{organizer.site}</span>}
                          {organizer.site && organizer.instagram && <span> • </span>}
                          {organizer.instagram && <span>@{organizer.instagram}</span>}
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
  );
}