import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Calendar, MapPin, Users, ArrowLeft, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import { useToast } from '@/hooks/use-toast';

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
    return new Date(dateStr).toLocaleDateString('pt-BR');
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

  const HighlightCard = ({ highlight, showCity = false }: { highlight: any, showCity?: boolean }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative h-64 overflow-hidden">
          <img
            src={getImageUrl(highlight.image_url)}
            alt={highlight.event_title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(highlight.id)}
              className="text-white hover:text-red-500 p-0 h-auto"
            >
              <Heart className="w-5 h-5" />
              <span className="ml-1 text-sm">{highlight.like_count || 0}</span>
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            {showCity && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{getCityDisplayName(highlight.city)}</span>
              </div>
            )}
            {highlight.event_date && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(highlight.event_date)}</span>
              </div>
            )}
          </div>
          
          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {highlight.event_title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3">
            📍 {highlight.venue}
          </p>

          {highlight.selection_reasons && highlight.selection_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
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
            <div className="text-sm text-muted-foreground">
              {highlight.role_text}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
              {highlight.ticket_url && (
                <Button size="sm" asChild>
                  <a href={highlight.ticket_url} target="_blank" rel="noopener noreferrer">
                    Ingressos
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando destaques...</p>
          </div>
        </div>
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
          <div className="container mx-auto px-4 py-8">
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
                    <HighlightCard key={highlight.id} highlight={highlight} />
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
          </div>
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
        <div className="container mx-auto px-4 py-8">
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
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  🔥 Mais Curtidos do Site
                </h2>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Top {topHighlights.length} eventos</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {topHighlights.slice(0, 8).map(highlight => (
                  <HighlightCard key={highlight.id} highlight={highlight} showCity />
                ))}
              </div>
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
                        <HighlightCard key={highlight.id} highlight={highlight} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default DestaquesPage;