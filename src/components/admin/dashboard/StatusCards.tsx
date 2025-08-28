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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <Card 
          key={card.title} 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 min-h-[160px] border-0 shadow-sm bg-gradient-to-br from-card to-card/80"
          onClick={card.onClick}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
            {/* Número grande em destaque */}
            <div className="text-4xl font-bold font-spartan text-primary mb-2">
              {card.total}
            </div>
            
            {/* Título/Rótulo */}
            <div className="text-sm font-medium font-garet text-muted-foreground mb-4">
              {card.title}
            </div>
            
            {/* Status badges para Destaques e Eventos */}
            {('published' in card && 'draft' in card) && (
              <div className="flex gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-success font-medium">{card.published}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                  <span className="text-muted-foreground font-medium">{card.draft}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};