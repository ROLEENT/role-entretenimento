import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { AgendaFilters } from '@/components/agenda/AgendaFilters';
import { FilteredAgendaList } from '@/components/agenda/FilteredAgendaList';

export default function AgendaTodos() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(true);
  
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

  return (
    <PageWrapper 
      title="Todos os Eventos - Agenda ROLÊ" 
      description="Explore todos os eventos culturais disponíveis com filtros personalizados"
    >
      <div className="pt-20">
        {/* Hero Section */}
        <section className="px-4 py-12 bg-gradient-subtle">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Todos os Eventos</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore nossa agenda completa de eventos culturais. Use os filtros para encontrar exatamente o que você procura.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 py-6 border-b">
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

        {/* Events List */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <FilteredAgendaList 
              filters={filters}
              showViewMore={false}
            />
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}