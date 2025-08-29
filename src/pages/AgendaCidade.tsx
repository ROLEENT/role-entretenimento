import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, MapPin, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAgendaCidadeData } from '@/hooks/useAgendaCidadeData';

const CITY_NAMES: Record<string, string> = {
  'porto_alegre': 'Porto Alegre',
  'curitiba': 'Curitiba',
  'florianopolis': 'Florianópolis',
  'sao_paulo': 'São Paulo',
  'rio_de_janeiro': 'Rio de Janeiro',
};

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Hoje' },
  { value: 'weekend', label: 'Fim de semana' },
  { value: 'week', label: 'Próximos 7 dias' },
  { value: 'month', label: 'Este mês' },
  { value: 'custom', label: 'Personalizado' },
];

export default function AgendaCidade() {
  const { cidade } = useParams<{ cidade: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const currentTab = (searchParams.get('tab') as 'vitrine' | 'curadoria') || 'vitrine';
  const currentSearch = searchParams.get('search') || '';
  const currentPeriod = searchParams.get('periodo') || 'week';
  const currentTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const currentPage = parseInt(searchParams.get('page') || '1');

  // Local state for inputs
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [selectedTags, setSelectedTags] = useState<string[]>(currentTags);

  const cityName = cidade ? CITY_NAMES[cidade] || cidade : 'Cidade';

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
    visibilityType: currentTab,
    search: currentSearch,
    period: currentPeriod,
    tags: currentTags,
    page: currentPage,
  });

  // Update URL when filters change
  const updateFilters = (updates: Record<string, string | string[] | number | null>) => {
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
    if (!updates.page) {
      newParams.delete('page');
    }

    setSearchParams(newParams);
  };

  const handleTabChange = (value: string) => {
    updateFilters({ tab: value });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput.trim() });
  };

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
    setSearchInput('');
    setSelectedTags([]);
    updateFilters({ 
      search: null, 
      periodo: 'week', 
      tags: null,
      page: null
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).replace('.', '');
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!endDate) return formatDate(startDate);
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Same day
    if (start.toDateString() === end.toDateString()) {
      return `${start.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} ${start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`.replace('.', '');
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  if (!cidade || !CITY_NAMES[cidade]) {
    return (
      <PageWrapper title="Cidade não encontrada">
        <Header />
        <main className="min-h-screen pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Cidade não encontrada</h1>
            <Button onClick={() => navigate('/agenda')}>
              Ver todas as cidades
            </Button>
          </div>
        </main>
        <Footer />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title={`Agenda ${cityName}`}>
        <Header />
        <main className="min-h-screen pt-20 px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar agenda</h1>
            <p className="text-muted-foreground mb-6">Não foi possível carregar os eventos.</p>
            <Button onClick={() => refetch()}>Tentar de novo</Button>
          </div>
        </main>
        <Footer />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper 
      title={`Agenda ${cityName}`} 
      description={`Eventos culturais em ${cityName} selecionados com curadoria especializada`}
    >
      <Header />
      
      <main className="min-h-screen pt-20">
        {/* Header */}
        <section className="px-4 py-6 border-b">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/agenda')}
              className="mb-4 -ml-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">Agenda {cityName}</h1>
            <p className="text-muted-foreground mb-4">
              Eventos culturais selecionados com curadoria especializada
            </p>
            
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {totalCount} eventos
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {currentPeriod === 'today' ? 'Hoje' : 
                 currentPeriod === 'weekend' ? 'Fim de semana' :
                 currentPeriod === 'week' ? 'Próximos 7 dias' :
                 currentPeriod === 'month' ? 'Este mês' : 'Período personalizado'}
              </Badge>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-4 py-6 bg-muted/50">
          <div className="max-w-6xl mx-auto space-y-4">
            <Tabs value={currentTab} onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="vitrine">Vitrine</TabsTrigger>
                <TabsTrigger value="curadoria">Destaques</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-4">
              <form onSubmit={handleSearchSubmit} className="flex-1 min-w-64">
                <Input
                  placeholder="Buscar por título..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full"
                />
              </form>

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

              {availableTags.length > 0 && (
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Tags" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.map(tag => (
                      <SelectItem 
                        key={tag} 
                        value={tag}
                        onSelect={() => handleTagToggle(tag)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag)}
                            readOnly
                            className="pointer-events-none"
                          />
                          {tag}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpar
              </Button>
            </div>

            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="cursor-pointer"
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
                {[...Array(9)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-[3/2] w-full" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nada encontrado para estes filtros</h2>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar os filtros ou explore outras cidades.
                </p>
                <Button onClick={() => navigate('/agenda')}>
                  Ver todas as cidades
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {items.map((item) => {
                    const isCuradoria = item.visibility_type === 'curadoria';
                    const itemTags = item.tags || [];
                    const displayTags = itemTags.slice(0, 2);
                    const extraTagsCount = Math.max(0, itemTags.length - 2);

                    return (
                      <Card 
                        key={item.id} 
                        className={cn(
                          "overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                          isCuradoria ? "bg-slate-900 text-white border-slate-800" : "bg-card"
                        )}
                        onClick={() => window.location.href = `/agenda/${item.slug || item.id}`}
                      >
                        <div className="aspect-[3/2] relative overflow-hidden">
                          {item.cover_url ? (
                            <img
                              src={item.cover_url}
                              alt={item.alt_text || item.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              srcSet={`${item.cover_url}?w=400 400w, ${item.cover_url}?w=600 600w`}
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Calendar className="w-12 h-12 text-muted-foreground" />
                            </div>
                          )}
                          <Badge 
                            className={cn(
                              "absolute top-3 left-3",
                              isCuradoria ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
                            )}
                          >
                            {isCuradoria ? 'Curadoria' : 'Vitrine'}
                          </Badge>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className={cn(
                            "font-semibold text-lg line-clamp-2 mb-2",
                            isCuradoria ? "text-white" : "text-foreground"
                          )}>
                            {item.title}
                          </h3>
                          
                          <p className={cn(
                            "text-sm mb-3",
                            isCuradoria ? "text-slate-300" : "text-muted-foreground"
                          )}>
                            {cityName} · {item.start_at ? formatDateRange(item.start_at, item.end_at || undefined) : 'Data a definir'}
                          </p>
                          
                          {itemTags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {displayTags.map(tag => (
                                <Badge 
                                  key={tag} 
                                  variant={isCuradoria ? "secondary" : "outline"}
                                  className={cn(
                                    "text-xs",
                                    isCuradoria ? "bg-slate-800 text-slate-200 border-slate-700" : ""
                                  )}
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {extraTagsCount > 0 && (
                                <Badge 
                                  variant={isCuradoria ? "secondary" : "outline"}
                                  className={cn(
                                    "text-xs",
                                    isCuradoria ? "bg-slate-800 text-slate-200 border-slate-700" : ""
                                  )}
                                >
                                  +{extraTagsCount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                    >
                      Anterior
                    </Button>
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
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
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageWrapper>
  );
}