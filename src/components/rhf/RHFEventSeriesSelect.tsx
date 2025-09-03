import React, { useState, useEffect } from 'react';
import { UseControllerProps, useController } from 'react-hook-form';
import { Plus, Hash, Calendar } from 'lucide-react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandInput } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useDebounce } from 'use-debounce';
import { supabase } from '@/integrations/supabase/client';
import { useEventSeries } from '@/hooks/useUpsertEventV3';
import { toast } from 'sonner';

interface EventSeries {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

interface RHFEventSeriesSelectProps {
  seriesControl: UseControllerProps;
  editionControl: UseControllerProps;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

export function RHFEventSeriesSelect({
  seriesControl,
  editionControl,
  label = "Série de Eventos",
  description,
  className,
  disabled = false
}: RHFEventSeriesSelectProps) {
  const {
    field: seriesField,
    fieldState: { error: seriesError }
  } = useController(seriesControl);

  const {
    field: editionField,
    fieldState: { error: editionError }
  } = useController(editionControl);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [series, setSeries] = useState<EventSeries[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<EventSeries | null>(null);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [newSeriesSlug, setNewSeriesSlug] = useState('');
  const [newSeriesDescription, setNewSeriesDescription] = useState('');

  const { createSeries } = useEventSeries();

  // Buscar séries
  const searchSeries = async (query: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('event_series')
        .select('*')
        .order('name', { ascending: true })
        .limit(20);

      if (query.length >= 2) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) throw error;
      setSeries(data || []);
    } catch (error) {
      console.error('Error searching series:', error);
      setSeries([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect para busca
  useEffect(() => {
    searchSeries(debouncedSearch);
  }, [debouncedSearch]);

  // Effect para carregar série selecionada
  useEffect(() => {
    const loadSelectedSeries = async () => {
      if (seriesField.value && !selectedSeries) {
        try {
          const { data, error } = await supabase
            .from('event_series')
            .select('*')
            .eq('id', seriesField.value)
            .single();

          if (error) throw error;
          setSelectedSeries(data);
        } catch (error) {
          console.error('Error loading selected series:', error);
        }
      } else if (!seriesField.value) {
        setSelectedSeries(null);
      }
    };

    loadSelectedSeries();
  }, [seriesField.value, selectedSeries]);

  // Auto-gerar slug
  useEffect(() => {
    if (newSeriesName) {
      const slug = newSeriesName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setNewSeriesSlug(slug);
    }
  }, [newSeriesName]);

  const handleSelect = (selectedSeries: EventSeries) => {
    setSelectedSeries(selectedSeries);
    seriesField.onChange(selectedSeries.id);
    
    // Auto-calcular próxima edição
    calculateNextEdition(selectedSeries.id);
    
    setOpen(false);
  };

  const calculateNextEdition = async (seriesId: string) => {
    try {
      const { data, error } = await supabase
        .from('event_series_items')
        .select('edition_number')
        .eq('series_id', seriesId)
        .order('edition_number', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      const lastEdition = data && data.length > 0 ? data[0].edition_number : 0;
      editionField.onChange((lastEdition || 0) + 1);
    } catch (error) {
      console.error('Error calculating next edition:', error);
      editionField.onChange(1);
    }
  };

  const handleRemove = () => {
    setSelectedSeries(null);
    seriesField.onChange(undefined);
    editionField.onChange(undefined);
  };

  const handleCreateNew = () => {
    setOpen(false);
    setCreateDialogOpen(true);
  };

  const handleCreateSeries = async () => {
    if (!newSeriesName.trim() || !newSeriesSlug.trim()) {
      toast.error('Nome e slug são obrigatórios');
      return;
    }

    try {
      const newSeries = await createSeries.mutateAsync({
        name: newSeriesName.trim(),
        slug: newSeriesSlug.trim(),
        description: newSeriesDescription.trim() || undefined
      });

      handleSelect(newSeries);
      setCreateDialogOpen(false);
      setNewSeriesName('');
      setNewSeriesSlug('');
      setNewSeriesDescription('');
    } catch (error) {
      console.error('Error creating series:', error);
    }
  };

  return (
    <>
      <FormItem>
        {label && <FormLabel>{label}</FormLabel>}
        
        <div className="space-y-3">
          {/* Série selecionada */}
          {selectedSeries && (
            <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/50">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <div className="font-medium">{selectedSeries.name}</div>
                {selectedSeries.description && (
                  <div className="text-sm text-muted-foreground">
                    {selectedSeries.description}
                  </div>
                )}
              </div>
              <Badge variant="outline" className="gap-1">
                <Hash className="h-3 w-3" />
                {editionField.value || 1}
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                Remover
              </Button>
            </div>
          )}

          {/* Campo de edição manual */}
          {selectedSeries && (
            <div className="flex items-center gap-2">
              <Label htmlFor="edition" className="whitespace-nowrap">
                Edição #:
              </Label>
              <Input
                id="edition"
                type="number"
                min="1"
                value={editionField.value || 1}
                onChange={(e) => editionField.onChange(parseInt(e.target.value) || 1)}
                className="w-20"
                disabled={disabled}
              />
            </div>
          )}

          {/* Seletor de série */}
          {!selectedSeries && (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-start"
                  disabled={disabled}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Selecionar série de eventos...
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-[9999] bg-popover border shadow-lg" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar séries..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    {loading && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Buscando...
                      </div>
                    )}
                    
                    {!loading && series.length === 0 && search.length >= 2 && (
                      <CommandEmpty>Nenhuma série encontrada</CommandEmpty>
                    )}

                    {!loading && series.length > 0 && (
                      <CommandGroup>
                        {series.map((s) => (
                          <CommandItem
                            key={s.id}
                            onSelect={() => handleSelect(s)}
                            className="flex flex-col items-start gap-1"
                          >
                            <div className="font-medium">{s.name}</div>
                            {s.description && (
                              <div className="text-xs text-muted-foreground">
                                {s.description}
                              </div>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    <div className="border-t px-2 py-1">
                      <CommandItem onSelect={handleCreateNew} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span>Criar nova série</span>
                      </CommandItem>
                    </div>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <FormMessage>{seriesError?.message || editionError?.message}</FormMessage>
      </FormItem>

      {/* Dialog para criar nova série */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Série</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="series-name">Nome da Série</Label>
              <Input
                id="series-name"
                value={newSeriesName}
                onChange={(e) => setNewSeriesName(e.target.value)}
                placeholder="Ex: Festival de Verão"
              />
            </div>
            
            <div>
              <Label htmlFor="series-slug">Slug</Label>
              <Input
                id="series-slug"
                value={newSeriesSlug}
                onChange={(e) => setNewSeriesSlug(e.target.value)}
                placeholder="festival-de-verao"
              />
            </div>
            
            <div>
              <Label htmlFor="series-description">Descrição (opcional)</Label>
              <Input
                id="series-description"
                value={newSeriesDescription}
                onChange={(e) => setNewSeriesDescription(e.target.value)}
                placeholder="Descrição da série de eventos"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleCreateSeries}
              disabled={createSeries.isPending || !newSeriesName.trim()}
            >
              {createSeries.isPending ? 'Criando...' : 'Criar Série'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}