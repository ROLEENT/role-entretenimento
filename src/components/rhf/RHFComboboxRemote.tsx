import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, Check, Plus, Loader2, X } from 'lucide-react';
import { QuickCreateDialog } from '@/components/ui/quick-create-dialog';
import { cn } from '@/lib/utils';
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
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface SelectOption {
  id: string;
  label: string;
}

interface RHFComboboxRemoteProps {
  name: string;
  label?: string;
  table: string;
  valueField?: string;
  labelField: string;
  searchField: string;
  where?: Record<string, any>;
  multiple?: boolean;
  onCreateClick?: (searchTerm: string) => Promise<any>;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
  createButtonText?: string;
  createDialogTitle?: string;
  createDialogDescription?: string;
  createFieldLabel?: string;
  createFieldPlaceholder?: string;
}

export default function RHFComboboxRemote({
  name,
  label,
  table,
  valueField = 'id',
  labelField,
  searchField,
  where = {},
  multiple = false,
  onCreateClick,
  placeholder = 'Buscar...',
  description,
  disabled = false,
  className,
  createButtonText,
  createDialogTitle,
  createDialogDescription,
  createFieldLabel,
  createFieldPlaceholder,
}: RHFComboboxRemoteProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const { value, onChange } = field;
  const { error } = fieldState;

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Convert value to array for consistent handling
  const valueArray = useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : (value ? [value] : []);
    }
    return value ? [value] : [];
  }, [value, multiple]);

  // Get selected options for display
  const selectedOptions = useMemo(() => {
    return options.filter(opt => valueArray.includes(opt.id));
  }, [options, valueArray]);

  // Search options from Supabase
  const searchOptions = useCallback(async (searchTerm: string) => {
    if (!table || !labelField || !searchField) return;

    setIsLoading(true);
    try {
      console.log(`[RHFComboboxRemote] Searching ${table} for: "${searchTerm}"`);
      
      let query = supabase
        .from(table)
        .select(`${valueField}, ${labelField}`)
        .order(labelField)
        .limit(20);

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.ilike(searchField, `%${searchTerm.trim()}%`);
      }

      // Apply additional where conditions
      Object.entries(where).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          query = query.eq(key, val);
        }
      });

      const { data, error } = await query;

      if (error) {
        console.error(`[RHFComboboxRemote] Error searching ${table}:`, error);
        return;
      }

      const newOptions: SelectOption[] = (data || []).map(item => ({
        id: String(item[valueField]),
        label: String(item[labelField]),
      }));

      setOptions(newOptions);
      console.log(`[RHFComboboxRemote] Found ${newOptions.length} options`);
    } catch (error) {
      console.error(`[RHFComboboxRemote] Error searching options:`, error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [table, valueField, labelField, searchField, where]);

  // Effect for debounced search
  useEffect(() => {
    if (open) {
      searchOptions(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, open, searchOptions]);

  // Load initial options when opened
  useEffect(() => {
    if (open && options.length === 0 && !isLoading) {
      searchOptions('');
    }
  }, [open, options.length, isLoading, searchOptions]);

  // Handle quick create
  const handleQuickCreate = useCallback(async (itemName: string) => {
    if (!onCreateClick) return;

    setIsCreating(true);
    try {
      const newItem = await onCreateClick(itemName);
      
      // Refresh options to include the new item
      await searchOptions(debouncedSearchTerm);
      
      // Auto-select the newly created item
      if (newItem && newItem[valueField]) {
        const newValue = newItem[valueField];
        
        if (multiple) {
          const currentValues = Array.isArray(value) ? value : [];
          if (!currentValues.includes(newValue)) {
            onChange([...currentValues, newValue]);
          }
        } else {
          onChange(newValue);
        }
      }
      
      setSearchTerm('');
      setOpen(false);
    } catch (error) {
      console.error('Error in quick create:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [onCreateClick, debouncedSearchTerm, searchOptions, valueField, multiple, value, onChange]);

  // Get display text for create button
  const getCreateButtonText = () => {
    if (createButtonText) return createButtonText;
    
    const typeMap: Record<string, string> = {
      'artist_types': 'Tipo de Artista',
      'genres': 'Gênero',
      'venues': 'Local',
      'organizers': 'Organizador',
      'artists': 'Artista',
    };
    
    return typeMap[table] || 'Item';
  };

  const getDialogTitle = () => {
    if (createDialogTitle) return createDialogTitle;
    return `Criar ${getCreateButtonText()}`;
  };

  const getFieldLabel = () => {
    if (createFieldLabel) return createFieldLabel;
    return `Nome do ${getCreateButtonText()}`;
  };

  // Clear selection
  const clearSelection = useCallback(() => {
    onChange(multiple ? [] : '');
  }, [onChange, multiple]);

  // Remove chip
  const removeChip = useCallback((valueToRemove: string) => {
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter(v => v !== valueToRemove);
      onChange(newValues);
    }
  }, [multiple, value, onChange]);

  // Handle selection
  const handleSelect = useCallback((selectedValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue);
      setOpen(false);
    }
  }, [multiple, value, onChange]);

  // Get selected options for display
  const displaySelectedOptions = useMemo(() => {
    if (!value) return [];
    
    const values = Array.isArray(value) ? value : [value];
    return options.filter(option => values.includes(option.id));
  }, [value, options]);

  // Get display text
  const getDisplayText = () => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return placeholder || "Selecione...";
    }
    
    if (multiple) {
      const count = Array.isArray(value) ? value.length : 0;
      return count === 1 ? "1 item selecionado" : `${count} itens selecionados`;
    } else {
      const selected = displaySelectedOptions[0];
      return selected ? selected.label : placeholder || "Selecione...";
    }
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}

      {/* Selected items as chips for multiple selection */}
      {multiple && displaySelectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {displaySelectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="text-xs"
            >
              {option.label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeChip(option.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal",
              (!value || (multiple && valueArray.length === 0)) && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {getDisplayText()}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="p-0 z-[50] bg-popover" align="start" style={{width: triggerRef.current?.offsetWidth}}>
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite para buscar..."
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
                </div>
              ) : options.length === 0 ? (
                debouncedSearchTerm ? (
                  // Empty state with create option
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      Nenhum resultado encontrado para "{debouncedSearchTerm}"
                    </p>
                    {onCreateClick && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreateDialogOpen(true)}
                        className="gap-2"
                      >
                        <Plus className="h-3 w-3" />
                        Criar {getCreateButtonText()}
                      </Button>
                    )}
                  </div>
                ) : (
                  <CommandEmpty>Digite para buscar...</CommandEmpty>
                )
              ) : (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = multiple 
                      ? Array.isArray(value) && value.includes(option.id)
                      : value === option.id;
                    
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => handleSelect(option.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Quick Create Dialog */}
      <QuickCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title={getDialogTitle()}
        description={createDialogDescription}
        fieldLabel={getFieldLabel()}
        fieldPlaceholder={createFieldPlaceholder}
        searchTerm={debouncedSearchTerm}
        onSave={handleQuickCreate}
        isLoading={isCreating}
      />

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
}