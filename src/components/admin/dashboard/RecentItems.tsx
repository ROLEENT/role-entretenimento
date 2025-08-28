import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Edit, Star, Calendar, Building, Users, ExternalLink, Eye } from 'lucide-react';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

export const RecentItems = () => {
  const { data: recentItems, isLoading, error } = useRecentActivity();
  const navigate = useNavigate();
  const [showAll, setShowAll] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'highlight': return Star;
      case 'event': return Calendar;
      case 'venue': return Building;
      case 'organizer': return Users;
      default: return Edit;
    }
  };

  const getEditUrl = (item: any) => {
    switch (item.type) {
      case 'highlight': return `/admin-highlight-editor?id=${item.id}`;
      case 'event': return `/admin-event-edit/${item.id}`;
      case 'venue': return '/admin-venues-management';
      case 'organizer': return '/admin-organizers';
      default: return '#';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'highlight': return 'Destaque';
      case 'event': return 'Evento';
      case 'venue': return 'Local';
      case 'organizer': return 'Organizador';
      default: return type;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'default'; // Verde
      case 'draft':
        return 'secondary'; // Cinza
      case 'error':
        return 'destructive'; // Vermelho
      default:
        return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
      case 'active':
        return 'Publicado';
      case 'draft':
        return 'Rascunho';
      case 'error':
        return 'Erro';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Itens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Itens Recentes
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-destructive">
          Erro ao carregar itens recentes
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Itens Recentes
        </CardTitle>
        <CardDescription>
          {showAll ? 'Todos os itens recentes' : '5 itens editados recentemente'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        {!recentItems || recentItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 flex-1 flex items-center justify-center">
            Nenhum item editado recentemente
          </div>
        ) : (
          <TooltipProvider>
            <div className="space-y-3">
              {(showAll ? recentItems : recentItems.slice(0, 5)).map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="font-medium text-sm line-clamp-2 leading-5 cursor-help">
                              {item.title}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-wrap">
                          <span className="flex-shrink-0">{getTypeLabel(item.type)}</span>
                          {item.city && (
                            <>
                              <span>•</span>
                              <span className="truncate">{item.city}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="flex-shrink-0">
                            {formatDistanceToNow(new Date(item.updatedAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      {item.status && (
                        <Badge 
                          variant={getStatusVariant(item.status)}
                          className="text-xs"
                        >
                          {getStatusLabel(item.status)}
                        </Badge>
                      )}
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(getEditUrl(item))}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-3 w-3 text-primary" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(getEditUrl(item), '_blank')}
                              className="h-8 w-8 p-0"
                            >
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Abrir em nova aba</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {recentItems && recentItems.length > 5 && !showAll && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAll(true)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver todos ({recentItems.length} itens)
                  </Button>
                </div>
              )}
              
              {showAll && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAll(false)}
                    className="w-full"
                  >
                    Mostrar menos
                  </Button>
                </div>
              )}
            </div>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
};