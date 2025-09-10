import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProfileSearch, type SearchFilters } from '@/features/search/hooks/useProfileSearch';
import { Link } from 'react-router-dom';
import { useDebounce } from 'use-debounce';

const typeLabels = {
  artista: 'Artista',
  local: 'Local',
  organizador: 'Organizador'
};

const typeRoutes = {
  artista: 'artistas',
  local: 'locais', 
  organizador: 'organizadores'
};

export function ProfileSearch() {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [debouncedQuery] = useDebounce(filters.query, 300);
  
  const { data: results, isLoading } = useProfileSearch({
    ...filters,
    query: debouncedQuery,
    limit: 20
  });

  const hasActiveFilters = filters.query || filters.type || filters.city;

  const clearFilters = () => {
    setFilters({});
  };

  const updateFilter = (key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar artistas, locais ou organizadores..."
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={filters.type || ''} onValueChange={(value) => updateFilter('type', value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os tipos</SelectItem>
              <SelectItem value="artista">Artistas</SelectItem>
              <SelectItem value="local">Locais</SelectItem>
              <SelectItem value="organizador">Organizadores</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Cidade"
            value={filters.city || ''}
            onChange={(e) => updateFilter('city', e.target.value)}
            className="w-48"
          />

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            Buscando...
          </div>
        )}

        {!isLoading && hasActiveFilters && (!results || results.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum resultado encontrado para sua busca.
          </div>
        )}

        {!isLoading && results && results.length > 0 && (
          <>
            <div className="text-sm text-muted-foreground">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((profile) => (
                <Link
                  key={profile.id}
                  to={`/${typeRoutes[profile.type]}/${profile.handle}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={profile.avatar_url} alt={profile.name} />
                          <AvatarFallback>
                            {profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-medium truncate">{profile.name}</h3>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {typeLabels[profile.type]}
                            </Badge>
                          </div>

                          {profile.bio_short && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {profile.bio_short}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {profile.city}
                            {profile.category_name && (
                              <>
                                <span>•</span>
                                <span>{profile.category_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

        {!hasActiveFilters && (
          <div className="text-center py-8 text-muted-foreground">
            Digite algo na busca para encontrar perfis
          </div>
        )}
      </div>
    </div>
  );
}