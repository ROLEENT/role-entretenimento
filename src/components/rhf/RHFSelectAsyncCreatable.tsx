import React, { useState, useEffect, useRef } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SelectOption {
  label: string;
  value: string;
}

interface RHFSelectAsyncCreatableProps {
  name: string;
  label?: string;
  placeholder?: string;
  loadOptions: (query: string) => Promise<SelectOption[]>;
  onCreate: (label: string) => Promise<SelectOption>;
  multi?: boolean;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function RHFSelectAsyncCreatable({
  name,
  label,
  placeholder = "Selecione uma opção...",
  loadOptions,
  onCreate,
  multi = false,
  disabled = false,
  className,
  description,
}: RHFSelectAsyncCreatableProps) {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;

  // Get selected options for display
  const selectedOptions = React.useMemo(() => {
    if (!value) return [];
    
    const selectedValues = multi ? (Array.isArray(value) ? value : []) : [value];
    return selectedValues.map(val => {
      const option = options.find(opt => opt.value === val);
      return option || { label: val, value: val };
    });
  }, [value, options, multi]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (search.trim().length >= 1) {
        setLoading(true);
        try {
          const results = await loadOptions(search.trim());
          setOptions(results);
        } catch (error) {
          console.error('Erro ao carregar opções:', error);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [search, loadOptions]);

  const handleSelect = (selectedValue: string) => {
    if (multi) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
      // Don't close popup for multi-select to allow multiple selections
    } else {
      onChange(selectedValue === value ? '' : selectedValue);
      setOpen(false);
    }
    // Clear search for better UX
    setSearch('');
  };

  const handleCreate = async () => {
    if (!search.trim() || creating) return;
    
    setCreating(true);
    try {
      const newOption = await onCreate(search.trim());
      
      // Add to options list
      setOptions([newOption, ...options]);
      
      // Select the new option
      if (multi) {
        const currentValues = Array.isArray(value) ? value : [];
        onChange([...currentValues, newOption.value]);
      } else {
        onChange(newOption.value);
      }
      
      // Clear search but don't close popup for multi-select
      setSearch('');
    } catch (error) {
      console.error('Erro ao criar opção:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveChip = (valueToRemove: string) => {
    if (multi && Array.isArray(value)) {
      onChange(value.filter(v => v !== valueToRemove));
    }
  };

  const getDisplayText = () => {
    if (multi) {
      return selectedOptions.length > 0 
        ? `${selectedOptions.length} selecionado(s)`
        : placeholder;
    }
    return selectedOptions[0]?.label || placeholder;
  };

  const hasResults = options.length > 0;
  const showCreateOption = search.trim().length > 0 && !hasResults && !loading;

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      
      {/* Multi-select chips */}
      {multi && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80"
              onClick={() => handleRemoveChip(option.value)}
            >
              {option.label}
              <X className="ml-1 h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-controls={open ? `${name}-listbox` : undefined}
            aria-describedby={cn(
              description && descriptionId,
              error && errorId
            )}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className={cn(
              "truncate",
              (!value || (multi && (!Array.isArray(value) || value.length === 0))) && "text-muted-foreground"
            )}>
              {getDisplayText()}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite para buscar..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList id={`${name}-listbox`} role="listbox">
              {loading && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Buscando...
                </div>
              )}
              
              {!loading && search.length > 0 && !hasResults && !showCreateOption && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>Nada encontrado.</p>
                    <p className="text-xs">Clique em "Adicionar" para criar uma nova opção.</p>
                  </div>
                </div>
              )}
              
              {!loading && search.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>Digite para buscar opções</p>
                    <p className="text-xs">ou criar uma nova</p>
                  </div>
                </div>
              )}

              {!loading && hasResults && (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = multi 
                      ? Array.isArray(value) && value.includes(option.value)
                      : value === option.value;
                    
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        className="flex items-center justify-between"
                        role="option"
                        aria-selected={isSelected}
                      >
                        <span className="truncate">{option.label}</span>
                        <Check
                          className={cn(
                            "h-4 w-4 shrink-0",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}

              {showCreateOption && (
                <CommandGroup>
                  <CommandItem
                    onSelect={handleCreate}
                    disabled={creating}
                    className="gap-2 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>
                      {creating ? 'Criando...' : `Adicionar: "${search.trim()}"`}
                    </span>
                  </CommandItem>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm font-medium text-destructive"
        >
          <FormMessage />
        </div>
      )}
    </FormItem>
  );
}