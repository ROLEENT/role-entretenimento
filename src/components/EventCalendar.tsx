import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventsData } from '@/data/eventsData';

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Previous month days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month days to fill the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return eventsData.filter(event => event.date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendário de Eventos
              </CardTitle>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Mês
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Semana
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 gap-1">
                {/* Week day headers */}
                {weekDays.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {days.map((day, index) => {
                  const dayEvents = getEventsForDate(day.date);
                  const today = isToday(day.date);
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] p-1 border rounded-lg ${
                        day.isCurrentMonth 
                          ? 'bg-background hover:bg-muted/50' 
                          : 'bg-muted/20 text-muted-foreground'
                      } ${today ? 'bg-primary/10 border-primary' : 'border-border'}
                      transition-colors cursor-pointer`}
                    >
                      <div className={`text-sm font-medium mb-1 ${today ? 'text-primary' : ''}`}>
                        {day.date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 rounded bg-primary/10 text-primary truncate"
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} mais
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'week' && (
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  Visualização semanal em desenvolvimento
                </div>
              </div>
            )}

            {/* Today's events */}
            <div className="mt-6 pt-6 border-t">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Eventos de Hoje
              </h4>
              
              {getEventsForDate(new Date()).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum evento programado para hoje
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getEventsForDate(new Date()).map(event => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">{event.title}</h5>
                          <Badge variant="outline">{event.time}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{event.venue}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-primary">
                            {event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}
                          </span>
                          <Button size="sm" variant="outline">
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default EventCalendar;