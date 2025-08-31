import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronsUpDown, Check, Plus, Loader2, X } from 'lucide-react';
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
  onCreateClick?: (searchTerm: string) => void;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
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
}: RHFComboboxRemoteProps) {
  const { control } = useFormContext();
  const { field, fieldState } = useController({ name, control });
  const { value, onChange } = field;
  const { error } = fieldState;

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const [debouncedSearch] = useDebounce(search, 300);

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

  // Load options from Supabase
  const loadOptions = useCallback(async (searchTerm: string, pageNum: number = 0, reset: boolean = true) => {
    if (!table || !labelField || !searchField) return;

    setLoading(true);
    try {
      console.log(`[RHFComboboxRemote] Loading from ${table}, search: "${searchTerm}", page: ${pageNum}`);
      
      let query = supabase
        .from(table)
        .select(`${valueField}, ${labelField}`)
        .order(labelField);

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

      // Apply pagination
      const from = pageNum * 20;
      const to = from + 19;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(`[RHFComboboxRemote] Error loading from ${table}:`, error);
        return;
      }

      const newOptions: SelectOption[] = (data || []).map(item => ({
        id: String(item[valueField]),
        label: String(item[labelField]),
      }));

      if (reset) {
        setOptions(newOptions);
      } else {
        setOptions(prev => [...prev, ...newOptions]);
      }

      setHasMore(newOptions.length === 20);
      setPage(pageNum);
      
      console.log(`[RHFComboboxRemote] Loaded ${newOptions.length} options from ${table}`);
    } catch (error) {
      console.error(`[RHFComboboxRemote] Error loading options from ${table}:`, error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [table, valueField, labelField, searchField, where]);

  // Effect for debounced search
  useEffect(() => {
    loadOptions(debouncedSearch, 0, true);
  }, [debouncedSearch, loadOptions]);

  // Load initial options when component mounts
  useEffect(() => {
    if (open && options.length === 0 && !loading) {
      loadOptions('', 0, true);
    }
  }, [open, options.length, loading, loadOptions]);

  const handleSelect = useCallback((selectedValue: string) => {
    if (multiple) {
      const currentValues = valueArray;
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(newValues);
    } else {
      onChange(selectedValue === value ? null : selectedValue);
      setOpen(false);
    }
    setSearch('');
  }, [multiple, valueArray, value, onChange]);

  const handleRemoveChip = useCallback((removedValue: string) => {
    if (multiple) {
      const newValues = valueArray.filter(v => v !== removedValue);
      onChange(newValues);
    }
  }, [multiple, valueArray, onChange]);

  const handleCreate = useCallback(() => {
    if (onCreateClick && search.trim()) {
      onCreateClick(search.trim());
      setOpen(false);
      setSearch('');
    }
  }, [onCreateClick, search]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      loadOptions(debouncedSearch, page + 1, false);
    }
  }, [hasMore, loading, debouncedSearch, page, loadOptions]);

  const getDisplayText = () => {
    if (multiple) {
      return valueArray.length > 0 
        ? `${valueArray.length} selecionado(s)`
        : placeholder;
    } else {
      const selected = selectedOptions[0];
      return selected?.label || placeholder;
    }
  };

  return (
    <FormItem className={className}>
      {label && <FormLabel>{label}</FormLabel>}

      {/* Selected items as chips for multiple selection */}
      {multiple && selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedOptions.map((option) => (
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
                  handleRemoveChip(option.id);
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
        
        <PopoverContent className="p-0 z-[9999] w-[var(--radix-popover-trigger-width)]" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Digite para buscar..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Carregando...</span>
                </div>
              )}

              {!loading && options.length === 0 && (
                <CommandEmpty>
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground mb-3">
                      {search ? `Nenhum resultado para "${search}"` : 'Nenhum item encontrado'}
                    </p>
                    {onCreateClick && search.trim() && (
                      <Button
                        size="sm"
                        onClick={handleCreate}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar "{search}"
                      </Button>
                    )}
                  </div>
                </CommandEmpty>
              )}

              {!loading && options.length > 0 && (
                <CommandGroup>
                  {options.map((option) => {
                    const isSelected = valueArray.includes(option.id);
                    return (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        onSelect={() => handleSelect(option.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            isSelected ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="truncate">{option.label}</span>
                      </CommandItem>
                    );
                  })}
                  
                  {/* Load more button */}
                  {hasMore && !loading && (
                    <CommandItem
                      onSelect={loadMore}
                      className="justify-center cursor-pointer border-t"
                    >
                      <span className="text-sm text-muted-foreground">
                        Carregar mais...
                      </span>
                    </CommandItem>
                  )}
                  
                  {/* Create new option */}
                  {onCreateClick && search.trim() && options.length > 0 && (
                    <CommandItem
                      onSelect={handleCreate}
                      className="justify-center cursor-pointer border-t gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm">Criar "{search}"</span>
                    </CommandItem>
                  )}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && <FormMessage>{error.message}</FormMessage>}
    </FormItem>
  );
}