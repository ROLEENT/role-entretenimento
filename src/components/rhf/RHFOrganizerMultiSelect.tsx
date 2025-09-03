import React, { useState, useEffect } from 'react';
import { UseControllerProps, useController } from 'react-hook-form';
import { X, Plus, Search, Building } from 'lucide-react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';
import { ComboboxAsyncOption } from '@/components/ui/combobox-async';

interface Organizer {
  id: string;
  name: string;
  city?: string;
}

interface RHFOrganizerMultiSelectProps extends UseControllerProps {
  label?: string;
  placeholder?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  maxItems?: number;
}

export function RHFOrganizerMultiSelect({
  name,
  control,
  rules,
  defaultValue = [],
  label = "Organizadores",
  placeholder = "Buscar organizadores...",
  description,
  className,
  disabled = false,
  maxItems = 10,
  ...props
}: RHFOrganizerMultiSelectProps) {
  const {
    field: { value = [], onChange, ...fieldProps },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules,
    defaultValue,
    ...props
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Buscar organizadores
  const searchOrganizers = async (query: string) => {
    if (query.length < 2) {
      setOrganizers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, city')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      setOrganizers(data || []);
    } catch (error) {
      console.error('Error searching organizers:', error);
      setOrganizers([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect para busca com debounce
  useEffect(() => {
    if (debouncedSearch) {
      searchOrganizers(debouncedSearch);
    } else {
      setOrganizers([]);
    }
  }, [debouncedSearch]);

  // Effect para carregar organizadores selecionados
  useEffect(() => {
    const loadSelectedOrganizers = async () => {
      if (value && value.length > 0) {
        try {
          const { data, error } = await supabase
            .from('organizers')
            .select('id, name, city')
            .in('id', value);

          if (error) throw error;
          setSelectedOrganizers(data || []);
        } catch (error) {
          console.error('Error loading selected organizers:', error);
        }
      } else {
        setSelectedOrganizers([]);
      }
    };

    loadSelectedOrganizers();
  }, [value]);

  const handleSelect = (organizer: Organizer) => {
    if (!value.includes(organizer.id) && value.length < maxItems) {
      const newValue = [...value, organizer.id];
      onChange(newValue);
      setSearch('');
      setOpen(false);
    }
  };

  const handleRemove = (organizerId: string) => {
    const newValue = value.filter((id: string) => id !== organizerId);
    onChange(newValue);
  };

  const handleCreateNew = () => {
    setOpen(false);
    setModalOpen(true);
  };

  const handleCreated = (newOrganizer: ComboboxAsyncOption) => {
    const newValue = [...value, newOrganizer.value];
    onChange(newValue);
    setModalOpen(false);
  };

  // Filtrar organizadores que já não estão selecionados
  const availableOrganizers = organizers.filter(org => !value.includes(org.id));

  return (
    <>
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        
        <div className="space-y-2">
          {/* Organizadores selecionados */}
          {selectedOrganizers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedOrganizers.map((organizer) => (
                <Badge
                  key={organizer.id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <Building className="h-3 w-3" />
                  <span>{organizer.name}</span>
                  {organizer.city && (
                    <span className="text-xs opacity-70">• {organizer.city}</span>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleRemove(organizer.id)}
                    disabled={disabled}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Input de busca */}
          {value.length < maxItems && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-start"
                  disabled={disabled}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {placeholder}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <div className="flex items-center border-b px-3">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                    <Input
                      placeholder="Digite para buscar..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="border-0 focus:ring-0 h-10"
                    />
                  </div>
                  <CommandList>
                    {loading && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Buscando...
                      </div>
                    )}
                    
                    {!loading && search.length >= 2 && availableOrganizers.length === 0 && (
                      <CommandEmpty>Nenhum organizador encontrado</CommandEmpty>
                    )}
                    
                    {!loading && search.length < 2 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Digite pelo menos 2 caracteres para buscar
                      </div>
                    )}

                    {!loading && availableOrganizers.length > 0 && (
                      <CommandGroup>
                        {availableOrganizers.map((organizer) => (
                          <CommandItem
                            key={organizer.id}
                            onSelect={() => handleSelect(organizer)}
                            className="flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <div className="flex flex-col">
                                <span>{organizer.name}</span>
                                {organizer.city && (
                                  <span className="text-xs text-muted-foreground">
                                    {organizer.city}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {search.length >= 2 && (
                      <>
                        <div className="border-t px-2 py-1">
                          <CommandItem onSelect={handleCreateNew} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Cadastrar novo organizador</span>
                          </CommandItem>
                        </div>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <FormMessage>{error?.message}</FormMessage>
      </FormItem>

      <AgentQuickCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        agentType="organizer"
        onCreated={handleCreated}
      />
    </>
  );
}