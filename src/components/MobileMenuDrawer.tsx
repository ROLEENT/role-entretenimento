import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Drawer as DrawerPrimitive } from 'vaul';
import { 
  Search, 
  User, 
  Heart, 
  Calendar, 
  Settings, 
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';

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
  const [perfisOpen, setPerfisOpen] = useState(false);
  return (
    <DrawerPrimitive.Root 
      direction="left" 
      open={isOpen} 
      onOpenChange={onClose}
      shouldScaleBackground={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay" />
        
        <DrawerPrimitive.Content
          className="
            fixed inset-y-0 left-0 z-50 w-[88vw] max-w-[420px]
            bg-background shadow-xl focus:outline-none
          "
          style={{ touchAction: "manipulation" }}
        >
          <div
            className="
              flex h-dvh flex-col
              pl-[env(safe-area-inset-left)]
              pr-[env(safe-area-inset-right)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header sticky */}
            <div className="sticky top-0 z-20 bg-background px-5 pb-3 pt-[calc(env(safe-area-inset-top)+20px)]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Menu</h2>
                <DrawerPrimitive.Close asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Fechar menu</span>
                  </Button>
                </DrawerPrimitive.Close>
              </div>
              <div className="mt-3 h-px w-full bg-border" />
            </div>

            {/* Corpo rolável */}
            <nav
              className="
                flex-1 min-h-0 overflow-y-auto px-5 pb-4 pr-3 -mr-1
                overscroll-contain
              "
              style={{ WebkitOverflowScrolling: "touch" as any }}
            >
              {/* Search */}
              <div className="mb-6 mt-4">
                <DrawerPrimitive.Close asChild>
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
                </DrawerPrimitive.Close>
              </div>

              <ul className="flex flex-col gap-3 text-lg">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <DrawerPrimitive.Close asChild>
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
                    </DrawerPrimitive.Close>
                  </li>
                ))}

                {/* Perfis dropdown customizado */}
                <li>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setPerfisOpen(!perfisOpen);
                    }}
                    className="flex items-center justify-between w-full py-2 text-lg font-normal text-foreground transition-colors hover:text-primary"
                    aria-expanded={perfisOpen}
                    style={{ touchAction: "manipulation" }}
                  >
                    Perfis
                    <ChevronDown 
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        perfisOpen ? "rotate-180" : ""
                      )} 
                    />
                  </button>
                  {perfisOpen && (
                    <ul className="pl-2 pt-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
                      {perfisDropdownItems.map((item) => (
                        <li key={item.href}>
                          <DrawerPrimitive.Close asChild>
                            <Link 
                              to={item.href}
                              className="block py-1 text-base text-foreground transition-colors hover:text-primary"
                              onClick={() => setPerfisOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </DrawerPrimitive.Close>
                        </li>
                      ))}
                    </ul>
                  )}
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
                      <DrawerPrimitive.Close asChild>
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                        >
                          <User className="h-4 w-4" />
                          Perfil
                        </Link>
                      </DrawerPrimitive.Close>
                    </li>
                    <li>
                      <DrawerPrimitive.Close asChild>
                        <Link
                          to="/meus-salvos"
                          className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                        >
                          <Heart className="h-4 w-4" />
                          Meus Salvos
                        </Link>
                      </DrawerPrimitive.Close>
                    </li>
                    <li>
                      <DrawerPrimitive.Close asChild>
                        <Link
                          to="/notificacoes"
                          className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                        >
                          <Calendar className="h-4 w-4" />
                          Minhas Notificações
                        </Link>
                      </DrawerPrimitive.Close>
                    </li>
                    {hasAdminAccess && (
                      <li>
                        <DrawerPrimitive.Close asChild>
                          <Link
                            to="/admin-v3"
                            className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary"
                          >
                            <Settings className="h-4 w-4" />
                            Painel Admin
                          </Link>
                        </DrawerPrimitive.Close>
                      </li>
                    )}
                    <li>
                      <DrawerPrimitive.Close asChild>
                        <button 
                          onClick={publicSignOut}
                          className="flex items-center gap-3 py-2 text-base text-foreground transition-colors hover:text-primary w-full text-left"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair
                        </button>
                      </DrawerPrimitive.Close>
                    </li>
                  </>
                )}
              </ul>
            </nav>

            {/* Footer sticky com Entrar e Tema */}
            <div className="sticky bottom-0 z-20 bg-background px-5 py-4 border-t pb-[calc(env(safe-area-inset-bottom)+16px)]">
              {!publicUser && (
                <DrawerPrimitive.Close asChild>
                  <Button 
                    className="w-full mb-3" 
                    onClick={() => {
                      setShowPublicAuth(true);
                    }}
                  >
                    Entrar
                  </Button>
                </DrawerPrimitive.Close>
              )}

              <div>
                <p className="mb-2 text-sm font-medium">Tema</p>
                {/* As opções de tema ganham scroll próprio caso cresçam */}
                <div
                  className="max-h-[40vh] overflow-y-auto pr-2 -mr-1 rounded-xl border bg-muted/40 p-2 overscroll-contain"
                  style={{ WebkitOverflowScrolling: "touch" as any }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Escolher tema</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}