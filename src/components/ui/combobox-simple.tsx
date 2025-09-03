import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface ComboboxOption {
  id: string;
  name: string;
  city?: string;
  value: string;
  subtitle?: string;
}

interface ComboboxSimpleProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  onSearch: (query: string) => Promise<ComboboxOption[]>;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxSimple({
  value,
  onValueChange,
  onSearch,
  placeholder = "Selecione uma opção...",
  emptyText = "Nenhum resultado encontrado",
  className,
  disabled = false,
}: ComboboxSimpleProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ComboboxOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ComboboxOption | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 1) {
        setLoading(true);
        try {
          const results = await onSearch(search);
          setOptions(results);
        } catch (error) {
          console.error('Erro na busca:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  // Find selected option when value changes
  useEffect(() => {
    if (value && options.length > 0) {
      const option = options.find(opt => opt.value === value);
      if (option) {
        setSelectedOption(option);
      }
    } else if (!value) {
      setSelectedOption(null);
    }
  }, [value, options]);

  const handleSelect = (selectedValue: string) => {
    const option = options.find(opt => opt.value === selectedValue);
    if (option) {
      setSelectedOption(option);
      onValueChange(selectedValue);
    }
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    setSelectedOption(null);
    onValueChange(undefined);
    setSearch('');
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-10", className)}
            disabled={disabled}
          >
            <div className="flex items-center gap-2 flex-1 text-left overflow-hidden">
              {selectedOption ? (
                <>
                  <span className="truncate">{selectedOption.name}</span>
                  {selectedOption.city && (
                    <span className="text-muted-foreground text-sm shrink-0">
                      • {selectedOption.city}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedOption && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[var(--radix-popover-trigger-width)] p-0 z-[9999]" 
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <div className="bg-popover border rounded-md shadow-lg">
            <Command shouldFilter={false}>
              <div className="flex items-center border-b px-3 bg-background/50">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder="Digite para buscar..."
                  value={search}
                  onValueChange={setSearch}
                  className="border-0 focus:ring-0 bg-transparent"
                />
              </div>
              <CommandList className="max-h-[200px] overflow-y-auto">
                {loading && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Buscando...
                  </div>
                )}
                
                {!loading && search.length >= 1 && options.length === 0 && (
                  <CommandEmpty className="p-4 text-center text-sm">
                    {emptyText}
                  </CommandEmpty>
                )}
                
                {!loading && search.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Digite para buscar venues
                  </div>
                )}

                {!loading && options.length > 0 && (
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={handleSelect}
                        className="flex items-center justify-between gap-2 cursor-pointer"
                      >
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate text-sm">{option.name}</span>
                          {option.subtitle && (
                            <span className="text-xs text-muted-foreground truncate">
                              {option.subtitle}
                            </span>
                          )}
                        </div>
                        {option.city && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {option.city}
                          </span>
                        )}
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            value === option.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}