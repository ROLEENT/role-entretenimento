import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Filter, X, Users, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';

interface AdvancedFilters {
  // Basic filters
  search?: string;
  city?: string;
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
  
  // Advanced filters
  organizers?: string[];
  venues?: string[];
  tags?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  
  // Special filters
  freeOnly?: boolean;
  withImages?: boolean;
  upcoming?: boolean;
  hasCapacity?: boolean;
  minRating?: number;
}

interface AdvancedEventsFiltersProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

interface FilterOption {
  id: string;
  name: string;
  count?: number;
}

export const AdvancedEventsFilters: React.FC<AdvancedEventsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading
}) => {
  const [cities, setCities] = useState<FilterOption[]>([]);
  const [categories, setCategories] = useState<FilterOption[]>([]);
  const [organizers, setOrganizers] = useState<FilterOption[]>([]);
  const [venues, setVenues] = useState<FilterOption[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      // Load cities with event counts
      const { data: cityData } = await supabase
        .from('events')
        .select('city')
        .eq('status', 'active');

      const cityMap = new Map();
      cityData?.forEach(item => {
        const count = cityMap.get(item.city) || 0;
        cityMap.set(item.city, count + 1);
      });

      setCities(Array.from(cityMap.entries()).map(([name, count]) => ({
        id: name,
        name,
        count
      })).sort((a, b) => b.count - a.count));

      // Load categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('type', 'event')
        .order('name');

      setCategories(categoriesData?.map(cat => ({
        id: cat.slug,
        name: cat.name
      })) || []);

      // Load organizers
      const { data: organizersData } = await supabase
        .from('organizers')
        .select('id, name')
        .order('name');

      setOrganizers(organizersData?.map(org => ({
        id: org.id,
        name: org.name
      })) || []);

      // Load venues
      const { data: venuesData } = await supabase
        .from('venues')
        .select('id, name')
        .order('name');

      setVenues(venuesData?.map(venue => ({
        id: venue.id,
        name: venue.name
      })) || []);

      // Load tags
      const { data: eventsData } = await supabase
        .from('events')
        .select('tags')
        .eq('status', 'active');

      const allTags = new Set<string>();
      eventsData?.forEach(event => {
        event.tags?.forEach((tag: string) => allTags.add(tag));
      });

      setAvailableTags(Array.from(allTags).sort());
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || value === undefined || 
        (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'categories' | 'organizers' | 'venues' | 'tags', value: string) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  const sortOptions = [
    { value: 'date_start', label: 'Data do evento' },
    { value: 'created_at', label: 'Data de criação' },
    { value: 'title', label: 'Nome do evento' },
    { value: 'price_min', label: 'Preço' }
  ];

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avançados
            {hasActiveFilters && (
              <Badge variant="secondary">{getActiveFiltersCount()}</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className="text-sm"
              >
                <X className="h-4 w-4 mr-1" />
                Limpar Tudo
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Recolher' : 'Expandir'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Filters - Always Visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Buscar eventos</Label>
            <Input
              placeholder="Nome do evento..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Cidade
            </Label>
            <Select
              value={filters.city || undefined}
              onValueChange={(value) => updateFilter('city', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name} {city.count && `(${city.count})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data Início
            </Label>
            <Input
              type="date"
              value={filters.dateStart || ''}
              onChange={(e) => updateFilter('dateStart', e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data Fim
            </Label>
            <Input
              type="date"
              value={filters.dateEnd || ''}
              onChange={(e) => updateFilter('dateEnd', e.target.value)}
              disabled={isLoading}
              min={filters.dateStart || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6">
            {/* Price Range */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Faixa de Preço
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Preço Mínimo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 0"
                    value={filters.priceMin || ''}
                    onChange={(e) => updateFilter('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                    disabled={isLoading}
                    min="0"
                    step="5"
                  />
                </div>
                <div>
                  <Label className="text-sm">Preço Máximo</Label>
                  <Input
                    type="number"
                    placeholder="R$ 1000"
                    value={filters.priceMax || ''}
                    onChange={(e) => updateFilter('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                    disabled={isLoading}
                    min="0"
                    step="5"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <Label>Categorias</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={filters.categories?.includes(category.id) || false}
                      onCheckedChange={() => toggleArrayFilter('categories', category.id)}
                    />
                    <Label htmlFor={category.id} className="text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Organizers */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Organizadores
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {organizers.map((organizer) => (
                  <div key={organizer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={organizer.id}
                      checked={filters.organizers?.includes(organizer.id) || false}
                      onCheckedChange={() => toggleArrayFilter('organizers', organizer.id)}
                    />
                    <Label htmlFor={organizer.id} className="text-sm">
                      {organizer.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Filters */}
            <div className="space-y-4">
              <Label>Filtros Rápidos</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="freeOnly"
                    checked={filters.freeOnly || false}
                    onCheckedChange={(checked) => updateFilter('freeOnly', checked)}
                  />
                  <Label htmlFor="freeOnly" className="text-sm">
                    Apenas gratuitos
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="withImages"
                    checked={filters.withImages || false}
                    onCheckedChange={(checked) => updateFilter('withImages', checked)}
                  />
                  <Label htmlFor="withImages" className="text-sm">
                    Com imagens
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="upcoming"
                    checked={filters.upcoming || false}
                    onCheckedChange={(checked) => updateFilter('upcoming', checked)}
                  />
                  <Label htmlFor="upcoming" className="text-sm">
                    Próximos eventos
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasCapacity"
                    checked={filters.hasCapacity || false}
                    onCheckedChange={(checked) => updateFilter('hasCapacity', checked)}
                  />
                  <Label htmlFor="hasCapacity" className="text-sm">
                    Com vagas
                  </Label>
                </div>
              </div>
            </div>

            {/* Sorting */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ordenar por</Label>
                <Select
                  value={filters.sortBy || 'date_start'}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ordem</Label>
                <Select
                  value={filters.sortOrder || 'asc'}
                  onValueChange={(value) => updateFilter('sortOrder', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              let label = '';
              if (key === 'search') label = `"${value}"`;
              else if (key === 'city') label = value as string;
              else if (key === 'categories') label = `${(value as string[]).length} categoria(s)`;
              else if (key === 'organizers') label = `${(value as string[]).length} organizador(es)`;
              else if (key === 'priceMin') label = `Min: R$ ${value}`;
              else if (key === 'priceMax') label = `Max: R$ ${value}`;
              else if (key === 'dateStart') label = `Desde: ${new Date(value as string).toLocaleDateString('pt-BR')}`;
              else if (key === 'dateEnd') label = `Até: ${new Date(value as string).toLocaleDateString('pt-BR')}`;
              else if (key === 'freeOnly' && value) label = 'Gratuitos';
              else if (key === 'withImages' && value) label = 'Com imagens';
              else if (key === 'upcoming' && value) label = 'Próximos';

              if (!label) return null;

              return (
                <Badge key={key} variant="secondary" className="gap-1">
                  {label}
                  <button
                    onClick={() => updateFilter(key as keyof AdvancedFilters, undefined)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};