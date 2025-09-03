import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Calendar, FileText, Users, Star, Sparkles } from 'lucide-react';

interface QuickAction {
  label: string;
  url: string;
  icon: React.ComponentType<any>;
  description: string;
  category: string;
}

const quickActions: QuickAction[] = [
  {
    label: 'Novo Evento',
    url: '/admin-v3/eventos/criar',
    icon: Calendar,
    description: 'Formulário wizard v3',
    category: 'Agenda'
  },
  {
    label: 'Nova Matéria',
    url: '/admin-v3/revista/new',
    icon: FileText,
    description: 'Escrever nova matéria',
    category: 'Revista'
  },
  {
    label: 'Novo Artista',
    url: '/admin-v3/agentes/artistas/criar',
    icon: Users,
    description: 'Cadastrar novo artista',
    category: 'Agentes'
  },
  {
    label: 'Novo Organizador',
    url: '/admin-v3/agentes/organizadores',
    icon: Users,
    description: 'Cadastrar organizador',
    category: 'Agentes'
  },
  {
    label: 'Novo Local',
    url: '/admin-v3/agentes/venues',
    icon: Users,
    description: 'Cadastrar local',
    category: 'Agentes'
  }
];

export function QuickActions() {
  const groupedActions = quickActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {} as Record<string, QuickAction[]>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="sm" 
          className="h-8 px-2 gap-1"
          aria-label="Ações rápidas"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" sideOffset={4}>
        <DropdownMenuLabel>Ações Rápidas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {Object.entries(groupedActions).map(([category, actions], categoryIndex) => (
          <div key={category}>
            {categoryIndex > 0 && <DropdownMenuSeparator />}
            
            {actions.map((action) => {
              const ActionIcon = action.icon;
              
              return (
                <DropdownMenuItem key={action.url} asChild>
                  <NavLink
                    to={action.url}
                    className="cursor-pointer flex items-center gap-3 py-2.5 text-foreground no-underline"
                  >
                    <ActionIcon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </NavLink>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}