import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Settings, 
  Star,
  Plus,
  ChevronDown,
  MapPin,
  Briefcase,
  Tag,
  FileText,
  Layout,
  Mail,
  UserCheck,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationModule {
  title: string;
  icon: React.ComponentType<any>;
  baseUrl: string;
  items: {
    label: string;
    url: string;
    icon: React.ComponentType<any>;
    badge?: string | number;
    description?: string;
  }[];
}

// Available: ✅ | In Development: 🚧
const navigationModules: NavigationModule[] = [
  {
    title: 'Agenda',
    icon: Calendar,
    baseUrl: '/admin-v3/agenda',
    items: [
      {
        label: 'Listar Eventos ✅',
        url: '/admin-v3/agenda',
        icon: Calendar,
        description: 'Ver todos os eventos'
      },
      {
        label: 'Criar Evento ✅',
        url: '/admin-v3/agenda/new',
        icon: Plus,
        description: 'Adicionar novo evento'
      }
    ]
  },
  {
    title: 'Agentes',
    icon: Users,
    baseUrl: '/admin-v3/agentes',
    items: [
      {
        label: 'Artistas ✅',
        url: '/admin-v3/agentes/artistas',
        icon: Users,
        description: 'Gerenciar artistas cadastrados'
      },
      {
        label: 'Criar Artista ✅',
        url: '/admin-v3/agentes/artistas/new',
        icon: Plus,
        description: 'Adicionar novo artista'
      },
      {
        label: 'Organizadores 🚧',
        url: '/admin-v3/agentes/organizadores/new',
        icon: Briefcase,
        description: 'Organizadores de eventos'
      },
      {
        label: 'Locais 🚧',
        url: '/admin-v3/agentes/locais/new',
        icon: MapPin,
        description: 'Locais e espaços'
      }
    ]
  },
  {
    title: 'Revista',
    icon: BookOpen,
    baseUrl: '/admin-v3/revista',
    items: [
      {
        label: 'Artigos 🚧',
        url: '/admin-v3/revista',
        icon: FileText,
        description: 'Gerenciar artigos'
      },
      {
        label: 'Nova Matéria 🚧',
        url: '/admin-v3/revista/new',
        icon: Plus,
        description: 'Nova matéria'
      }
    ]
  },
  {
    title: 'Gestão',
    icon: Settings,
    baseUrl: '/admin-v3/gestao',
    items: [
      {
        label: 'Contatos 🚧',
        url: '/admin-v3/gestao/contatos',
        icon: Mail,
        description: 'Mensagens de contato'
      },
      {
        label: 'Newsletter 🚧',
        url: '/admin-v3/gestao/newsletter',
        icon: Mail,
        description: 'Gerenciar newsletter'
      },
      {
        label: 'Candidaturas 🚧',
        url: '/admin-v3/gestao/candidaturas',
        icon: UserCheck,
        badge: 5,
        description: 'Candidaturas pendentes'
      }
    ]
  },
  {
    title: 'Destaques',
    icon: Star,
    baseUrl: '/admin-v3/destaques',
    items: [
      {
        label: 'Highlights Ativos 🚧',
        url: '/admin-v3/destaques',
        icon: Lightbulb,
        description: 'Highlights publicados'
      },
      {
        label: 'Criar Destaque 🚧',
        url: '/admin-v3/destaques/new',
        icon: Plus,
        description: 'Novo highlight'
      }
    ]
  }
];

export function AdminNavigation() {
  const location = useLocation();

  const isModuleActive = (module: NavigationModule): boolean => {
    return location.pathname.startsWith(module.baseUrl);
  };

  const isItemActive = (itemUrl: string): boolean => {
    return location.pathname === itemUrl;
  };

  const getModuleColor = (module: NavigationModule, isActive: boolean) => {
    if (isActive) {
      return 'text-primary bg-primary/10';
    }
    return 'text-muted-foreground hover:text-foreground hover:bg-muted/50';
  };

  return (
    <nav className="hidden md:flex items-center gap-1">
      {navigationModules.map((module) => {
        const isActive = isModuleActive(module);
        const ModuleIcon = module.icon;

        return (
          <DropdownMenu key={module.title}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "h-9 px-3 py-2 gap-1.5 font-medium transition-colors",
                  getModuleColor(module, isActive)
                )}
              >
                <ModuleIcon className="h-4 w-4" />
                <span className="hidden lg:inline">{module.title}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64" 
              align="start" 
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel className="flex items-center gap-2">
                <ModuleIcon className="h-4 w-4" />
                {module.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {module.items.map((item) => {
                const ItemIcon = item.icon;
                const isItemSelected = isItemActive(item.url);
                const isInDevelopment = item.label.includes('🚧');
                
                return (
                  <DropdownMenuItem key={item.url} asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => cn(
                        "cursor-pointer flex items-center gap-2 py-2.5 px-2 text-foreground no-underline",
                        isActive && "bg-primary/10 text-primary font-medium",
                        isInDevelopment && "opacity-70"
                      )}
                      aria-current={isItemSelected ? "page" : undefined}
                    >
                      <ItemIcon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="h-5 px-1.5 text-xs tabular-nums"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </NavLink>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}