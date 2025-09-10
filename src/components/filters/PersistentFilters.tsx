import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Filter, 
  MapPin, 
  Calendar,
  DollarSign,
  Tag,
  X,
  Accessibility
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PersistentFiltersProps {
  filters: {
    city?: string;
    dateRange?: string;
    priceRange?: string;
    categories?: string[];
    accessibility?: boolean;
  };
  onFiltersChange: (filters: any) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  className?: string;
}

export function PersistentFilters({ 
  filters, 
  onFiltersChange, 
  isExpanded = false,
  onToggleExpanded,
  className 
}: PersistentFiltersProps) {
  const [cities] = useState([
    'São Paulo',
    'Rio de Janeiro',
    'Belo Horizonte',
    'Brasília',
    'Curitiba',
    'Porto Alegre',
    'Salvador',
    'Recife',
    'Fortaleza'
  ]);

  const [categories] = useState([
    'Shows',
    'Teatro',
    'Exposições',
    'Workshops',
    'Debates',
    'Cinema',
    'Dança',
    'Literatura'
  ]);

  const quickDateFilters = [
    { value: 'today', label: 'Hoje' },
    { value: 'tomorrow', label: 'Amanhã' },
    { value: 'weekend', label: 'Fim de semana' },
    { value: 'week', label: 'Esta semana' },
    { value: 'month', label: 'Este mês' }
  ];

  const priceRanges = [
    { value: 'free', label: 'Gratuito' },
    { value: '0-25', label: 'Até R$ 25' },
    { value: '25-50', label: 'R$ 25-50' },
    { value: '50-100', label: 'R$ 50-100' },
    { value: '100+', label: 'Acima de R$ 100' }
  ];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    onFiltersChange(newFilters);
  };

  const removeCategory = (category: string) => {
    const newCategories = (filters.categories || []).filter(c => c !== category);
    updateFilter('categories', newCategories.length > 0 ? newCategories : undefined);
  };

  const addCategory = (category: string) => {
    const currentCategories = filters.categories || [];
    if (!currentCategories.includes(category)) {
      updateFilter('categories', [...currentCategories, category]);
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className={cn("bg-background border-b border-border sticky top-16 z-20", className)}>
      {/* Quick Actions Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Quick Date Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {quickDateFilters.map((dateFilter) => (
              <Button
                key={dateFilter.value}
                variant={filters.dateRange === dateFilter.value ? "default" : "outline"}
                size="sm"
                onClick={() => updateFilter('dateRange', dateFilter.value)}
                className="whitespace-nowrap text-xs"
              >
                {dateFilter.label}
              </Button>
            ))}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleExpanded}
            className="ml-4 flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {Object.keys(filters).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filtros ativos:</span>
            
            {filters.city && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {filters.city}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilter('city')}
                />
              </Badge>
            )}
            
            {filters.dateRange && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {quickDateFilters.find(f => f.value === filters.dateRange)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilter('dateRange')}
                />
              </Badge>
            )}
            
            {filters.priceRange && (
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {priceRanges.find(p => p.value === filters.priceRange)?.label}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilter('priceRange')}
                />
              </Badge>
            )}
            
            {filters.categories?.map((category) => (
              <Badge key={category} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {category}
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeCategory(category)}
                />
              </Badge>
            ))}
            
            {filters.accessibility && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Accessibility className="h-3 w-3" />
                Acessível
                <X 
                  className="h-3 w-3 cursor-pointer hover:text-destructive" 
                  onClick={() => removeFilter('accessibility')}
                />
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Limpar todos
            </Button>
          </div>
        </div>
      )}

      {/* Expanded Filters */}
      {isExpanded && (
        <Card className="mx-4 mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Cidade</label>
                <Select value={filters.city || ''} onValueChange={(value) => updateFilter('city', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as cidades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">Faixa de preço</label>
                <Select value={filters.priceRange || ''} onValueChange={(value) => updateFilter('priceRange', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Qualquer preço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer preço</SelectItem>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Categories */}
              <div>
                <label className="text-sm font-medium mb-2 block">Categorias</label>
                <div className="flex flex-wrap gap-1">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={filters.categories?.includes(category) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (filters.categories?.includes(category)) {
                          removeCategory(category);
                        } else {
                          addCategory(category);
                        }
                      }}
                      className="text-xs"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Accessibility */}
              <div>
                <label className="text-sm font-medium mb-2 block">Acessibilidade</label>
                <Button
                  variant={filters.accessibility ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFilter('accessibility', !filters.accessibility)}
                  className="w-full justify-start"
                >
                  <Accessibility className="h-4 w-4 mr-2" />
                  Locais acessíveis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}