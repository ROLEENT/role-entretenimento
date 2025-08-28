import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Building, Users, Eye, FileText } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardData';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

export const StatusCards = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-destructive">
          Erro ao carregar estatísticas
          <button 
            onClick={() => window.location.reload()} 
            className="block mx-auto mt-2 text-sm underline"
          >
            Recarregar
          </button>
        </div>
      </Card>
    );
  }

  const cards = [
    {
      title: 'Destaques',
      icon: Star,
      total: stats?.highlights.total || 0,
      published: stats?.highlights.published || 0,
      draft: stats?.highlights.draft || 0,
      onClick: () => navigate('/admin-highlight-editor'),
    },
    {
      title: 'Eventos',
      icon: Calendar,
      total: stats?.events.total || 0,
      published: stats?.events.published || 0,
      draft: stats?.events.draft || 0,
      onClick: () => navigate('/admin-event-management'),
    },
    {
      title: 'Locais',
      icon: Building,
      total: stats?.venues || 0,
      onClick: () => navigate('/admin-venues-management'),
    },
    {
      title: 'Organizadores',
      icon: Users,
      total: stats?.organizers || 0,
      onClick: () => navigate('/admin-organizers'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="cursor-pointer hover:shadow-md transition-shadow min-h-[140px] flex flex-col"
          onClick={card.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-medium truncate">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0">
            <div className="text-2xl font-bold mb-2">{card.total}</div>
            
            {('published' in card && 'draft' in card) && (
              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="default" className="text-xs max-w-fit">
                  <Eye className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{card.published} pub.</span>
                </Badge>
                <Badge variant="secondary" className="text-xs max-w-fit">
                  <FileText className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{card.draft} rasc.</span>
                </Badge>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-auto">
              Clique para gerenciar
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};