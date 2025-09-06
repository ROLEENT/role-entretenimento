"use client";

import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MENUS } from "@/components/admin/menu.config";

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (href: string) => location.pathname === href;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            R
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-base font-bold">ROLÊ</span>
              <span className="text-xs text-muted-foreground">Admin v3</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="flex-1">
          {/* Agenda */}
          <SidebarGroup>
            <SidebarGroupLabel>Agenda</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENUS.agenda.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Perfis */}
          <SidebarGroup>
            <SidebarGroupLabel>Perfis</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENUS.perfis.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Revista */}
          <SidebarGroup>
            <SidebarGroupLabel>Revista</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENUS.revista.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Gestão */}
          <SidebarGroup>
            <SidebarGroupLabel>Gestão</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENUS.gestao.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Destaques */}
          <SidebarGroup>
            <SidebarGroupLabel>Destaques</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {MENUS.destaques.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.href)}
                      tooltip={state === "collapsed" ? item.title : undefined}
                    >
                      <NavLink to={item.href}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}