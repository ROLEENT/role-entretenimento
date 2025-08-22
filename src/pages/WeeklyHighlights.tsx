import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { weeklyData, getWeekByDate, getNextWeek, getPreviousWeek, WeekData } from '@/data/weeklyData';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToTop from '@/components/BackToTop';
import WeeklyTimeline from '@/components/WeeklyTimeline';
import TrendingEvents from '@/components/TrendingEvents';
import PersonalizedRecommendations from '@/components/PersonalizedRecommendations';
import CalendarIntegration from '@/components/CalendarIntegration';
import EventCard from '@/components/EventCard';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

const WeeklyHighlights = () => {
  const { data } = useParams<{ data: string }>();
  const navigate = useNavigate();
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (data && weeklyData[data]) {
      setWeekData(weeklyData[data]);
    }
    setIsLoading(false);
  }, [data]);

  const handleNavigateWeek = (direction: 'next' | 'prev') => {
    if (!data) return;
    
    const targetWeek = direction === 'next' 
      ? getNextWeek(data) 
      : getPreviousWeek(data);
    
    if (targetWeek) {
      navigate(`/destaques/semana/${targetWeek}`);
    } else {
      toast.info(direction === 'next' 
        ? 'Esta é a última semana disponível' 
        : 'Esta é a primeira semana disponível');
    }
  };

  const handleShareWeek = async () => {
    const shareText = `Confira os destaques da ${weekData?.title}! ${weekData?.totalEvents} eventos incríveis.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: weekData?.title || 'Destaques da Semana',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
        toast.success('Link copiado para a área de transferência!');
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!weekData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-3xl font-bold mb-4">Semana não encontrada</h1>
            <p className="text-muted-foreground mb-8">
              A semana "{data}" não foi encontrada em nossa base de dados.
            </p>
            <Button onClick={() => navigate('/destaques')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar aos Destaques
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const allWeekEvents = [
    ...weekData.trending,
    ...weekData.mustSee,
    ...Object.values(weekData.dailyEvents).flat()
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Navigation Header */}
        <div className="bg-background border-b sticky top-16 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/destaques')} 
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar aos Destaques
              </Button>
              
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNavigateWeek('prev')}
                  disabled={!getPreviousWeek(data!)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" onClick={handleShareWeek} className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleNavigateWeek('next')}
                  disabled={!getNextWeek(data!)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <ScrollAnimationWrapper>
          <section className="py-16 bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-4xl mx-auto">
                {weekData.featured && (
                  <Badge className="mb-4 gap-2">
                    <Calendar className="h-4 w-4" />
                    Semana em Destaque
                  </Badge>
                )}
                
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
                  {weekData.title}
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                  {weekData.subtitle}
                </p>

                {/* Week Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {weekData.totalEvents}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Eventos Totais
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {weekData.trending.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Em Trending
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {weekData.mustSee.length}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Imperdíveis
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {new Set(allWeekEvents.map(e => e.city)).size}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Cidades
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>
        </ScrollAnimationWrapper>

        {/* Timeline */}
        <ScrollAnimationWrapper>
          <WeeklyTimeline
            weekStartDate={weekData.startDate}
            weekEndDate={weekData.endDate}
            dailyEvents={weekData.dailyEvents}
            onEventSelect={(event) => {
              toast.info(`Selecionado: ${event.title}`);
            }}
          />
        </ScrollAnimationWrapper>

        {/* Must-See Events */}
        {weekData.mustSee.length > 0 && (
          <ScrollAnimationWrapper>
            <section className="py-12 bg-background">
              <div className="container mx-auto px-4">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    Eventos Imperdíveis
                  </h2>
                  <p className="text-muted-foreground">
                    Os eventos que você não pode deixar passar desta semana
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {weekData.mustSee.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </div>
              </div>
            </section>
          </ScrollAnimationWrapper>
        )}

        {/* Trending Events */}
        {weekData.trending.length > 0 && (
          <ScrollAnimationWrapper>
            <TrendingEvents
              events={weekData.trending}
              onEventSelect={(event) => {
                toast.info(`Trending selecionado: ${event.title}`);
              }}
            />
          </ScrollAnimationWrapper>
        )}

        {/* Personalized Recommendations */}
        <ScrollAnimationWrapper>
          <PersonalizedRecommendations
            allEvents={allWeekEvents}
            onEventSelect={(event) => {
              toast.info(`Recomendação selecionada: ${event.title}`);
            }}
          />
        </ScrollAnimationWrapper>

        {/* Calendar Integration */}
        <ScrollAnimationWrapper>
          <CalendarIntegration
            weekEvents={allWeekEvents}
            weekTitle={weekData.title}
          />
        </ScrollAnimationWrapper>

        {/* Week Navigation */}
        <ScrollAnimationWrapper>
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Explorar Outras Semanas
                      </h3>
                      <p className="text-muted-foreground">
                        Descubra eventos de outras semanas
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {getPreviousWeek(data!) && (
                        <Button
                          variant="outline"
                          onClick={() => handleNavigateWeek('prev')}
                          className="gap-2"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Semana Anterior
                        </Button>
                      )}
                      
                      <Button onClick={() => navigate('/destaques')}>
                        Ver Todas
                      </Button>
                      
                      {getNextWeek(data!) && (
                        <Button
                          variant="outline"
                          onClick={() => handleNavigateWeek('next')}
                          className="gap-2"
                        >
                          Próxima Semana
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </ScrollAnimationWrapper>
      </main>

      <Footer />
      <BackToTop />
      <Toaster />
    </div>
  );
};

export default WeeklyHighlights;