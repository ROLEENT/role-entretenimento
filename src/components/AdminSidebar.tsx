import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FileText,
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  Tag,
  Image,
  Star,
  Home,
  User,
  ChevronDown,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const mainMenuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
  },
  {
    title: "Destaques",
    url: "/admin/highlights",
    icon: Star,
  },
  {
    title: "Eventos",
    url: "/admin/event/create",
    icon: Calendar,
  },
  {
    title: "Parceiros",
    url: "/admin/partners",
    icon: Users,
  },
  {
    title: "Publicidade",
    url: "/admin/advertisements",
    icon: Image,
  },
];

const contentMenuItems = [
  {
    title: "Blog",
    icon: FileText,
    subItems: [
      {
        title: "Novo Post",
        url: "/admin/posts/new",
      },
      {
        title: "Histórico",
        url: "/admin/posts/history",
      },
    ],
  },
  {
    title: "Comentários",
    url: "/admin/comments",
    icon: MessageSquare,
  },
  {
    title: "Mensagens",
    url: "/admin/contact-messages",
    icon: MessageSquare,
  },
];

const systemMenuItems = [
  {
    title: "Locais",
    url: "/admin/venues",
    icon: MapPin,
  },
  {
    title: "Categorias",
    url: "/admin/categories",
    icon: Tag,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { adminUser, logoutAdmin } = useAdminAuth();
  const [isBlogOpen, setIsBlogOpen] = useState(
    location.pathname.startsWith("/admin/posts")
  );
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    return isActive(path)
      ? "bg-primary text-primary-foreground font-medium"
      : "hover:bg-muted/50";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">R</span>
            </div>
            <span className="font-semibold">ROLÊ Admin</span>
          </div>
        )}
        <SidebarTrigger className="ml-auto" />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Conteúdo</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Blog with submenu */}
              <SidebarMenuItem>
                <Collapsible open={isBlogOpen} onOpenChange={setIsBlogOpen}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className={
                        location.pathname.startsWith("/admin/posts")
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted/50"
                      }
                    >
                      <FileText className="h-4 w-4" />
                      {!collapsed && (
                        <>
                          <span>Blog</span>
                          <ChevronDown className="ml-auto h-4 w-4 transition-transform" />
                        </>
                      )}
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  {!collapsed && (
                    <CollapsibleContent>
                      <SidebarMenu className="ml-4">
                        {contentMenuItems[0].subItems?.map((subItem) => (
                          <SidebarMenuItem key={subItem.title}>
                            <SidebarMenuButton asChild>
                              <NavLink
                                to={subItem.url}
                                className={getNavClassName(subItem.url)}
                              >
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>

              {/* Other content items */}
              {contentMenuItems.slice(1).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {!collapsed && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="truncate">{adminUser?.full_name || adminUser?.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logoutAdmin}
              className="w-full justify-start text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={logoutAdmin}
            className="w-full p-2"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
