import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, RotateCcw, Search, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';

interface AgendaFilters {
  search: string;
  status: string;
  city: string;
  dateRange: { from: Date | null; to: Date | null };
  tags: string[];
  showTrash?: boolean;
}

interface NewAdminAgendaFiltersProps {
  filters: AgendaFilters;
  onFiltersChange: (filters: AgendaFilters) => void;
  onReset: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function NewAdminAgendaFilters({ 
  filters, 
  onFiltersChange, 
  onReset,
  collapsed = false,
  onToggleCollapse
}: NewAdminAgendaFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [debouncedSearch] = useDebounce(localSearch, 300);

  // Update filters when debounced search changes
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch, filters, onFiltersChange]);

  // Fetch available cities from database
  const { data: availableCities = [] } = useQuery({
    queryKey: ['agenda-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('city')
        .not('city', 'is', null)
        .is('deleted_at', null);
        
      if (error) throw error;
      
      const uniqueCities = [...new Set(data.map(item => item.city))]
        .filter(Boolean)
        .sort();
      
      return uniqueCities;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch available tags from database
  const { data: availableTags = [] } = useQuery({
    queryKey: ['agenda-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('tags')
        .not('tags', 'is', null)
        .is('deleted_at', null);
        
      if (error) throw error;
      
      const allTags = data
        .flatMap(item => item.tags || [])
        .filter(Boolean);
      
      const uniqueTags = [...new Set(allTags)].sort();
      
      return uniqueTags;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Filter change handlers
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, status: value });
  }, [filters, onFiltersChange]);

  const handleCityChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, city: value });
  }, [filters, onFiltersChange]);

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: { 
        from: range?.from || null, 
        to: range?.to || null 
      } 
    });
  }, [filters, onFiltersChange]);

  const handleTagAdd = useCallback((tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFiltersChange({ 
        ...filters, 
        tags: [...filters.tags, tag] 
      });
    }
  }, [filters, onFiltersChange]);

  const handleTagRemove = useCallback((tagToRemove: string) => {
    onFiltersChange({ 
      ...filters, 
      tags: filters.tags.filter(tag => tag !== tagToRemove) 
    });
  }, [filters, onFiltersChange]);

  const handleViewModeChange = useCallback((value: string) => {
    onFiltersChange({ 
      ...filters, 
      showTrash: value === 'trash' 
    });
  }, [filters, onFiltersChange]);

  // Check if any filters are active
  const hasActiveFilters = filters.search || filters.status || filters.city || 
    filters.dateRange.from || filters.dateRange.to || filters.tags.length > 0;

  // Reset handler
  const handleReset = useCallback(() => {
    setLocalSearch('');
    onReset();
  }, [onReset]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {[
                  filters.search && 'Busca',
                  filters.status && 'Status',
                  filters.city && 'Cidade',
                  (filters.dateRange.from || filters.dateRange.to) && 'Data',
                  filters.tags.length > 0 && `${filters.tags.length} tags`
                ].filter(Boolean).join(', ')}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Limpar
              </Button>
            )}
            {onToggleCollapse && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onToggleCollapse}
                className="gap-2"
              >
                {collapsed ? 'Expandir' : 'Recolher'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4">
          {/* View Mode Tabs */}
          <Tabs 
            value={filters.showTrash ? 'trash' : 'active'} 
            onValueChange={handleViewModeChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Ativos</TabsTrigger>
              <TabsTrigger value="trash">Lixeira</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, cidade ou resumo..."
                  value={localSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={filters.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos os status</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                      <SelectItem value="archived">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Cidade</label>
                  <Select value={filters.city} onValueChange={handleCityChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas as cidades</SelectItem>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Período do Evento</label>
                  <DatePickerWithRange
                    date={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                    onDateChange={handleDateRangeChange}
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Tags</label>
                
                {/* Selected Tags */}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground">Selecionadas:</span>
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Available Tags */}
                {availableTags.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Tags disponíveis:</span>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags
                        .filter(tag => !filters.tags.includes(tag))
                        .map((tag) => (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => handleTagAdd(tag)}
                            className="text-xs h-7"
                          >
                            {tag}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="trash" className="mt-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>Visualizando itens na lixeira</p>
                <p className="text-sm">Use as ações da tabela para restaurar itens</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      )}
    </Card>
  );
}