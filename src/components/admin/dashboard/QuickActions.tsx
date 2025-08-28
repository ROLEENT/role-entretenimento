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
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={action.action}
          >
            <action.icon className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">{action.label}</div>
              <div className="text-xs text-muted-foreground">
                {action.description}
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};