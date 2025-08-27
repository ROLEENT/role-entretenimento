import React from "react";
import { useLocation, Link } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeMap: Record<string, string> = {
  'admin-v2': 'Dashboard',
  'highlights': 'Destaques',
  'events': 'Eventos',
  'blog': 'Blog',
  'categories': 'Categorias',
  'venues': 'Venues',
  'profiles': 'Perfis',
  'comments': 'Comentários',
  'contact-messages': 'Contato',
  'organizers': 'Organizadores',
  'partners': 'Parceiros',
  'advertisements': 'Anúncios',
  'adsense': 'AdSense',
  'newsletter': 'Newsletter',
  'push-notifications': 'Push Notifications',
  'analytics': 'Analytics',
  'reports': 'Relatórios',
  'performance': 'Performance',
  'gamification': 'Gamificação',
  'settings': 'Configurações',
  'profile': 'Meu Perfil',
  'create': 'Criar',
  'edit': 'Editar',
};

export function AdminBreadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Remove 'admin-v2' from segments for cleaner display
  const segments = pathSegments.slice(1);
  
  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin-v2' },
    ...segments.map((segment, index) => {
      const href = `/admin-v2/${segments.slice(0, index + 1).join('/')}`;
      const label = routeMap[segment] || segment;
      return { label, href };
    })
  ];

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/admin-v2" className="flex items-center gap-1">
              <Home className="h-3 w-3" />
              Admin
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbs.slice(1).map((crumb, index) => (
          <React.Fragment key={crumb.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbs.length - 2 ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}