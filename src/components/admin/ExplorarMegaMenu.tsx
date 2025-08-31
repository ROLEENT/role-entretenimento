import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MapPin, 
  Briefcase, 
  Users, 
  Calendar, 
  Music,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExplorarItem {
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<any>;
  thumbnail: string;
}

const explorarItems: ExplorarItem[] = [
  {
    title: 'Cidades',
    subtitle: '12 cidades cadastradas',
    href: '/admin-v3/agentes/cidades',
    icon: MapPin,
    thumbnail: '🏙️'
  },
  {
    title: 'Produtores',
    subtitle: '45 organizadores ativos',
    href: '/admin-v3/agentes/organizadores',
    icon: Briefcase,
    thumbnail: '👨‍💼'
  },
  {
    title: 'Artistas',
    subtitle: '128 artistas verificados',
    href: '/admin-v3/agentes/artistas',
    icon: Users,
    thumbnail: '🎤'
  },
  {
    title: 'Festivais',
    subtitle: '8 festivais programados',
    href: '/admin-v3/agenda/festivais',
    icon: Music,
    thumbnail: '🎪'
  },
  {
    title: 'Shows',
    subtitle: '24 eventos este mês',
    href: '/admin-v3/agenda',
    icon: Calendar,
    thumbnail: '🎸'
  }
];

export function ExplorarMegaMenu() {
  const location = useLocation();

  const isItemActive = (href: string): boolean => {
    return location.pathname.startsWith(href);
  };

  const isAnyItemActive = (): boolean => {
    return explorarItems.some(item => isItemActive(item.href));
  };

  return (
    <div className="relative">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 h-9 px-3 py-2 text-sm font-medium transition-colors rounded-md",
              isAnyItemActive() 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            Explorar
            <ChevronDown className="h-3 w-3" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-[60] w-[360px] p-3"
        >
          <div className="grid grid-cols-1 gap-2">
            {explorarItems.map((item) => {
              const ItemIcon = item.icon;
              const isActive = isItemActive(item.href);
              
              return (
                <DropdownMenuItem key={item.href} asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-md transition-colors cursor-pointer no-underline",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted/50"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl">
                      {item.thumbnail}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <ItemIcon className="h-4 w-4 flex-shrink-0" />
                        <h3 className="font-medium text-sm truncate">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}