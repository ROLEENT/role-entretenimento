import { TrendingUp, MessageCircle, Users, Flame, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WeeklyEvent } from '@/data/weeklyData';

interface TrendingEventsProps {
  events: WeeklyEvent[];
  onEventSelect?: (event: WeeklyEvent) => void;
}

const TrendingEvents = ({ events, onEventSelect }: TrendingEventsProps) => {
  const sortedEvents = [...events].sort((a, b) => b.trendingScore - a.trendingScore);

  const getTrendingBadge = (score: number) => {
    if (score >= 95) return { label: 'VIRAL', variant: 'destructive' as const, icon: Flame };
    if (score >= 85) return { label: 'HOT', variant: 'default' as const, icon: TrendingUp };
    if (score >= 75) return { label: 'TRENDING', variant: 'secondary' as const, icon: Star };
    return { label: 'RISING', variant: 'outline' as const, icon: TrendingUp };
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="py-12 bg-gradient-to-br from-secondary/5 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              Trending Now
            </h2>
            <p className="text-muted-foreground">
              Os eventos mais comentados e procurados da semana
            </p>
          </div>
          <Badge variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Atualizado há 5 min
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Trending Event */}
          {sortedEvents[0] && (
            <div className="lg:col-span-2">
              <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="relative">
                  <img
                    src={sortedEvents[0].image}
                    alt={`Evento em destaque: ${sortedEvents[0].title}`}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Trending Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-orange-500 text-white gap-2 animate-pulse">
                      <Flame className="h-4 w-4" />
                      #{1} TRENDING
                    </Badge>
                  </div>

                  {/* Trending Score */}
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white font-bold text-sm">
                      {sortedEvents[0].trendingScore}%
                    </span>
                  </div>

                  {/* Event Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">
                      {sortedEvents[0].title}
                    </h3>
                    <p className="text-white/90 mb-4">
                      {sortedEvents[0].description}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{formatNumber(sortedEvents[0].comments)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="text-sm">{formatNumber(sortedEvents[0].attendees)}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sortedEvents[0].tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {sortedEvents[0].venue} • {sortedEvents[0].date} • {sortedEvents[0].time}
                      </p>
                      <p className="text-2xl font-bold text-primary mt-1">
                        {sortedEvents[0].price === 0 ? 'Gratuito' : `R$ ${sortedEvents[0].price}`}
                      </p>
                    </div>
                    <Button size="lg" onClick={() => onEventSelect?.(sortedEvents[0])}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Trending Ranking */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Ranking Trending
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sortedEvents.slice(1, 6).map((event, index) => {
                  const ranking = index + 2;
                  const trendingInfo = getTrendingBadge(event.trendingScore);
                  const IconComponent = trendingInfo.icon;
                  
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => onEventSelect?.(event)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        ranking <= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        #{ranking}
                      </div>
                      
                      <img
                        src={event.image}
                        alt={`Evento em destaque: ${event.title}`}
                        className="w-12 h-12 rounded object-cover"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.venue}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={trendingInfo.variant} className="text-xs gap-1">
                            <IconComponent className="h-3 w-3" />
                            {trendingInfo.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {event.trendingScore}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {formatNumber(event.comments)}
                        </div>
                        <MessageCircle className="h-3 w-3 text-muted-foreground mx-auto" />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Trending Categories */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Gêneros em Alta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { genre: 'Eletrônica', growth: '+45%', color: 'bg-blue-500' },
                    { genre: 'Rock', growth: '+32%', color: 'bg-red-500' },
                    { genre: 'Funk', growth: '+28%', color: 'bg-purple-500' },
                    { genre: 'Jazz', growth: '+15%', color: 'bg-green-500' }
                  ].map((item) => (
                    <div key={item.genre} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                        <span className="text-sm font-medium">{item.genre}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.growth}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(sortedEvents.reduce((acc, event) => acc + event.comments, 0))}
              </div>
              <div className="text-sm text-muted-foreground">
                Comentários esta semana
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(sortedEvents.reduce((acc, event) => acc + event.attendees, 0))}
              </div>
              <div className="text-sm text-muted-foreground">
                Pessoas interessadas
              </div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-foreground">
                {Math.round(sortedEvents.reduce((acc, event) => acc + event.trendingScore, 0) / sortedEvents.length)}%
              </div>
              <div className="text-sm text-muted-foreground">
                Score médio de trending
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TrendingEvents;