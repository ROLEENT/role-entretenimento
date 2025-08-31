import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArtistFilters {
  search: string;
  status: string;
  city: string;
  artistType: string;
}

interface AdminArtistFiltersProps {
  filters: ArtistFilters;
  cities?: string[];
  artistTypes?: { id: string; name: string }[];
  onFiltersChange: (filters: Partial<ArtistFilters>) => void;
  totalCount?: number;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
];

const ARTIST_TYPE_OPTIONS = [
  { value: 'banda', label: 'Banda' },
  { value: 'dj', label: 'DJ' },
  { value: 'solo', label: 'Solo' },
  { value: 'drag', label: 'Drag' },
  { value: 'dupla', label: 'Dupla' },
  { value: 'grupo', label: 'Grupo' },
];

export const AdminArtistFilters: React.FC<AdminArtistFiltersProps> = ({
  filters,
  cities = [],
  artistTypes = [],
  onFiltersChange,
  totalCount
}) => {
  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.city !== 'all' || 
    filters.artistType !== 'all';

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      city: 'all',
      artistType: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status !== 'all') count++;
    if (filters.city !== 'all') count++;
    if (filters.artistType !== 'all') count++;
    return count;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome, bio ou slug..."
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
          value={filters.artistType} 
          onValueChange={(value) => onFiltersChange({ artistType: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo de artista" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {ARTIST_TYPE_OPTIONS.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
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
              <SelectItem key={city} value={city}>
                {city}
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
            {totalCount} artista{totalCount !== 1 ? 's' : ''} encontrado{totalCount !== 1 ? 's' : ''}
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
          
          {filters.artistType !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Tipo: {ARTIST_TYPE_OPTIONS.find(t => t.value === filters.artistType)?.label}
              <button 
                onClick={() => onFiltersChange({ artistType: 'all' })}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          
          {filters.city !== 'all' && (
            <Badge variant="outline" className="gap-1">
              Cidade: {filters.city}
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