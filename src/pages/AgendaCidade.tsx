import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, MapPin, Filter, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgendaCidadeData } from '@/hooks/useAgendaCidadeData';
import { useSearchDebounce } from '@/hooks/useSearchDebounce';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { slugToCityName, isCapitalSlug, capitalSlugToCode } from '@/lib/cityToSlug';


const PERIOD_OPTIONS = [
  { value: 'hoje', label: 'Hoje' },
  { value: 'fim-de-semana', label: 'Fim de semana' },
  { value: 'proximos-7-dias', label: 'Próximos 7 dias' },
  { value: 'este-mes', label: 'Este mês' },
];

const EventCard = ({ item, cityName }: { item: any; cityName: string }) => {
  const navigate = useNavigate();
  const itemTags = item.tags || [];
  const displayTags = itemTags.slice(0, 2);
  const extraTagsCount = Math.max(0, itemTags.length - 2);

  const formatDateRange = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    
    if (!end || start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }).replace('.', '');
    }
    
    return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`.replace(/\./g, '');
  };

  const handleClick = () => {
    navigate(`/agenda/${item.slug || item.id}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all hover:shadow-lg group"
      onClick={handleClick}
    >
      <div className="aspect-[3/2] relative overflow-hidden">
        {item.cover_url ? (
          <picture>
            <source 
              media="(min-width: 1024px)"
              srcSet={`${item.cover_url}?w=400&h=300&fit=crop 400w, ${item.cover_url}?w=600&h=400&fit=crop 600w`}
              sizes="(min-width: 1200px) 400px, (min-width: 1024px) 350px, (min-width: 768px) 50vw, 100vw"
            />
            <img
              src={`${item.cover_url}?w=300&h=200&fit=crop`}
              alt={item.alt_text || item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              decoding="async"
            />
          </picture>
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-3">
          {cityName} · {item.start_at ? formatDateRange(item.start_at, item.end_at || undefined) : 'Data a definir'}
        </p>
        
        {itemTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {displayTags.map(tag => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
            {extraTagsCount > 0 && (
              <Badge 
                variant="secondary"
                className="text-xs"
              >
                +{extraTagsCount}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const EventCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-[3/2] w-full" />
    <CardContent className="p-4 space-y-2">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
    </CardContent>
  </Card>
);

export default function AgendaCidade() {
  const { cidade } = useParams<{ cidade: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const currentSearch = searchParams.get('busca') || '';
  const currentPeriod = searchParams.get('periodo') || 'proximos-7-dias';
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);
  const [tagsOpen, setTagsOpen] = useState(false);

  const cityName = cidade ? slugToCityName(cidade) : 'Cidade';

  // Update URL when filters change
  const updateFilters = useCallback((updates: Record<string, string | string[] | number | null>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        newParams.delete(key);
      } else if (Array.isArray(value)) {
        newParams.set(key, value.join(','));
      } else {
        newParams.set(key, String(value));
      }
    });

    // Reset page when filters change (except for page updates)
    if (!updates.page && updates.page !== 0) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Search with debounce
  const handleSearch = useCallback((value: string) => {
    updateFilters({ busca: value.trim() || null });
  }, [updateFilters]);

  const { inputValue, handleInputChange, setValue } = useSearchDebounce({
    initialValue: currentSearch,
    delay: 300,
    onSearch: handleSearch,
  });

  const { 
    items, 
    totalCount, 
    totalPages, 
    availableTags, 
    isLoading, 
    error, 
    refetch 
  } = useAgendaCidadeData({
    city: cidade!,
    search: currentSearch,
    period: currentPeriod,
    tags: currentTags,
    page: currentPage,
  });

  const handlePeriodChange = (value: string) => {
    updateFilters({ periodo: value });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    updateFilters({ tags: newTags });
  };

  const handleClearFilters = () => {
    setValue(undefined);
    setSelectedTags([]);
    updateFilters({ 
      busca: null, 
      periodo: 'proximos-7-dias', 
      tags: null,
      page: null
    });
  };

  // Validate city slug exists (either capital or valid slug format)
  if (!cidade) {
    return (
      <PageWrapper 
        title="Cidade não encontrada - ROLÊ"
        description="A cidade solicitada não foi encontrada em nossa agenda."
      >
        <div className="pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-3xl font-bold mb-4">Cidade não encontrada</h1>
            <p className="text-muted-foreground mb-6">
              Nenhuma cidade foi especificada.
            </p>
            <Button onClick={() => navigate('/agenda')}>
              Ver todas as cidades
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title={`Agenda ${cityName} - ROLÊ`}>
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

  const getPeriodLabel = (period: string) => {
    const option = PERIOD_OPTIONS.find(p => p.value === period);
    return option?.label || 'Período personalizado';
  };

  const hasActiveFilters = currentSearch || currentTags.length > 0 || currentPeriod !== 'proximos-7-dias';

  return (
    <PageWrapper 
      title={`Agenda ${cityName} - ROLÊ`}
      description={`Eventos culturais em ${cityName} selecionados com curadoria especializada. Descubra shows, festivais e experiências únicas.`}
    >
      {/* SEO Meta Tags */}
      <head>
        <title>Agenda {cityName} - ROLÊ</title>
        <meta name="description" content={`Eventos culturais em ${cityName} selecionados com curadoria especializada. Descubra shows, festivais e experiências únicas.`} />
        <link rel="canonical" href={`https://role.com.br/agenda/cidade/${cidade}${currentPeriod !== 'proximos-7-dias' ? `?periodo=${currentPeriod}` : ''}`} />
      </head>
      
      <div className="pt-20">
        {/* Header */}
        <section className="px-4 py-6 border-b bg-gradient-subtle">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/agenda')}
              className="mb-4 -ml-4 hover:bg-background/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Agenda {cityName}</h1>
            <p className="text-muted-foreground mb-4 max-w-2xl">
              Eventos culturais selecionados com curadoria especializada em {cityName}
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {isLoading ? (
                  <span className="animate-pulse bg-muted rounded w-8 h-4 inline-block" />
                ) : (
                  `${totalCount} eventos`
                )}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {getPeriodLabel(currentPeriod)}
              </Badge>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 py-6 bg-muted/30">
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex flex-wrap gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar eventos por título..."
                  value={inputValue}
                  onChange={handleInputChange}
                  className="pl-10"
                />
              </div>

              {/* Period */}
              <Select value={currentPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Tags */}
              {availableTags.length > 0 && (
                <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-48 justify-between">
                      <span>
                        {selectedTags.length === 0 
                          ? 'Filtrar por tags' 
                          : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}`
                        }
                      </span>
                      <Filter className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableTags.map(tag => (
                        <div key={tag} className="flex items-center space-x-2">
                          <Checkbox
                            id={tag}
                            checked={selectedTags.includes(tag)}
                            onCheckedChange={() => handleTagToggle(tag)}
                          />
                          <label htmlFor={tag} className="text-sm cursor-pointer flex-1">
                            {tag}
                          </label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}

              {/* Clear filters */}
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Limpar
                </Button>
              )}
            </div>

            {/* Selected tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(12)].map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="error-state">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
                <h2 className="text-heading-3 mb-2">Nada encontrado para estes filtros</h2>
                <p className="error-message">
                  Tente ajustar os filtros ou explore outras cidades.
                </p>
                <Button onClick={() => navigate('/agenda')} className="focus-visible">
                  Ver todas as cidades
                </Button>
              </div>
            ) : (
              <>
                <div className="accessible-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-8" role="list" aria-label="Lista de eventos">
                  {items.map((item) => (
                    <EventCard key={item.id} item={item} cityName={cityName} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                    >
                      « Anterior
                    </Button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let page: number;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      
                      const isActive = page === currentPage;
                      
                      return (
                        <Button
                          key={page}
                          variant={isActive ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateFilters({ page })}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                    >
                      Próxima »
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}