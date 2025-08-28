import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Building, Users, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Plus,
      label: 'Criar Destaque',
      description: 'Novo destaque de evento',
      action: () => navigate('/admin-highlight-editor'),
      variant: 'default' as const,
    },
    {
      icon: Calendar,
      label: 'Criar Evento',
      description: 'Adicionar novo evento',
      action: () => navigate('/admin-event-create'),
      variant: 'outline' as const,
    },
    {
      icon: Building,
      label: 'Criar Local',
      description: 'Cadastrar novo venue',
      action: () => navigate('/admin-venues-management'),
      variant: 'outline' as const,
    },
    {
      icon: Users,
      label: 'Criar Organizador',
      description: 'Novo organizador de eventos',
      action: () => navigate('/admin-organizers'),
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Crie novos conteúdos rapidamente
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4 justify-center md:justify-start">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            size="lg"
            className={`h-16 px-6 flex items-center gap-3 text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              action.variant === 'default' 
                ? 'bg-primary hover:bg-primary-hover text-primary-foreground shadow-lg' 
                : 'border-primary text-primary hover:bg-primary/10'
            }`}
            onClick={action.action}
          >
            <action.icon className="h-7 w-7" />
            <div>
              <div className="font-bold">{action.label}</div>
              <div className="text-xs opacity-80">{action.description}</div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};