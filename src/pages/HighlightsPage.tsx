import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePublishedHighlights } from '@/hooks/usePublishedHighlights';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOOptimizations from '@/components/SEOOptimizations';
import AccessibilityEnhancements from '@/components/AccessibilityEnhancements';
import HighlightCard from '@/components/HighlightCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Calendar, MapPin } from 'lucide-react';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import LazyImage from '@/components/LazyImage';

const HighlightsPage = () => {
  const { highlights, loading, error } = usePublishedHighlights();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [filteredHighlights, setFilteredHighlights] = useState(highlights);

  useEffect(() => {
    let filtered = highlights;

    if (searchTerm) {
      filtered = filtered.filter(highlight =>
        highlight.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        highlight.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        highlight.role_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity !== 'all') {
      filtered = filtered.filter(highlight => highlight.city === selectedCity);
    }

    setFilteredHighlights(filtered);
  }, [highlights, searchTerm, selectedCity]);

  const cities = [
    { value: 'all', label: 'Todas as cidades' },
    { value: 'porto_alegre', label: 'Porto Alegre' },
    { value: 'sao_paulo', label: 'São Paulo' },
    { value: 'rio_de_janeiro', label: 'Rio de Janeiro' },
    { value: 'florianopolis', label: 'Florianópolis' },
    { value: 'curitiba', label: 'Curitiba' }
  ];

  const getCityStats = () => {
    const cityStats = highlights.reduce((acc, highlight) => {
      acc[highlight.city] = (acc[highlight.city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return cityStats;
  };

  const cityStats = getCityStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-3/4 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Erro ao carregar destaques</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOOptimizations
        title="Todos os Destaques Culturais | ROLÊ - Curadoria de Eventos"
        description="Explore todos os destaques culturais selecionados pela equipe ROLÊ. Eventos, shows e experiências culturais nas principais cidades do Brasil."
        url="https://roleentretenimento.com/highlights"
      />
      
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <ScrollAnimationWrapper>
          <section className="py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
            <div className="container mx-auto px-4 text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
                Todos os Destaques
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Explore nossa curadoria completa de eventos culturais imperdíveis nas principais cidades do Brasil.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Badge variant="outline" className="px-4 py-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  {highlights.length} destaques
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <MapPin className="w-4 h-4 mr-2" />
                  {Object.keys(cityStats).length} cidades
                </Badge>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Filters */}
        <ScrollAnimationWrapper>
          <section className="py-8 bg-background border-b">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar por evento, local ou descrição..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger className="w-full md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.value} value={city.value}>
                          {city.label}
                          {city.value !== 'all' && cityStats[city.value] && (
                            <span className="ml-2 text-muted-foreground">
                              ({cityStats[city.value]})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {filteredHighlights.length} de {highlights.length} destaques
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Highlights Grid */}
        <ScrollAnimationWrapper>
          <section className="py-16">
            <div className="container mx-auto px-4">
              {filteredHighlights.length === 0 ? (
                <Card className="p-12 text-center">
                  <CardContent>
                    <h3 className="text-xl font-semibold mb-4">Nenhum destaque encontrado</h3>
                    <p className="text-muted-foreground mb-6">
                      Tente ajustar seus filtros ou termo de busca.
                    </p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCity('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredHighlights.map((highlight) => (
                    <HighlightCard key={highlight.id} highlight={highlight} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Call to Action */}
        <ScrollAnimationWrapper>
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">Quer mais conteúdo cultural?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Explore nossa agenda completa de eventos e descubra ainda mais experiências culturais na sua cidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/eventos">
                    Ver Agenda Completa
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/destaques">
                    Explorar por Cidade
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default HighlightsPage;