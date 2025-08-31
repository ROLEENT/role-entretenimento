"use client";
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

interface RHFMultiComboboxProps {
  name: string;
  label?: string;
  placeholder?: string;
  loadOptions: (query: string) => Promise<SelectOption[]>;
  onCreate?: (label: string) => Promise<SelectOption>;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export default function RHFMultiCombobox({
  name,
  label,
  placeholder = "Selecione opções...",
  loadOptions,
  onCreate,
  disabled = false,
  className,
  description,
}: RHFMultiComboboxProps) {
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

  // Ensure value is always an array
  const valueArray = Array.isArray(value) ? value : [];

  // Get selected options for display
  const selectedOptions = React.useMemo(() => {
    return valueArray.map(val => {
      const option = options.find(opt => opt.value === val);
      return option || { label: val, value: val };
    });
  }, [valueArray, options]);

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
    const currentValues = valueArray;
    const newValues = currentValues.includes(selectedValue)
      ? currentValues.filter(v => v !== selectedValue)
      : [...currentValues, selectedValue];
    onChange(newValues);
    setSearch('');
  };

  const handleCreate = async () => {
    if (!search.trim() || creating || !onCreate) return;
    
    setCreating(true);
    try {
      const newOption = await onCreate(search.trim());
      
      // Add to options list
      setOptions([newOption, ...options]);
      
      // Add to selected values
      const currentValues = valueArray;
      onChange([...currentValues, newOption.value]);
      
      // Clear search
      setSearch('');
    } catch (error) {
      console.error('Erro ao criar opção:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleRemoveChip = (valueToRemove: string) => {
    onChange(valueArray.filter(v => v !== valueToRemove));
  };

  const hasResults = options.length > 0;
  const showCreateOption = onCreate && search.trim().length > 0 && !hasResults && !loading;

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}
      
      {/* Selected chips */}
      {selectedOptions.length > 0 && (
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
              valueArray.length === 0 && "text-muted-foreground"
            )}>
              {valueArray.length > 0 
                ? `${valueArray.length} selecionado(s)`
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 z-50 w-[var(--radix-popover-trigger-width)]" align="start">
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
                    {onCreate && (
                      <p className="text-xs">Clique em "Adicionar" para criar uma nova opção.</p>
                    )}
                  </div>
                </div>
              )}
              
              {!loading && search.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <p>Digite para buscar opções</p>
                    {onCreate && <p className="text-xs">ou criar uma nova</p>}
                  </div>
                </div>
              )}

              {!loading && hasResults && (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = valueArray.includes(option.value);
                    
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