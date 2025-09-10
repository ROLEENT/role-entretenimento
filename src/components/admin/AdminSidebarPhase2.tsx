import { TrendingUp } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from 'react-router-dom';

export const AdminSidebarPhase2 = () => {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Dashboard Avançado">
        <Link to="/admin-v3/phase2" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Dashboard Avançado
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};