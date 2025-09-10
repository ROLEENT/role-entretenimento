import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Search } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';

export interface ComboboxAsyncOption {
  id: string;
  name: string;
  city?: string;
  value: string;
  subtitle?: string;
}

interface ComboboxAsyncProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
  onSearch: (query: string) => Promise<ComboboxAsyncOption[]>;
  onCreateNew?: () => void;
  placeholder?: string;
  emptyText?: string;
  createNewText?: string;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
}

export function ComboboxAsync({
  value,
  onValueChange,
  onSearch,
  onCreateNew,
  placeholder = "Selecione uma opção...",
  emptyText = "Nenhum resultado encontrado",
  createNewText = "Cadastrar novo",
  loadingText = "Buscando...",
  className,
  disabled = false,
}: ComboboxAsyncProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<ComboboxAsyncOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<ComboboxAsyncOption | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search.length >= 2) {
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
      onValueChange(selectedValue === value ? undefined : selectedValue);
    }
    setOpen(false);
  };

  const handleCreateNew = () => {
    setOpen(false);
    onCreateNew?.();
  };

  // Public method to update selected option (for use after creating new item)
  React.useImperativeHandle(React.createRef(), () => ({
    setSelectedOption: (option: ComboboxAsyncOption) => {
      setSelectedOption(option);
      onValueChange(option.value);
    }
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 text-left">
            {selectedOption ? (
              <>
                <span className="truncate">{selectedOption.name}</span>
                {selectedOption.city && (
                  <span className="text-muted-foreground text-sm">
                    • {selectedOption.city}
                  </span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-[9999] bg-popover border shadow-lg" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Digite para buscar..."
              value={search}
              onValueChange={setSearch}
              className="border-0 focus:ring-0"
            />
          </div>
          <CommandList>
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {loadingText}
              </div>
            )}
            
            {!loading && search.length >= 2 && options.length === 0 && (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            
            {!loading && search.length < 2 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </div>
            )}

            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="truncate">{option.name}</span>
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

            {onCreateNew && search.length >= 2 && options.length === 0 && !loading && (
              <>
                <Separator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreateNew} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>{createNewText || "Criar novo"}</span>
                    <span className="text-xs text-muted-foreground ml-auto">"{search}"</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}