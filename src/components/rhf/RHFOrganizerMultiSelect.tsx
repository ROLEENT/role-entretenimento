import React, { useState, useEffect } from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, X, Plus, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';
import { AgentQuickCreateModal } from '@/components/AgentQuickCreateModal';

interface Organizer {
  id: string;
  name: string;
  city?: string;
}

interface RHFOrganizerMultiSelectProps extends UseControllerProps {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  maxItems?: number;
}

export function RHFOrganizerMultiSelect({
  name,
  control,
  rules,
  defaultValue,
  label = "Organizadores",
  placeholder = "Busque por organizadores...",
  disabled = false,
  maxItems = 10,
  ...props
}: RHFOrganizerMultiSelectProps) {
  const {
    field: { value = [], onChange },
    fieldState: { error }
  } = useController({
    name,
    control,
    rules,
    defaultValue: defaultValue || []
  });

  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch] = useDebounce(searchValue, 300);
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [selectedOrganizers, setSelectedOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Buscar organizadores
  const searchOrganizers = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setOrganizers([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('organizers')
        .select('id, name, city')
        .ilike('name', `%${searchTerm}%`)
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

  // Trigger search when debounced search changes
  useEffect(() => {
    searchOrganizers(debouncedSearch);
  }, [debouncedSearch]);

  // Load selected organizers details
  useEffect(() => {
    const loadSelectedOrganizers = async () => {
      if (!value || value.length === 0) {
        setSelectedOrganizers([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('organizers')
          .select('id, name, city')
          .in('id', value);

        if (error) throw error;
        setSelectedOrganizers(data || []);
      } catch (error) {
        console.error('Error loading selected organizers:', error);
        setSelectedOrganizers([]);
      }
    };

    loadSelectedOrganizers();
  }, [value]);

  const handleSelect = (organizer: Organizer) => {
    if (!value.includes(organizer.id) && value.length < maxItems) {
      const newValue = [...value, organizer.id];
      onChange(newValue);
    }
    setOpen(false);
    setSearchValue('');
  };

  const handleRemove = (organizerId: string) => {
    const newValue = value.filter((id: string) => id !== organizerId);
    onChange(newValue);
  };

  const handleCreateNew = () => {
    setShowCreateModal(true);
    setOpen(false);
  };

  const handleCreated = (newOrganizer: any) => {
    if (newOrganizer?.id && !value.includes(newOrganizer.id)) {
      const newValue = [...value, newOrganizer.id];
      onChange(newValue);
    }
  };

  // Filter out already selected organizers
  const availableOrganizers = organizers.filter(
    organizer => !value.includes(organizer.id)
  );

  return (
    <FormItem className="flex flex-col">
      <FormLabel>{label}</FormLabel>
      
      {/* Selected organizers */}
      {selectedOrganizers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedOrganizers.map((organizer) => (
            <Badge
              key={organizer.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <Building className="w-3 h-3" />
              <span>{organizer.name}</span>
              {organizer.city && (
                <span className="text-xs opacity-70">({organizer.city})</span>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRemove(organizer.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search dropdown */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between"
            disabled={disabled || value.length >= maxItems}
          >
            {placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0">
          <Command>
            <CommandInput 
              placeholder="Digite para buscar organizadores..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>
              {loading ? (
                "Buscando..."
              ) : debouncedSearch.length < 2 ? (
                "Digite pelo menos 2 caracteres para buscar"
              ) : (
                <div className="py-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nenhum organizador encontrado para "{debouncedSearch}"
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCreateNew}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar organizador "{debouncedSearch}"
                  </Button>
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {availableOrganizers.map((organizer) => (
                <CommandItem
                  key={organizer.id}
                  value={organizer.name}
                  onSelect={() => handleSelect(organizer)}
                  className="flex items-center gap-2"
                >
                  <Building className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium">{organizer.name}</div>
                    {organizer.city && (
                      <div className="text-xs text-muted-foreground">
                        {organizer.city}
                      </div>
                    )}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value.includes(organizer.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
              {availableOrganizers.length > 0 && debouncedSearch.length >= 2 && (
                <CommandItem
                  onSelect={handleCreateNew}
                  className="border-t"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar novo organizador
                </CommandItem>
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <FormMessage />

      {/* Create modal */}
      {showCreateModal && (
        <AgentQuickCreateModal
          open={showCreateModal}
          onOpenChange={(open) => setShowCreateModal(open)}
          agentType="organizer"
          onCreated={handleCreated}
        />
      )}
    </FormItem>
  );
}