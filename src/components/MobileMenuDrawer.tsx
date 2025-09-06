import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer } from 'vaul';
import { 
  Search, 
  User, 
  Heart, 
  Calendar, 
  Settings, 
  LogOut,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ href: string; label: string }>;
  perfisDropdownItems: Array<{ href: string; label: string }>;
  isActive: (href: string) => boolean;
  publicUser: any;
  hasAdminAccess: boolean;
  publicSignOut: () => void;
  setSearchOpen: (open: boolean) => void;
  setShowPublicAuth: (show: boolean) => void;
}

export function MobileMenuDrawer({
  isOpen,
  onClose,
  navLinks,
  perfisDropdownItems,
  isActive,
  publicUser,
  hasAdminAccess,
  publicSignOut,
  setSearchOpen,
  setShowPublicAuth
}: MobileMenuDrawerProps) {
  return (
    <Drawer.Root 
      direction="left" 
      open={isOpen} 
      onOpenChange={onClose}
      shouldScaleBackground={false}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content 
          className={cn(
            "fixed top-0 left-0 z-50 flex h-[100dvh] w-[88vw] max-w-[420px] flex-col",
            "bg-background border-r",
            "touch-manipulation pointer-events-auto"
          )}
        >
          {/* Header sticky */}
          <div className="sticky top-0 z-20 bg-background px-5 pb-3 pt-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Menu</h2>
            <Drawer.Close asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar menu</span>
              </Button>
            </Drawer.Close>
          </div>
          <div className="mx-5 h-px w-[calc(100%-2.5rem)] bg-border" />

          {/* Body com scroll */}
          <nav 
            className={cn(
              "flex-1 min-h-0 overflow-y-auto px-5 pb-4 pr-3 -mr-1",
              "overscroll-contain [-webkit-overflow-scrolling:touch]"
            )}
          >
            {/* Search */}
            <div className="mb-6 mt-4">
              <Drawer.Close asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    setSearchOpen(true);
                  }}
                >
                  <Search className="h-4 w-4" />
                  Buscar eventos e artigos
                </Button>
              </Drawer.Close>
            </div>

            <ul className="flex flex-col gap-3 text-lg">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Drawer.Close asChild>
                    <Link 
                      to={link.href}
                      className={cn(
                        "block py-2 transition-colors",
                        isActive(link.href) ? "text-primary font-medium" : "text-foreground"
                      )}
                      onClick={() => {
                        setTimeout(() => window.scrollTo(0, 0), 100);
                      }}
                    >
                      {link.label}
                    </Link>
                  </Drawer.Close>
                </li>
              ))}

              {/* Perfis como acordeão — fechado por padrão */}
              <li>
                <Accordion type="single" collapsible defaultValue="">
                  <AccordionItem value="perfis" className="border-0">
                    <AccordionTrigger className="justify-between p-0 text-lg font-normal text-foreground hover:no-underline data-[state=open]:text-primary">
                      Perfis
                    </AccordionTrigger>
                    <AccordionContent className="pl-2 pt-2">
                      <ul className="flex flex-col gap-2">
                        {perfisDropdownItems.map((item) => (
                          <li key={item.href}>
                            <Drawer.Close asChild>
                              <Link 
                                to={item.href}
                                className="block py-1 text-base text-foreground transition-colors hover:text-primary"
                              >
                                {item.label}
                              </Link>
                            </Drawer.Close>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </li>

              {/* User Section */}
              {publicUser && (
                <>
                  <li className="border-t pt-4">
                    <div className="flex items-center gap-3 py-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {publicUser.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {publicUser.email}
                        </p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <Drawer.Close asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                      >
                        <User className="h-4 w-4" />
                        Perfil
                      </Link>
                    </Drawer.Close>
                  </li>
                  <li>
                    <Drawer.Close asChild>
                      <Link
                        to="/meus-salvos"
                        className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                      >
                        <Heart className="h-4 w-4" />
                        Meus Salvos
                      </Link>
                    </Drawer.Close>
                  </li>
                  <li>
                    <Drawer.Close asChild>
                      <Link
                        to="/notificacoes"
                        className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                      >
                        <Calendar className="h-4 w-4" />
                        Minhas Notificações
                      </Link>
                    </Drawer.Close>
                  </li>
                  {hasAdminAccess && (
                    <li>
                      <Drawer.Close asChild>
                        <Link
                          to="/admin-v3"
                          className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                        >
                          <Settings className="h-4 w-4" />
                          Painel Admin
                        </Link>
                      </Drawer.Close>
                    </li>
                  )}
                  <li>
                    <Drawer.Close asChild>
                      <button 
                        onClick={publicSignOut}
                        className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </Drawer.Close>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Footer sticky com Entrar e Tema */}
          <div className="sticky bottom-0 z-20 bg-background px-5 py-4 border-t">
            {!publicUser && (
              <Drawer.Close asChild>
                <Button 
                  className="w-full mb-3" 
                  onClick={() => {
                    setShowPublicAuth(true);
                  }}
                >
                  Entrar
                </Button>
              </Drawer.Close>
            )}

            <div>
              <p className="mb-2 text-sm font-medium">Tema</p>
              {/* As opções de tema ganham scroll próprio caso cresçam */}
              <div className={cn(
                "max-h-[40vh] overflow-y-auto pr-2 -mr-1 rounded-xl border bg-muted/40 p-2",
                "overscroll-contain [-webkit-overflow-scrolling:touch]"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Escolher tema</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}