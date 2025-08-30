import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface EventFilters {
  city?: string;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  dateStart?: string;
  dateEnd?: string;
}

interface EventsFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

interface City {
  city: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const EventsFilters: React.FC<EventsFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading
}) => {
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadCities();
    loadCategories();
  }, []);

  const loadCities = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('city')
        .eq('status', 'active' as any)
        .order('city');

      if (error) throw error;

      // Get unique cities
      const uniqueCities = Array.from(
        new Set((data as any)?.map((item: any) => item.city))
      ).map(city => ({ city }));

      setCities(uniqueCities as any);
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      setCategories((data as any) || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleFilterChange = (key: keyof EventFilters, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      (newFilters as any)[key] = value;
    }
    
    onFiltersChange(newFilters);
  };

  const getActiveFiltersCount = () => {
    return Object.keys(filters).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
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
                Limpar
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden"
            >
              {isOpen ? 'Fechar' : 'Filtros'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`space-y-4 ${isOpen ? 'block' : 'hidden lg:block'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Cidade */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Cidade
            </Label>
            <Select
              value={filters.city || undefined}
              onValueChange={(value) => handleFilterChange('city', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.city} value={city.city}>
                    {city.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={filters.category || undefined}
              onValueChange={(value) => handleFilterChange('category', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent position="popper" className="z-[100]">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço Mínimo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Preço Min.
            </Label>
            <Input
              type="number"
              placeholder="R$ 0"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={isLoading}
              min="0"
              step="10"
            />
          </div>

          {/* Preço Máximo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Preço Máx.
            </Label>
            <Input
              type="number"
              placeholder="R$ 1000"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
              disabled={isLoading}
              min="0"
              step="10"
            />
          </div>

          {/* Data Início */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data Início
            </Label>
            <Input
              type="date"
              value={filters.dateStart || ''}
              onChange={(e) => handleFilterChange('dateStart', e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Data Fim */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Data Fim
            </Label>
            <Input
              type="date"
              value={filters.dateEnd || ''}
              onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
              disabled={isLoading}
              min={filters.dateStart || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {filters.city && (
              <Badge variant="secondary" className="gap-1">
                {filters.city}
                <button
                  onClick={() => handleFilterChange('city', undefined)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                {categories.find(c => c.slug === filters.category)?.name || filters.category}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
              <Badge variant="secondary" className="gap-1">
                R$ {filters.priceMin || 0} - R$ {filters.priceMax || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('priceMin', undefined);
                    handleFilterChange('priceMax', undefined);
                  }}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.dateStart || filters.dateEnd) && (
              <Badge variant="secondary" className="gap-1">
                {filters.dateStart && new Date(filters.dateStart).toLocaleDateString('pt-BR')}
                {filters.dateStart && filters.dateEnd && ' - '}
                {filters.dateEnd && new Date(filters.dateEnd).toLocaleDateString('pt-BR')}
                <button
                  onClick={() => {
                    handleFilterChange('dateStart', undefined);
                    handleFilterChange('dateEnd', undefined);
                  }}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsFilters;