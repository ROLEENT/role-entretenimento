import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { PageWrapper } from '@/components/PageWrapper';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAgendaData } from '@/hooks/useAgendaData';

const CITIES = [
  { key: 'porto_alegre', name: 'POA', fullName: 'Porto Alegre' },
  { key: 'curitiba', name: 'CWB', fullName: 'Curitiba' },
  { key: 'florianopolis', name: 'FLN', fullName: 'Florianópolis' },
  { key: 'sao_paulo', name: 'SP', fullName: 'São Paulo' },
  { key: 'rio_de_janeiro', name: 'RIO', fullName: 'Rio de Janeiro' },
];

export default function Agenda() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const activeTab = (searchParams.get('tab') as 'vitrine' | 'curadoria') || 'vitrine';
  
  const { agendaItems, cityStats, isLoading, error, refetch } = useAgendaData(activeTab);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (agendaItems.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, agendaItems.length - 2));
    }
  };

  const prevSlide = () => {
    if (agendaItems.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + Math.max(1, agendaItems.length - 2)) % Math.max(1, agendaItems.length - 2));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'short' 
    }).replace('.', '');
  };

  const totalEvents = cityStats.reduce((sum, city) => sum + city.count, 0);
  const activeCities = cityStats.filter(city => city.count > 0).length;

  if (error) {
    return (
      <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
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
    <PageWrapper title="Agenda ROLÊ" description="Agenda cultural atualizada semanalmente">
      <Header />
      
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="px-4 py-12 bg-gradient-subtle">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Agenda</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Eventos culturais selecionados com curadoria especializada, atualizados semanalmente.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Atualizado semanal
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {activeCities} cidades
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {totalEvents} eventos
              </Badge>
            </div>
          </div>
        </section>

        {/* Tabs and Carousel */}
        <section className="px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
                <TabsTrigger value="vitrine" aria-label="Eventos em vitrine">
                  Vitrine
                </TabsTrigger>
                <TabsTrigger value="curadoria" aria-label="Eventos da curadoria">
                  Destaques
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-[3/2] bg-muted animate-pulse" />
                        <CardContent className="p-4 space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                          <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    {/* Carousel */}
                    <div className="overflow-hidden">
                      <div 
                        className="flex transition-transform duration-300 ease-in-out gap-6"
                        style={{ transform: `translateX(-${currentSlide * 33.333}%)` }}
                      >
                        {agendaItems.map((item) => (
                          <div key={item.id} className="flex-none w-full md:w-1/3">
                            <Card className="overflow-hidden h-full">
                              <div className="aspect-[3/2] relative overflow-hidden">
                                {item.cover_url ? (
                                  <img
                                    src={item.cover_url}
                                    alt={item.alt_text || item.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Calendar className="w-12 h-12 text-muted-foreground" />
                                  </div>
                                )}
                                <Badge 
                                  className="absolute top-3 left-3"
                                  variant={item.visibility_type === 'vitrine' ? 'default' : 'secondary'}
                                >
                                  {item.visibility_type === 'vitrine' ? 'Vitrine' : 'Curadoria'}
                                </Badge>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-semibold text-lg line-clamp-2 mb-2">
                                  {item.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {item.city} · {item.start_at ? formatDate(item.start_at) : 'Data a definir'}
                                </p>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Carousel Controls */}
                    {agendaItems.length > 3 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10"
                          onClick={prevSlide}
                          aria-label="Evento anterior"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10"
                          onClick={nextSlide}
                          aria-label="Próximo evento"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        {/* Pagination Dots */}
                        <div className="flex justify-center mt-6 space-x-2">
                          {[...Array(Math.max(1, agendaItems.length - 2))].map((_, i) => (
                            <button
                              key={i}
                              className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                currentSlide === i ? "bg-primary" : "bg-muted"
                              )}
                              onClick={() => setCurrentSlide(i)}
                              aria-label={`Ir para slide ${i + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="px-4 py-12 bg-muted/50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Agendas por cidade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CITIES.map((city) => {
                const stats = cityStats.find(s => s.city === city.key);
                const count = stats?.count || 0;
                
                return (
                  <Button
                    key={city.key}
                    variant="outline"
                    className="h-20 flex flex-col justify-center"
                    onClick={() => window.location.href = `/agenda/${city.key}`}
                  >
                    <span className="font-semibold text-lg">{city.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} eventos
                    </span>
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                className="h-20 flex flex-col justify-center"
                onClick={() => window.location.href = '/agenda/outras'}
              >
                <span className="font-semibold text-lg">Outras cidades</span>
                <span className="text-sm text-muted-foreground">Selecionar</span>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageWrapper>
  );
}