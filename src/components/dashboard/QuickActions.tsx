import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Section } from './Section';

interface QuickAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Novo Evento',
    icon: Plus,
    path: '/admin-v3/agenda/new'
  },
  {
    label: 'Ver Agenda',
    icon: Calendar,
    path: '/admin-v3/agenda'
  },
  {
    label: 'Novo Agente',
    icon: Users,
    path: '/admin-v3/agentes/new'
  },
  {
    label: 'Nova Revista',
    icon: FileText,
    path: '/admin-v3/revista/new'
  }
];

export function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (path: string) => {
    navigate(path);
  };

  return (
    <Section 
      title="Ações Rápidas"
      description="Crie novo conteúdo ou acesse seções principais"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Button
              key={action.label}
              variant="outline"
              onClick={() => handleAction(action.path)}
              className="h-20 flex-col gap-2 dashboard-card hover:shadow-md transition-shadow"
            >
              <IconComponent className="h-6 w-6" />
              <span className="text-sm font-medium">
                {action.label}
              </span>
            </Button>
          );
        })}
      </div>
    </Section>
  );
}