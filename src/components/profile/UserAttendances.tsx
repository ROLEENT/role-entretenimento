import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ExternalLink, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface AttendanceEvent {
  id: string;
  status: 'going' | 'maybe' | 'went';
  show_publicly: boolean;
  created_at: string;
  events: {
    id: string;
    title: string;
    subtitle?: string;
    date_start: string;
    date_end?: string;
    city: string;
    location_name?: string;
    image_url?: string;
    slug: string;
  } | null;
}

interface UserAttendancesProps {
  userId?: string;
  isOwner?: boolean;
  isPublic?: boolean;
}

export function UserAttendances({ userId, isOwner = false, isPublic = false }: UserAttendancesProps) {
  const [attendances, setAttendances] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'going' | 'maybe' | 'went'>('all');

  useEffect(() => {
    if (!userId) return;

    const fetchAttendances = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('attendance')
          .select(`
            id,
            status,
            show_publicly,
            created_at,
            events!inner (
              id,
              title,
              subtitle,
              date_start,
              date_end,
              city,
              location_name,
              image_url,
              slug
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        // If viewing someone else's public profile, only show public attendances
        if (isPublic && !isOwner) {
          query = query.eq('show_publicly', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        setAttendances((data as any) || []);
      } catch (error) {
        console.error('Error fetching attendances:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendances();
  }, [userId, isOwner, isPublic]);

  const filteredAttendances = filter === 'all' 
    ? attendances 
    : attendances.filter(a => a.status === filter);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-8">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      going: { variant: 'default' as const, label: 'Vou' },
      maybe: { variant: 'secondary' as const, label: 'Talvez' },
      went: { variant: 'outline' as const, label: 'Fui' }
    };
    return variants[status as keyof typeof variants] || { variant: 'outline' as const, label: status };
  };

  const getFilterCounts = () => {
    return {
      all: attendances.length,
      going: attendances.filter(a => a.status === 'going').length,
      maybe: attendances.filter(a => a.status === 'maybe').length,
      went: attendances.filter(a => a.status === 'went').length,
    };
  };

  const counts = getFilterCounts();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isOwner ? 'Suas Presenças' : 'Presenças'}
        </h3>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos ({counts.all})
        </Button>
        <Button
          variant={filter === 'going' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('going')}
        >
          Vou ({counts.going})
        </Button>
        <Button
          variant={filter === 'maybe' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('maybe')}
        >
          Talvez ({counts.maybe})
        </Button>
        <Button
          variant={filter === 'went' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('went')}
        >
          Fui ({counts.went})
        </Button>
      </div>

      {filteredAttendances.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {filter === 'all' 
                ? (isOwner ? 'Suas Presenças' : 'Presenças')
                : `Eventos marcados como "${getStatusBadge(filter).label}"`
              }
            </CardTitle>
            <CardDescription>
              {isOwner 
                ? 'Você ainda não marcou presença em nenhum evento.'
                : 'Este usuário ainda não marcou presença em eventos públicos.'
              }
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttendances.map((attendance) => {
            const event = attendance.events;
            if (!event) return null;

            const statusBadge = getStatusBadge(attendance.status);

            return (
              <Card key={attendance.id} className="overflow-hidden">
                {event.image_url && (
                  <div className="aspect-video bg-muted">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold line-clamp-2 flex-1">{event.title}</h4>
                      <div className="flex items-center gap-1">
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                        {isOwner && (
                          <div title={attendance.show_publicly ? 'Visível publicamente' : 'Privado'}>
                            {attendance.show_publicly ? (
                              <Eye className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {event.subtitle && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {event.subtitle}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(event.date_start)}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.location_name || event.city}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Marcado em {formatDate(attendance.created_at)}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/evento/${event.slug}`}>
                        Ver Evento
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}