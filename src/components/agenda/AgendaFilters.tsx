import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { X, Filter, RotateCcw } from 'lucide-react';

interface AgendaFiltersProps {
  filters: {
    search: string;
    status: string;
    city: string;
    tags: string[];
  };
  onFiltersChange: (filters: any) => void;
  onReset: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

const CITIES = [
  { value: 'porto_alegre', label: 'Porto Alegre' },
  { value: 'curitiba', label: 'Curitiba' },
  { value: 'florianopolis', label: 'Florianópolis' },
  { value: 'sao_paulo', label: 'São Paulo' },
  { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
  { value: 'brasilia', label: 'Brasília' },
  { value: 'belo_horizonte', label: 'Belo Horizonte' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os eventos' },
  { value: 'upcoming', label: 'Próximos eventos' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'this_month', label: 'Este mês' },
];

export function AgendaFilters({ 
  filters, 
  onFiltersChange, 
  onReset, 
  showFilters, 
  onToggleFilters 
}: AgendaFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleCityChange = (value: string) => {
    onFiltersChange({ ...filters, city: value });
  };

  const handleTagRemove = (tagToRemove: string) => {
    onFiltersChange({ 
      ...filters, 
      tags: filters.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const hasActiveFilters = filters.search || 
    (filters.status && filters.status !== 'all') || 
    filters.city || 
    filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={onToggleFilters}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros {hasActiveFilters && `(${Object.values(filters).filter(v => Array.isArray(v) ? v.length > 0 : v).length})`}
        </Button>
        
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar eventos</label>
                <Input
                  placeholder="Digite o nome do evento, local ou artista..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="max-w-md"
                />
              </div>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status/Time Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                  <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
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
                      {CITIES.map(city => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Tags */}
              {filters.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags ativas</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                          aria-label={`Remover filtro ${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}