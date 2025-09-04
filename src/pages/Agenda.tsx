import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users } from 'lucide-react';
import { useAgendaData } from '@/hooks/useAgendaData';
import { CounterAnimation } from '@/components/CounterAnimation';
import { HorizontalCarousel } from '@/components/HorizontalCarousel';
import { AgendaFilters } from '@/components/agenda/AgendaFilters';
import { FilteredAgendaList } from '@/components/agenda/FilteredAgendaList';

const CITIES = [
  { key: 'porto_alegre', name: 'POA', fullName: 'Porto Alegre' },
  { key: 'curitiba', name: 'CWB', fullName: 'Curitiba' },
  { key: 'florianopolis', name: 'FLN', fullName: 'Florianópolis' },
  { key: 'sao_paulo', name: 'SP', fullName: 'São Paulo' },
  { key: 'rio_de_janeiro', name: 'RIO', fullName: 'Rio de Janeiro' },
];


export default function Agenda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  
  // Initialize filters from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    city: searchParams.get('city') || '',
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || []
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    if (filters.city) params.set('city', filters.city);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const { upcomingEvents, cityStats, stats, isLoadingEvents, error, refetch } = useAgendaData(filters);

  if (error) {
    return (
      <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar agenda</h1>
            <p className="text-muted-foreground mb-6">Não foi possível carregar os eventos.</p>
            <Button onClick={() => refetch()}>Tentar de novo</Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="px-4 py-12 bg-gradient-subtle">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Agenda</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Eventos culturais selecionados com curadoria especializada, atualizados semanalmente.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <Calendar className="w-4 h-4" />
                Atualizado semanal
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <MapPin className="w-4 h-4" />
                <CounterAnimation target={stats.totalCities} isLoading={stats.isLoading} /> cidades
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2 text-base py-2 px-4">
                <Users className="w-4 h-4" />
                <CounterAnimation target={stats.totalEvents} isLoading={stats.isLoading} /> eventos
              </Badge>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 py-6">
          <div className="max-w-6xl mx-auto">
            <AgendaFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={() => setFilters({
                search: '',
                status: 'all',
                city: '',
                tags: []
              })}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />
          </div>
        </section>

        {/* Filtered Events List */}
        {(filters.search || filters.city || (filters.status && filters.status !== 'all')) && (
          <section className="px-4 py-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">Eventos filtrados</h2>
              <FilteredAgendaList 
                filters={filters} 
                limit={20} 
                showViewMore={true}
              />
            </div>
          </section>
        )}

        {/* Upcoming Events Horizontal Carousel */}
        <HorizontalCarousel 
          items={upcomingEvents}
          title={filters.search || filters.city || (filters.status && filters.status !== 'all') ? "Eventos em destaque" : "Próximos eventos"}
          isLoading={isLoadingEvents}
          className="px-4"
        />

        {/* Cities Grid */}
        <section className="px-4 py-12 bg-muted/50 section-spacing">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-heading-2 text-center element-spacing">Agendas por cidade</h2>
            
            <div className="accessible-grid grid-cols-1 md:grid-cols-3" role="list" aria-label="Cidades disponíveis">
              {CITIES.map((city) => {
                // Map city stats using full city name instead of key
                const fullCityName = city.fullName;
                const stats = cityStats.find(s => s.city === fullCityName);
                const count = stats?.count || 0;
                
                return (
                  <Button
                    key={city.key}
                    variant="outline"
                    className="h-20 flex flex-col justify-center hover:bg-primary/5 transition-colors shadow-card focus-visible"
                    asChild
                    role="listitem"
                  >
                    <Link to={`/agenda/cidade/${city.key}`} aria-label={`Ver agenda de ${city.name}`}>
                      <span className="font-semibold text-lg">{city.name}</span>
                      <span className="text-chip text-muted-foreground">
                        {count} eventos
                      </span>
                    </Link>
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                className="h-20 flex flex-col justify-center hover:bg-primary/5 transition-colors shadow-card focus-visible"
                asChild
                role="listitem"
              >
                <Link to="/agenda/cidade/outras" aria-label="Ver outras cidades">
                  <span className="font-semibold text-lg">Outras cidades</span>
                  <span className="text-chip text-muted-foreground">Selecionar</span>
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}