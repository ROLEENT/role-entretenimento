import { useState } from 'react';
import { Filter, Search, MapPin, Calendar, DollarSign, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface CityFiltersProps {
  onFilterChange: (filters: any) => void;
}

const CityFilters = ({ onFilterChange }: CityFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    genre: '',
    priceRange: '',
    date: '',
    venueType: '',
    capacity: '',
    features: [] as string[]
  });

  const genres = [
    'Eletrônica', 'Rock', 'Funk', 'Sertanejo', 'Jazz', 'Pop', 'Hip Hop', 
    'Techno', 'House', 'Samba', 'Pagode', 'MPB', 'Indie', 'Metal'
  ];

  const venueTypes = [
    'Boate', 'Casa de Shows', 'Bar', 'Pub', 'Club', 'Arena', 'Festival', 
    'Teatro', 'Centro de Eventos', 'Roof Top', 'Beach Club'
  ];

  const priceRanges = [
    { label: 'Gratuito', value: 'free' },
    { label: 'Até R$ 30', value: '0-30' },
    { label: 'R$ 30 - R$ 60', value: '30-60' },
    { label: 'R$ 60 - R$ 100', value: '60-100' },
    { label: 'R$ 100 - R$ 200', value: '100-200' },
    { label: 'Acima de R$ 200', value: '200+' }
  ];

  const capacityRanges = [
    { label: 'Intimista (até 100)', value: '0-100' },
    { label: 'Médio (100-500)', value: '100-500' },
    { label: 'Grande (500-1500)', value: '500-1500' },
    { label: 'Arena (1500+)', value: '1500+' }
  ];

  const features = [
    'Área VIP', 'Open Bar', 'Área Fumante', 'Estacionamento', 
    'Acessibilidade', 'Ar Condicionado', 'Área Externa', 'Food Truck'
  ];

  const handleFilterChange = (key: string, value: string | string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleFeatureChange = (feature: string, checked: boolean) => {
    const newFeatures = checked 
      ? [...filters.features, feature]
      : filters.features.filter(f => f !== feature);
    handleFilterChange('features', newFeatures);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      genre: '',
      priceRange: '',
      date: '',
      venueType: '',
      capacity: '',
      features: []
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(value => 
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  ).length;

  return (
    <section className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <Card>
          <CardContent className="p-6">
            {/* Main Filters */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar eventos, venues, artistas..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    Gênero Musical
                  </label>
                  <Select value={filters.genre} onValueChange={(value) => handleFilterChange('genre', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os gêneros" />
                    </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                       {genres.map((genre) => (
                         <SelectItem key={genre} value={genre}>
                           {genre}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Faixa de Preço
                  </label>
                  <Select value={filters.priceRange} onValueChange={(value) => handleFilterChange('priceRange', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer preço" />
                    </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                       {priceRanges.map((range) => (
                         <SelectItem key={range.value} value={range.value}>
                           {range.label}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data
                  </label>
                  <Select value={filters.date} onValueChange={(value) => handleFilterChange('date', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qualquer data" />
                    </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                       <SelectItem value="today">Hoje</SelectItem>
                       <SelectItem value="tomorrow">Amanhã</SelectItem>
                       <SelectItem value="weekend">Fim de semana</SelectItem>
                       <SelectItem value="week">Esta semana</SelectItem>
                       <SelectItem value="month">Este mês</SelectItem>
                     </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Tipo de Venue
                  </label>
                  <Select value={filters.venueType} onValueChange={(value) => handleFilterChange('venueType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                      <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                       {venueTypes.map((type) => (
                         <SelectItem key={type} value={type}>
                           {type}
                         </SelectItem>
                       ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filtros Avançados
                  </Button>
                  
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">
                      Limpar Filtros ({activeFiltersCount})
                    </Button>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  {activeFiltersCount > 0 && (
                    <span>{activeFiltersCount} filtro(s) ativo(s)</span>
                  )}
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvanced && (
                <div className="pt-6 border-t space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Capacity Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Capacidade do Venue</label>
                      <Select value={filters.capacity} onValueChange={(value) => handleFilterChange('capacity', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Qualquer capacidade" />
                        </SelectTrigger>
                         <SelectContent position="popper" className="z-[9999] bg-popover border shadow-lg">
                           {capacityRanges.map((range) => (
                             <SelectItem key={range.value} value={range.value}>
                               {range.label}
                             </SelectItem>
                           ))}
                         </SelectContent>
                      </Select>
                    </div>

                    {/* Features Filter */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Recursos e Comodidades</label>
                      <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                        {features.map((feature) => (
                          <div key={feature} className="flex items-center space-x-2">
                            <Checkbox
                              id={feature}
                              checked={filters.features.includes(feature)}
                              onCheckedChange={(checked) => handleFeatureChange(feature, !!checked)}
                            />
                            <label
                              htmlFor={feature}
                              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {feature}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Filters Display */}
              {activeFiltersCount > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <Badge variant="secondary" className="gap-2">
                        Busca: {filters.search}
                        <button onClick={() => handleFilterChange('search', '')}>×</button>
                      </Badge>
                    )}
                    {filters.genre && (
                      <Badge variant="secondary" className="gap-2">
                        {filters.genre}
                        <button onClick={() => handleFilterChange('genre', '')}>×</button>
                      </Badge>
                    )}
                    {filters.priceRange && (
                      <Badge variant="secondary" className="gap-2">
                        {priceRanges.find(r => r.value === filters.priceRange)?.label}
                        <button onClick={() => handleFilterChange('priceRange', '')}>×</button>
                      </Badge>
                    )}
                    {filters.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="gap-2">
                        {feature}
                        <button onClick={() => handleFeatureChange(feature, false)}>×</button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CityFilters;