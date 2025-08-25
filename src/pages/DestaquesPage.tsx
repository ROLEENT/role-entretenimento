import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Users, ArrowLeft, Share2 } from 'lucide-react';
import HighlightCard from '@/components/HighlightCard';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import { formatHighlightDateVeryShort } from '@/utils/dateUtils';

const DestaquesPage = () => {
  const { cidade } = useParams<{ cidade?: string }>();
  const { toast } = useToast();
  const [highlights, setHighlights] = useState<any[]>([]);
  const [topHighlights, setTopHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalHighlights, setTotalHighlights] = useState(0);
  const highlightsPerPage = 12;

  useEffect(() => {
    if (cidade) {
      loadCityHighlights();
    } else {
      loadTopHighlights();
      loadHighlightsByCity();
    }
  }, [cidade, currentPage]);

  const loadTopHighlights = async () => {
    try {
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('is_published', true)
        .order('like_count', { ascending: false })
        .limit(12);

      if (error) throw error;
      setTopHighlights(data || []);
    } catch (error) {
      console.error('Erro ao carregar top destaques:', error);
    }
  };

  const loadHighlightsByCity = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por cidade
      const groupedByCities = (data || []).reduce((acc: any, highlight: any) => {
        const city = highlight.city;
        if (!acc[city]) {
          acc[city] = [];
        }
        acc[city].push(highlight);
        return acc;
      }, {});

      setHighlights(groupedByCities);
    } catch (error) {
      console.error('Erro ao carregar destaques por cidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCityHighlights = async () => {
    try {
      setLoading(true);
      const offset = (currentPage - 1) * highlightsPerPage;

      const { data, count, error } = await supabase
        .from('highlights')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .eq('city', cidade)
        .order('created_at', { ascending: false })
        .range(offset, offset + highlightsPerPage - 1);

      if (error) throw error;

      setHighlights(data || []);
      setTotalHighlights(count || 0);
    } catch (error) {
      console.error('Erro ao carregar destaques da cidade:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (highlightId: string) => {
    try {
      // Incrementar like_count
      const { error } = await supabase.rpc('increment_highlight_likes', {
        highlight_id: highlightId
      });

      if (error) throw error;

      // Atualizar estado local
      if (cidade) {
        setHighlights(prev => 
          prev.map((h: any) => 
            h.id === highlightId 
              ? { ...h, like_count: h.like_count + 1 }
              : h
          )
        );
      } else {
        setTopHighlights(prev => 
          prev.map(h => 
            h.id === highlightId 
              ? { ...h, like_count: h.like_count + 1 }
              : h
          )
        );
        setHighlights(prev => {
          const newHighlights = { ...prev };
          Object.keys(newHighlights).forEach(city => {
            newHighlights[city] = newHighlights[city].map((h: any) => 
              h.id === highlightId 
                ? { ...h, like_count: h.like_count + 1 }
                : h
            );
          });
          return newHighlights;
        });
      }

      toast({
        title: "❤️ Curtiu!",
        description: "Obrigado por curtir este destaque"
      });
    } catch (error) {
      console.error('Erro ao curtir destaque:', error);
      toast({
        title: "Erro",
        description: "Não foi possível curtir este destaque",
        variant: "destructive"
      });
    }
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return formatHighlightDateVeryShort(dateStr);
  };

  const getCityDisplayName = (city: string) => {
    const cityNames: { [key: string]: string } = {
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'porto_alegre': 'Porto Alegre',
      'curitiba': 'Curitiba',
      'florianopolis': 'Florianópolis',
      'belo_horizonte': 'Belo Horizonte'
    };
    return cityNames[city] || city;
  };

  const totalPages = Math.ceil(totalHighlights / highlightsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NewHighlightCard = ({ highlight, showCity = false }: { highlight: any, showCity?: boolean }) => {
    const handleCardLike = () => handleLike(highlight.id);
    
    return (
      <Link to={`/destaque/${highlight.id}`} className="block">
        <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-card/50 backdrop-blur-sm">
          <div className="relative">
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={getImageUrl(highlight.image_url)}
                alt={highlight.event_title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          
          {showCity && (
            <div className="absolute top-3 left-3 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded font-medium">
              {getCityDisplayName(highlight.city)}
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCardLike();
              }}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-8 w-8 p-0"
            >
              <Heart className="w-3 h-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 h-8 w-8 p-0"
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>

          {highlight.photo_credit && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {highlight.photo_credit}
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {highlight.event_title}
            </h3>
            
            <p className="text-xs text-muted-foreground">
              📍 {highlight.venue}
            </p>

            {highlight.event_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(highlight.event_date)}</span>
              </div>
            )}
          </div>

          {highlight.selection_reasons && highlight.selection_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {highlight.selection_reasons.slice(0, 2).map((reason: string, index: number) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{highlight.like_count || 0}</span>
              </div>
            </div>
            
            {highlight.ticket_url && (
              <Button 
                size="sm" 
                className="text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(highlight.ticket_url!, '_blank');
                }}
              >
                Ver Evento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando destaques...</p>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  if (cidade) {
    // Página específica da cidade
    return (
      <>
        <SEOHead 
          title={`Destaques de ${getCityDisplayName(cidade)} - ROLÊ`}
          description={`Descubra os melhores eventos e destaques de ${getCityDisplayName(cidade)}`}
        />
        
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8 pt-24">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/destaques">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar aos destaques
                </Link>
              </Button>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Destaques de {getCityDisplayName(cidade)}
              </h1>
              <p className="text-muted-foreground text-lg">
                {totalHighlights} destaque(s) encontrado(s)
              </p>
            </div>

            {highlights.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum destaque encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Ainda não temos destaques para {getCityDisplayName(cidade)}
                </p>
                <Button asChild>
                  <Link to="/destaques">Ver todos os destaques</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {highlights.map(highlight => (
                    <NewHighlightCard key={highlight.id} highlight={highlight} />
                  ))}
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </Button>
                          );
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
          <Footer />
          <BackToTop />
        </div>
      </>
    );
  }

  // Página geral de destaques
  return (
    <>
      <SEOHead 
        title="Destaques - ROLÊ"
        description="Descubra os eventos mais curtidos e os melhores destaques de cada cidade"
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Destaques ROLÊ
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Os eventos mais curtidos do site e os melhores destaques de cada cidade
            </p>
          </div>

          {/* Top Destaques - Carrossel Global */}
          {topHighlights.length > 0 && (
            <section className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  🔥 Mais Curtidos do ROLÊ
                </h2>
                <p className="text-muted-foreground text-lg mb-4">
                  Os eventos que conquistaram o coração da galera
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Top {topHighlights.length} eventos mais curtidos</span>
                </div>
              </div>
              
              {/* Featured Top 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {topHighlights.slice(0, 3).map((highlight, index) => (
                  <div key={highlight.id} className="relative">
                    <div className="absolute -top-3 -left-3 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <NewHighlightCard highlight={highlight} showCity />
                  </div>
                ))}
              </div>
              
              {/* Rest of top highlights */}
              {topHighlights.length > 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {topHighlights.slice(3, 11).map(highlight => (
                    <NewHighlightCard key={highlight.id} highlight={highlight} showCity />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Destaques por Cidade */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
              Destaques por Cidade
            </h2>
            
            {Object.keys(highlights).length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nenhum destaque encontrado</h3>
                <p className="text-muted-foreground">
                  Ainda não temos destaques publicados
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {Object.entries(highlights).map(([city, cityHighlights]: [string, any]) => (
                  <div key={city}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-foreground">
                        📍 {getCityDisplayName(city)}
                      </h3>
                      <Button variant="outline" asChild>
                        <Link to={`/destaques/${city}`}>
                          Ver todos ({cityHighlights.length})
                        </Link>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {cityHighlights.slice(0, 4).map((highlight: any) => (
                        <NewHighlightCard key={highlight.id} highlight={highlight} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  );
};

export default DestaquesPage;