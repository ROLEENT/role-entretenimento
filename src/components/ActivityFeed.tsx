import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, UserPlus, Calendar, MessageCircle, User, RefreshCw, Filter, ThumbsUp, Activity, CalendarDays } from 'lucide-react';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ActivityFeed = () => {
  const { activities, loading, getActivityMessage, refetch } = useActivityFeed();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const activityTypes = [
    { value: 'all', label: 'Todas', icon: Activity },
    { value: 'follow', label: 'Seguindo', icon: UserPlus },
    { value: 'event_favorite', label: 'Eventos', icon: Heart },
    { value: 'highlight_like', label: 'Destaques', icon: ThumbsUp },
    { value: 'comment', label: 'Comentários', icon: MessageCircle },
  ];

  const filteredActivities = selectedFilter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === selectedFilter);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'event_favorite':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'highlight_like':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'comment':
        return <MessageCircle className="h-4 w-4 text-green-500" />;
      case 'profile_update':
        return <User className="h-4 w-4 text-purple-500" />;
      default:
        return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), {
        addSuffix: true,
        locale: ptBR
      });
    } catch {
      return 'Agora';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feed de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Feed de Atividades
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="h-8 w-8"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Filtros */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filtrar por:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activityTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Badge
                  key={type.value}
                  variant={selectedFilter === type.value ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => setSelectedFilter(type.value)}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {type.label}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              {selectedFilter === 'all' ? (
                <>
                  <p>Nenhuma atividade recente</p>
                  <p className="text-sm mt-1">
                    Siga pessoas para ver suas atividades aqui
                  </p>
                </>
              ) : (
                <p>Nenhuma atividade do tipo "{activityTypes.find(t => t.value === selectedFilter)?.label}" encontrada</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={activity.actor_profile?.avatar_url} 
                      alt={activity.actor_profile?.display_name || activity.actor_profile?.username} 
                    />
                    <AvatarFallback>
                      {(activity.actor_profile?.display_name || activity.actor_profile?.username || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <p className="text-sm">
                        {getActivityMessage(activity)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatTime(activity.created_at)}
                    </p>
                    
                    {/* Informações contextuais com links */}
                    {activity.type === 'event_favorite' && activity.data?.event_title && activity.object_id && (
                      <Link 
                        to={`/eventos/${activity.object_id}`}
                        className="block mt-2 p-2 bg-red-50 dark:bg-red-950/20 rounded-md hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <p className="text-xs font-medium text-red-700 dark:text-red-300">
                          📅 Evento: {activity.data.event_title}
                        </p>
                      </Link>
                    )}
                    
                    {activity.type === 'highlight_like' && activity.object_id && (
                      <Link 
                        to={`/destaques/${activity.object_id}`}
                        className="block mt-2 p-2 bg-green-50 dark:bg-green-950/20 rounded-md hover:bg-green-100 dark:hover:bg-green-950/30 transition-colors"
                      >
                        <p className="text-xs font-medium text-green-700 dark:text-green-300">
                          ⭐ Destaque curtido
                        </p>
                      </Link>
                    )}
                    
                    {activity.type === 'follow' && activity.object_id && (
                      <Link 
                        to={`/usuarios/${activity.object_id}`}
                        className="block mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-md hover:bg-blue-100 dark:hover:bg-blue-950/30 transition-colors"
                      >
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          👤 Ver perfil
                        </p>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;