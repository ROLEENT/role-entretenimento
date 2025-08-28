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
      onClick: () => navigate('/admin-v2/highlights'),
    },
    {
      title: 'Eventos',
      icon: Calendar,
      total: stats?.events.total || 0,
      published: stats?.events.published || 0,
      draft: stats?.events.draft || 0,
      onClick: () => navigate('/admin-v2/events'),
    },
    {
      title: 'Locais',
      icon: Building,
      total: stats?.venues || 0,
      onClick: () => navigate('/admin-v2/venues'),
    },
    {
      title: 'Organizadores',
      icon: Users,
      total: stats?.organizers || 0,
      onClick: () => navigate('/admin-v2/organizers'),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={card.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.total}</div>
            
            {('published' in card && 'draft' in card) && (
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  {card.published} pub
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {card.draft} draft
                </Badge>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              {card.title === 'Destaques' && 'Clique para gerenciar'}
              {card.title === 'Eventos' && 'Clique para gerenciar'}
              {card.title === 'Locais' && 'Clique para gerenciar'}
              {card.title === 'Organizadores' && 'Clique para gerenciar'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};