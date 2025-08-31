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
import { MENUS } from "@/components/admin/menu.config";

export function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  const isActive = (href: string) => location.pathname === href;

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-sm font-bold">A</span>
          </div>
          {state === "expanded" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Admin v3</span>
              <span className="text-xs text-muted-foreground">Painel de controle</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
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

        {/* Agentes */}
        <SidebarGroup>
          <SidebarGroupLabel>Agentes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MENUS.agentes.map((item) => (
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
      </SidebarContent>
    </Sidebar>
  );
}