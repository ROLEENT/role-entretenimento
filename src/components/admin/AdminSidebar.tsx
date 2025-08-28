import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  Calendar,
  Users,
  Building2,
  Megaphone,
  User,
  LogOut,
  TrendingUp,
  MessageSquare,
  Mail,
  FileText,
  MapPin,
  FolderOpen,
  UserCheck,
  Target,
  Settings,
  Trophy,
  Bell,
  BarChart3,
  Shield,
  Zap,
  Mic,
  Activity,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";

const contentItems = [
  { title: "Dashboard", url: "/admin-v2", icon: LayoutDashboard },
  { title: "Destaques", url: "/admin-v2/highlights", icon: Sparkles },
  { title: "Eventos", url: "/admin-v2/events", icon: Calendar },
  { title: "Blog", url: "/admin-v2/blog", icon: FileText },
  { title: "Categorias", url: "/admin-v2/categories", icon: FolderOpen },
  { title: "Venues", url: "/admin-v2/venues", icon: MapPin },
  { title: "Artistas", url: "/admin-v2/artists", icon: Mic },
];

const userItems = [
  { title: "Perfis", url: "/admin-v2/profiles", icon: Users },
  { title: "Comentários", url: "/admin-v2/comments", icon: MessageSquare },
  { title: "Contato", url: "/admin-v2/contact-messages", icon: Mail },
  { title: "Organizadores", url: "/admin-v2/organizers", icon: Building2 },
];

const marketingItems = [
  { title: "Parceiros", url: "/admin-v2/partners", icon: UserCheck },
  { title: "Anúncios", url: "/admin-v2/advertisements", icon: Megaphone },
  { title: "AdSense", url: "/admin-v2/adsense", icon: Target },
  { title: "Newsletter", url: "/admin-v2/newsletter", icon: Mail },
  { title: "Push Notifications", url: "/admin-v2/push-notifications", icon: Bell },
];

const analyticsItems = [
  { title: "Analytics", url: "/admin-v2/analytics", icon: TrendingUp },
  { title: "Relatórios", url: "/admin-v2/reports", icon: BarChart3 },
  { title: "Performance", url: "/admin-v2/performance", icon: Zap },
];

const systemItems = [
  { title: "Gamificação", url: "/admin-v2/gamification", icon: Trophy },
  { title: "Segurança & Roles", url: "/admin-v2/security", icon: Shield },
  { title: "Log de Auditoria", url: "/admin-v2/audit", icon: Activity },
  { title: "Configurações", url: "/admin-v2/settings", icon: Settings },
  { title: "Meu Perfil", url: "/admin-v2/profile", icon: User },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  // Estados para grupos colapsáveis
  const [openGroups, setOpenGroups] = useState({
    content: true,
    users: false,
    marketing: false,
    analytics: false,
    system: false,
  });

  const isActive = (path: string) => {
    if (path === "/admin-v2") {
      return currentPath === "/admin-v2";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => {
    if (isActive(path)) {
      return "bg-primary/10 text-primary font-medium border-r-2 border-primary";
    }
    return "hover:bg-muted/50";
  };

  const handleLogout = () => {
    navigate("/");
  };

  // Verificar se algum item do grupo está ativo para manter aberto
  const isGroupActive = (items: typeof contentItems) => {
    return items.some(item => isActive(item.url));
  };

  const toggleGroup = (groupKey: keyof typeof openGroups) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const CollapsibleSidebarSection = ({ 
    title, 
    items, 
    groupKey, 
    defaultOpen = false 
  }: { 
    title: string, 
    items: typeof contentItems,
    groupKey: keyof typeof openGroups,
    defaultOpen?: boolean
  }) => {
    const isOpen = openGroups[groupKey] || isGroupActive(items);
    
    return (
      <SidebarGroup className="mb-2">
        <Collapsible open={isOpen} onOpenChange={() => toggleGroup(groupKey)}>
          <CollapsibleTrigger asChild>
            <SidebarGroupLabel className="cursor-pointer hover:bg-muted/50 p-2 rounded-md flex items-center justify-between">
              <span>{title}</span>
              {!collapsed && (
                isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              )}
            </SidebarGroupLabel>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClass(item.url)}>
                        <item.icon className="mr-2 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </CollapsibleContent>
        </Collapsible>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="space-y-2">
        <CollapsibleSidebarSection title="Conteúdo" items={contentItems} groupKey="content" defaultOpen />
        <CollapsibleSidebarSection title="Usuários" items={userItems} groupKey="users" />
        <CollapsibleSidebarSection title="Marketing" items={marketingItems} groupKey="marketing" />
        <CollapsibleSidebarSection title="Analytics" items={analyticsItems} groupKey="analytics" />
        <CollapsibleSidebarSection title="Sistema" items={systemItems} groupKey="system" />
      </SidebarContent>
    </Sidebar>
  );
}