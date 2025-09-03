import React from 'react';
import { NavLink } from 'react-router-dom';
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
  const dropdownItems = quickActions.map(action => ({
    label: action.label,
    href: action.url,
    icon: action.icon,
    description: action.description,
  }));

  return (
    <DetailsDropdown
      trigger={
        <Button 
          size="sm" 
          className="h-8 px-2 gap-1"
          aria-label="Ações rápidas"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo</span>
        </Button>
      }
      items={dropdownItems}
      align="end"
      menuClassName="w-56"
    />
  );
}