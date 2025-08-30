import { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeeklyEvent } from '@/data/weeklyData';

interface WeeklyTimelineProps {
  weekStartDate: string;
  weekEndDate: string;
  dailyEvents: Record<string, WeeklyEvent[]>;
  onEventSelect?: (event: WeeklyEvent) => void;
}

const WeeklyTimeline = ({ weekStartDate, weekEndDate, dailyEvents, onEventSelect }: WeeklyTimelineProps) => {
  const [selectedDay, setSelectedDay] = useState<string>('');

  const generateWeekDays = (startDate: string, endDate: string) => {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      days.push({
        date: dateString,
        dayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
        dayNumber,
        monthName,
        events: dailyEvents[dateString] || []
      });
    }
    return days;
  };

  const weekDays = generateWeekDays(weekStartDate, weekEndDate);
  const hasEventsToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <section className="py-8 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Timeline da Semana
          </h2>
          <p className="text-muted-foreground">
            Navegue pelos eventos dia a dia e não perca nada
          </p>
        </div>

        {/* Desktop Timeline */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
            
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => (
                <div key={day.date} className="relative">
                  {/* Day Header */}
                  <div className="text-center mb-4">
                    <div className={`relative z-10 mx-auto w-16 h-16 rounded-full border-4 flex flex-col items-center justify-center ${
                      hasEventsToday(day.date) 
                        ? 'bg-primary border-primary text-primary-foreground animate-pulse' 
                        : day.events.length > 0 
                          ? 'bg-secondary border-primary text-foreground' 
                          : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }`}>
                      <span className="text-xs font-medium">{day.dayName}</span>
                      <span className="text-lg font-bold">{day.dayNumber}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">{day.monthName}</p>
                      <Badge variant={day.events.length > 0 ? 'default' : 'outline'} className="text-xs mt-1">
                        {day.events.length} eventos
                      </Badge>
                    </div>
                  </div>

                  {/* Events for this day */}
                  <div className="space-y-3">
                    {day.events.slice(0, 3).map((event) => (
                      <Card 
                        key={event.id} 
                        className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                        onClick={() => onEventSelect?.(event)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={event.image}
                              alt={`Evento da semana: ${event.title}`}
                              className="w-12 h-12 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{event.venue}</span>
                              </div>
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {day.events.length > 3 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full text-xs"
                        onClick={() => setSelectedDay(day.date)}
                      >
                        +{day.events.length - 3} eventos
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="lg:hidden">
          <div className="space-y-4">
            {weekDays.map((day) => (
              <Card key={day.date} className={`${hasEventsToday(day.date) ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
                        hasEventsToday(day.date) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary text-foreground'
                      }`}>
                        <span className="text-xs font-medium">{day.dayName}</span>
                        <span className="text-sm font-bold">{day.dayNumber}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {day.dayName}, {day.dayNumber} de {day.monthName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {day.events.length} eventos programados
                        </p>
                      </div>
                    </div>
                    {hasEventsToday(day.date) && (
                      <Badge className="animate-pulse">Hoje</Badge>
                    )}
                  </div>
                  
                  {day.events.length > 0 ? (
                    <div className="space-y-3">
                      {day.events.map((event) => (
                        <div 
                          key={event.id}
                          className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => onEventSelect?.(event)}
                        >
                          <img
                            src={event.image}
                            alt={`Evento da semana: ${event.title}`}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-muted-foreground">{event.venue} • {event.time}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum evento programado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.values(dailyEvents).flat().length}
              </div>
              <div className="text-sm text-muted-foreground">
                Total de Eventos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.keys(dailyEvents).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Dias com Eventos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {Object.values(dailyEvents).flat().filter(e => e.price === 0).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Eventos Gratuitos
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                    {new Set(Object.values(dailyEvents).flat().map(e => e.genre)).size}
              </div>
              <div className="text-sm text-muted-foreground">
                Gêneros Musicais
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default WeeklyTimeline;