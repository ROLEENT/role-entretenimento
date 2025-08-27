import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useHighlightsByCity } from '@/hooks/useHighlights';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import HighlightCard from '@/components/HighlightCard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ArrowLeft, Calendar, MapPin, Heart } from 'lucide-react';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import { citiesData } from '@/data/citiesData';
import LazyImage from '@/components/LazyImage';

type CityEnum = 'porto_alegre' | 'sao_paulo' | 'rio_de_janeiro' | 'florianopolis' | 'curitiba';

const citySlugMapping: Record<string, CityEnum> = {
  'porto_alegre': 'porto_alegre',
  'porto-alegre': 'porto_alegre',
  'sao_paulo': 'sao_paulo',
  'sao-paulo': 'sao_paulo', 
  'rio_de_janeiro': 'rio_de_janeiro',
  'rio-de-janeiro': 'rio_de_janeiro',
  'florianopolis': 'florianopolis',
  'curitiba': 'curitiba'
};

const cityDisplayNames: Record<CityEnum, string> = {
  'porto_alegre': 'Porto Alegre',
  'sao_paulo': 'São Paulo',
  'rio_de_janeiro': 'Rio de Janeiro',
  'florianopolis': 'Florianópolis',
  'curitiba': 'Curitiba'
};

const CityHighlightsPage = () => {
  const { cidade } = useParams<{ cidade: string }>();
  
  console.log('🏙️ CityHighlightsPage - Parâmetro cidade recebido:', cidade);
  
  const cityEnum = cidade ? citySlugMapping[cidade] : null;
  
  console.log('🗺️ Cidade mapeada para enum:', cityEnum);
  console.log('📋 Mapeamento disponível:', Object.keys(citySlugMapping));
  
  const { highlights, loading, error } = useHighlightsByCity(cityEnum);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHighlights, setFilteredHighlights] = useState(highlights);

  useEffect(() => {
    console.log('🔄 Atualizando highlights filtrados:', highlights.length, 'destaques disponíveis');
    
    let filtered = highlights;

    if (searchTerm) {
      filtered = filtered.filter(highlight =>
        highlight.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        highlight.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        highlight.role_text.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 Filtrados por busca:', filtered.length, 'resultados');
    }

    setFilteredHighlights(filtered);
  }, [highlights, searchTerm]);

  const cityKey = cidade ? cidade.replace(/_/g, '-') : null;
  const cityData = cityKey ? citiesData[cityKey] : null;
  const cityName = cityEnum ? cityDisplayNames[cityEnum] : '';

  if (cidade && (!cityEnum || !cityData)) {
    console.log('❌ Cidade não mapeada ou dados não encontrados:', { cidade, cityEnum, cityData: !!cityData });
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Cidade não encontrada</h1>
            <p className="text-muted-foreground mb-8">
              A cidade "{cidade}" não foi encontrada.
            </p>
            <Button asChild>
              <Link to="/destaques">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar aos Destaques
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    console.log('⏳ Carregando destaques para:', cityEnum);
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
    console.log('💥 Erro ao carregar destaques:', error);
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

  const totalLikes = highlights.reduce((acc, highlight) => acc + highlight.like_count, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Destaques Culturais em ${cityName} | ROLÊ - Curadoria de Eventos`}
        description={`Explore os melhores eventos culturais em ${cityName}. Destaques selecionados pela equipe ROLÊ: shows, festivais e experiências imperdíveis.`}
        url={`https://roleentretenimento.com/highlights/${cidade}`}
      />
      
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <ScrollAnimationWrapper>
          <section className="relative py-20 overflow-hidden">
            <div className="absolute inset-0">
              <LazyImage
                src={cityData.image}
                alt={`Vista de ${cityName}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
            <div className="relative container mx-auto px-4 text-center text-white">
              <Button 
                asChild 
                variant="ghost" 
                className="absolute top-0 left-0 text-white hover:bg-white/20"
              >
                <Link to="/destaques">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar aos Destaques
                </Link>
              </Button>
              
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <MapPin className="w-4 h-4 mr-2" />
                {cityData.state}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Destaques em {cityName}
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                {cityData.description}
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Badge variant="outline" className="px-4 py-2 bg-white/10 text-white border-white/30">
                  <Calendar className="w-4 h-4 mr-2" />
                  {highlights.length} destaques
                </Badge>
                <Badge variant="outline" className="px-4 py-2 bg-white/10 text-white border-white/30">
                  <Heart className="w-4 h-4 mr-2" />
                  {totalLikes} curtidas
                </Badge>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Search */}
        <ScrollAnimationWrapper>
          <section className="py-8 bg-background border-b">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar destaques em..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
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
                    {searchTerm ? (
                      <>
                        <h3 className="text-xl font-semibold mb-4">Nenhum destaque encontrado</h3>
                        <p className="text-muted-foreground mb-6">
                          Não encontramos destaques em {cityName} com o termo "{searchTerm}".
                        </p>
                        <Button onClick={() => setSearchTerm('')}>
                          Limpar busca
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold mb-4">Nenhum destaque ainda</h3>
                        <p className="text-muted-foreground mb-6">
                          Ainda não temos destaques publicados para {cityName}. Volte em breve!
                        </p>
                        <Button asChild>
                          <Link to="/destaques">
                            Ver outros destaques
                          </Link>
                        </Button>
                      </>
                    )}
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
              <h2 className="text-3xl font-bold mb-4">Explore mais em {cityName}</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Descubra todos os eventos e experiências culturais que {cityName} tem a oferecer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to={`/cidade/${cidade}`}>
                    Ver Agenda de {cityName}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/destaques">
                    Outros Destaques
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

export default CityHighlightsPage;