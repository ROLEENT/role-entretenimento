import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import SEOHead from '@/components/SEOHead';
import ShareDialog from '@/components/ShareDialog';
import { LikeSystem } from '@/components/events/LikeSystem';
import { CommentSystem } from '@/components/events/CommentSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Ticket, Heart, Share2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ReviewSystem } from '@/components/reviews/ReviewSystem';
import { highlightReviewService } from '@/services/highlightService';
import { useCommentNotifications } from '@/hooks/useCommentNotifications';

const HighlightDetailPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [highlight, setHighlight] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Enable comment notifications for this highlight
  useCommentNotifications(id, 'highlight');

  useEffect(() => {
    if (id) {
      fetchHighlight(id);
      fetchReviews();
    }
  }, [id]);

  const fetchHighlight = async (highlightId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('highlights')
        .select('*')
        .eq('id', highlightId)
        .eq('is_published', true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Destaque não encontrado');
        return;
      }
      
      setHighlight(data);
    } catch (error) {
      console.error('Error fetching highlight:', error);
      setError('Destaque não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    if (!id) return;
    try {
      setReviewsLoading(true);
      const reviewsData = await highlightReviewService.getHighlightReviews(id);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (rating: number, comment?: string) => {
    if (!id) throw new Error('Highlight ID not found');
    await highlightReviewService.addHighlightReview(id, rating, comment);
  };


  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return '/placeholder.svg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://nutlcbnruabjsxecqpnd.supabase.co/storage/v1/object/public/highlights/${imageUrl}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getCityDisplayName = (city: string) => {
    const cityNames: { [key: string]: string } = {
      'sao_paulo': 'São Paulo',
      'rio_de_janeiro': 'Rio de Janeiro',
      'porto_alegre': 'Porto Alegre',
      'curitiba': 'Curitiba',
      'florianopolis': 'Florianópolis'
    };
    return cityNames[city] || city;
  };

  const getCityColor = (city: string): string => {
    const colorMap: { [key: string]: string } = {
      'porto_alegre': 'hsl(var(--chart-1))',
      'florianopolis': 'hsl(var(--chart-2))',
      'curitiba': 'hsl(var(--chart-3))',
      'sao_paulo': 'hsl(var(--chart-4))',
      'rio_de_janeiro': 'hsl(var(--chart-5))'
    };
    return colorMap[city] || 'hsl(var(--primary))';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </main>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  if (error || !highlight) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 pt-24 text-center">
          <h1 className="text-2xl font-bold mb-4">Destaque não encontrado</h1>
          <p className="text-muted-foreground mb-6">O destaque que você procura não existe ou foi removido.</p>
          <Button asChild>
            <Link to="/destaques">Ver Todos os Destaques</Link>
          </Button>
        </main>
        <Footer />
        <BackToTop />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={`${highlight.event_title} | Destaques ROLÊ`} 
        description={highlight.role_text || `${highlight.event_title} em ${highlight.venue}`} 
      />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <Link to="/destaques" className="hover:text-foreground transition-colors">
              Destaques
            </Link>
            <span>/</span>
            <Link 
              to={`/destaques/${highlight.city}`} 
              className="hover:text-foreground transition-colors"
            >
              {getCityDisplayName(highlight.city)}
            </Link>
            <span>/</span>
            <span className="text-foreground">{highlight.event_title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Hero Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={getImageUrl(highlight.image_url)}
                      alt={highlight.event_title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* City Badge */}
                    <Badge 
                      className="absolute top-4 left-4 text-white border-0"
                      style={{ backgroundColor: getCityColor(highlight.city) }}
                    >
                      {getCityDisplayName(highlight.city)}
                    </Badge>

                    {/* Photo Credit */}
                    {highlight.photo_credit && (
                      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded">
                        📸 {highlight.photo_credit}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h1 className="text-3xl font-bold mb-2">{highlight.event_title}</h1>
                        
                        <div className="flex items-center gap-4 text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{highlight.venue}</span>
                          </div>
                          
                          {highlight.event_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(highlight.event_date)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <LikeSystem entityId={highlight.id} entityType="highlight" initialLikeCount={highlight.like_count || 0} />
                        
                        <Button variant="outline" size="sm" onClick={() => setShareOpen(true)}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Editorial Text */}
                    {highlight.role_text && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Por que selecionamos</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {highlight.role_text}
                        </p>
                      </div>
                    )}

                    {/* Selection Reasons */}
                    {highlight.selection_reasons && highlight.selection_reasons.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Destaques</h3>
                        <div className="flex flex-wrap gap-2">
                          {highlight.selection_reasons.map((reason: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ticket Link */}
                    {highlight.ticket_url && (
                      <Button asChild size="lg" className="w-full">
                        <a href={highlight.ticket_url} target="_blank" rel="noopener noreferrer">
                          <Ticket className="h-4 w-4 mr-2" />
                          Ver Evento / Ingressos
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <ReviewSystem
                itemId={highlight.id}
                itemType="highlight"
                reviews={reviews}
                onReviewAdded={fetchReviews}
                loading={reviewsLoading}
                onAddReview={handleAddReview}
              />

              {/* Comments Section */}
              <CommentSystem entityId={highlight.id} entityType="highlight" />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Back to City Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explorar Mais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to={`/destaques/${highlight.city}`}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Outros destaques de {getCityDisplayName(highlight.city)}
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/destaques">
                      Ver todos os destaques
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild className="w-full justify-start">
                    <Link to="/eventos">
                      Explorar eventos
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Event Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Cidade:</span>
                      <span className="font-medium">{getCityDisplayName(highlight.city)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Local:</span>
                      <span className="font-medium">{highlight.venue}</span>
                    </div>
                    
                    {highlight.event_date && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data:</span>
                        <span className="font-medium">
                          {format(new Date(highlight.event_date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                    
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <ShareDialog 
        isOpen={shareOpen} 
        onClose={() => setShareOpen(false)} 
        event={{
          id: highlight.id,
          title: highlight.event_title,
          category: 'Destaque',
          city: getCityDisplayName(highlight.city),
          date: highlight.event_date,
          image: getImageUrl(highlight.image_url)
        }} 
      />
      
      <Footer />
      <BackToTop />
    </div>
  );
};

export default HighlightDetailPage;