import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface OrganizerFilters {
  search: string;
  status: string;
  city: string;
  organizerType: string;
}

interface AdminOrganizerFiltersProps {
  filters: OrganizerFilters;
  cities?: { id: string; name: string }[];
  organizerTypes?: { id: string; name: string }[];
  onFiltersChange: (filters: Partial<OrganizerFilters>) => void;
  totalCount?: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

export const AdminOrganizerFilters: React.FC<AdminOrganizerFiltersProps> = ({
  filters,
  cities = [],
  organizerTypes = [],
  onFiltersChange,
  totalCount
}) => {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.city !== 'all' || 
    filters.organizerType !== 'all';

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      city: 'all',
      organizerType: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.organizerType !== 'all') count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, email ou bio..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-4">
        <Select 
          value={filters.status} 
          onValueChange={(value) => onFiltersChange({ status: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.organizerType} 
          onValueChange={(value) => onFiltersChange({ organizerType: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de organizador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {organizerTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={filters.city} 
          onValueChange={(value) => onFiltersChange({ city: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.id}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Active Filters Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <>
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Filtros ativos:
              </span>
              <Badge variant="secondary">
                {getActiveFiltersCount()}
              </Badge>
            </>
          )}
        </div>
        
        {totalCount !== undefined && (
          <div className="text-sm text-muted-foreground">
            {totalCount} organizador{totalCount !== 1 ? 'es' : ''} encontrado{totalCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="gap-1">
              Busca: "{filters.search}"
              <button 
                onClick={() => onFiltersChange({ search: '' })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.status !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Status: {STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
              <button 
                onClick={() => onFiltersChange({ status: 'all' })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.organizerType !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Tipo: {organizerTypes.find(t => t.id === filters.organizerType)?.name}
              <button 
                onClick={() => onFiltersChange({ organizerType: 'all' })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.city !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Cidade: {cities.find(c => c.id === filters.city)?.name}
              <button 
                onClick={() => onFiltersChange({ city: 'all' })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};