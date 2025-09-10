import React from 'react';
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format, isAfter, isBefore, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  location?: string;
  city?: string;
  image_url?: string;
  status?: 'upcoming' | 'past' | 'today';
  type?: string;
  slug?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  variant?: 'default' | 'compact';
  showPastEvents?: boolean;
  maxPastEvents?: number;
  className?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

const TimelineSection = ({ 
  title, 
  events, 
  icon: Icon, 
  emptyMessage,
  variant = 'default',
  onEventClick 
}: {
  title: string;
  events: TimelineEvent[];
  icon: any;
  emptyMessage: string;
  variant?: 'default' | 'compact';
  onEventClick?: (event: TimelineEvent) => void;
}) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary" className="text-xs">
          {events.length}
        </Badge>
      </div>
      
      <div className="space-y-3">
        {events.map((event, index) => (
          <TimelineEventCard 
            key={event.id}
            event={event}
            index={index}
            variant={variant}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
};

const TimelineEventCard = ({ 
  event, 
  index,
  variant = 'default',
  onClick 
}: {
  event: TimelineEvent;
  index: number;
  variant?: 'default' | 'compact';
  onClick?: (event: TimelineEvent) => void;
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(event);
    } else if (event.slug) {
      window.location.href = `/evento/${event.slug}`;
    }
  };

  const eventDate = new Date(event.date);
  const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isPast = isBefore(eventDate, new Date());
  
  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group cursor-pointer"
        onClick={handleClick}
      >
        <Card className={cn(
          "transition-all duration-200 hover:shadow-md",
          isPast && "opacity-70",
          isToday && "ring-2 ring-primary/20 bg-primary/5"
        )}>
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full mt-1",
                  isToday ? "bg-primary" : isPast ? "bg-muted-foreground" : "bg-primary"
                )} />
                {index < 2 && (
                  <div className="w-px h-8 bg-border mt-2" />
                )}
              </div>
              
              {/* Event image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              {/* Event details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h4>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{format(eventDate, 'dd MMM • HH:mm', { locale: ptBR })}</span>
                  {isToday && (
                    <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                      Hoje
                    </Badge>
                  )}
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group cursor-pointer"
      onClick={handleClick}
    >
      <Card className={cn(
        "transition-all duration-200 hover:shadow-lg",
        isPast && "opacity-80",
        isToday && "ring-2 ring-primary/20 bg-primary/5"
      )}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Event image */}
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {event.image_url ? (
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              
              {isToday && (
                <div className="absolute -top-1 -right-1">
                  <Badge variant="destructive" className="text-xs px-1 py-0 h-5">
                    Hoje
                  </Badge>
                </div>
              )}
            </div>
            
            {/* Event details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-1">
                {event.title}
              </h4>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>{format(eventDate, 'EEEE, dd MMMM • HH:mm', { locale: ptBR })}</span>
              </div>
              
              {event.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                  {event.city && <span>• {event.city}</span>}
                </div>
              )}
              
              {event.type && (
                <Badge variant="outline" className="text-xs mt-2">
                  {event.type}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export function Timeline({ 
  events, 
  variant = 'default',
  showPastEvents = true,
  maxPastEvents = 5,
  className,
  onEventClick 
}: TimelineProps) {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  
  // Separar eventos por status
  const upcomingEvents = events.filter(event => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
    return isAfter(new Date(eventDate), subDays(now, 1));
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events.filter(event => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
    return isBefore(new Date(eventDate), now) && eventDate !== today;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxPastEvents);

  const todayEvents = events.filter(event => {
    const eventDate = format(new Date(event.date), 'yyyy-MM-dd');
    return eventDate === today;
  });

  // Combinar eventos de hoje com próximos
  const allUpcoming = [...todayEvents, ...upcomingEvents];

  return (
    <div className={cn("space-y-8", className)}>
      {/* Próximos Eventos */}
      <TimelineSection
        title="Próximos Eventos"
        events={allUpcoming}
        icon={Calendar}
        emptyMessage="Nenhum evento próximo agendado"
        variant={variant}
        onEventClick={onEventClick}
      />
      
      {/* Eventos Passados */}
      {showPastEvents && (
        <TimelineSection
          title="Eventos Passados"
          events={pastEvents}
          icon={Clock}
          emptyMessage="Nenhum evento passado registrado"
          variant={variant}
          onEventClick={onEventClick}
        />
      )}
    </div>
  );
}