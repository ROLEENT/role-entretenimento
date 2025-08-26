import { NavLink, useLocation } from "react-router-dom";
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
  Zap
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
import { useNavigate } from "react-router-dom";

const contentItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Destaques", url: "/admin/highlights", icon: Sparkles },
  { title: "Eventos", url: "/admin/events", icon: Calendar },
  { title: "Blog", url: "/admin/blog", icon: FileText },
  { title: "Categorias", url: "/admin/categories", icon: FolderOpen },
  { title: "Venues", url: "/admin/venues", icon: MapPin },
];

const userItems = [
  { title: "Perfis", url: "/admin/profiles", icon: Users },
  { title: "Comentários", url: "/admin/comments", icon: MessageSquare },
  { title: "Contato", url: "/admin/contact-messages", icon: Mail },
  { title: "Organizadores", url: "/admin/organizers", icon: Building2 },
];

const marketingItems = [
  { title: "Parceiros", url: "/admin/partners", icon: UserCheck },
  { title: "Anúncios", url: "/admin/advertisements", icon: Megaphone },
  { title: "AdSense", url: "/admin/adsense", icon: Target },
  { title: "Newsletter", url: "/admin/newsletter", icon: Mail },
  { title: "Push Notifications", url: "/admin/push-notifications", icon: Bell },
];

const analyticsItems = [
  { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
  { title: "Relatórios", url: "/admin/reports", icon: BarChart3 },
  { title: "Performance", url: "/admin/performance", icon: Zap },
];

const systemItems = [
  { title: "Gamificação", url: "/admin/gamification", icon: Trophy },
  { title: "Configurações", url: "/admin/settings", icon: Settings },
  { title: "Meu Perfil", url: "/admin/profile", icon: User },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) => 
    isActive(path) ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const handleLogout = () => {
    navigate("/");
  };

  const SidebarSection = ({ title, items }: { title: string, items: typeof contentItems }) => (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
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
    </SidebarGroup>
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent>
        <SidebarSection title="Conteúdo" items={contentItems} />
        <SidebarSection title="Usuários" items={userItems} />
        <SidebarSection title="Marketing" items={marketingItems} />
        <SidebarSection title="Analytics" items={analyticsItems} />
        <SidebarSection title="Sistema" items={systemItems} />
      </SidebarContent>
    </Sidebar>
  );
}