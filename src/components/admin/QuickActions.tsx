import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DetailsDropdown } from '@/components/ui/details-dropdown';
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
  return (
    <div className="dd" data-dd data-dd-align="right">
      <button 
        className="dd-trigger inline-flex items-center justify-center gap-1 h-8 px-2 text-sm font-medium bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-md"
        data-dd-trigger 
        aria-expanded="false"
        aria-label="Ações rápidas"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Novo</span>
      </button>
      
      <div className="dd-menu w-56" data-dd-menu role="menu">
        {quickActions.map(action => {
          const IconComponent = action.icon;
          return (
            <Link
              key={action.url}
              to={action.url}
              role="menuitem"
              className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-muted"
            >
              <IconComponent className="h-4 w-4" />
              <div className="flex flex-col items-start">
                <span className="font-medium">{action.label}</span>
                <span className="text-xs text-muted-foreground">{action.description}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}