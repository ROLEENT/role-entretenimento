import React, { useState, useEffect } from 'react';
import { X, Search, Star, Newspaper, Music, User, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/ThemeProvider';
import { supabase } from '@/integrations/supabase/client';

interface RoleMobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks?: Array<{ href: string; label: string }>;
  perfisDropdownItems?: Array<{ href: string; label: string }>;
  isActive?: (href: string) => boolean;
  publicUser?: any;
  hasAdminAccess?: boolean;
  publicSignOut?: () => void;
  setSearchOpen?: (open: boolean) => void;
  setShowPublicAuth?: (show: boolean) => void;
}

export const RoleMobileMenuDrawer: React.FC<RoleMobileMenuDrawerProps> = ({
  isOpen,
  onClose,
  publicUser,
  setSearchOpen,
  setShowPublicAuth,
}) => {
  const { theme, setTheme } = useTheme();
  const [eventCount, setEventCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch event count
  useEffect(() => {
    const fetchEventCount = async () => {
      const { count } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('date_start', new Date().toISOString());
      
      setEventCount(count || 0);
    };

    if (isOpen) {
      fetchEventCount();
    }
  }, [isOpen]);

  // Auto-focus search input when menu opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.getElementById('mobile-menu-search');
        searchInput?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Open search modal and pass search term via URL or global state
      window.location.href = `/agenda?q=${encodeURIComponent(searchTerm.trim())}`;
      onClose();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[60] bg-background/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[70] bg-gradient-to-br from-background/50 via-primary/10 to-secondary/10",
        "backdrop-blur-md",
        "animate-in slide-in-from-top duration-300"
      )}>
        <div className="flex flex-col h-full p-6 safe-area-padding-top">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-foreground">ROLÊ</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-10 w-10 rounded-full hover:bg-muted/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 text-muted-foreground -translate-y-1/2" />
              <input
                id="mobile-menu-search"
                type="text"
                placeholder="Buscar eventos, artistas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "w-full h-12 pl-12 pr-4 rounded-xl border-0",
                  "bg-background/60 backdrop-blur-sm",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/30",
                  "transition-all duration-200"
                )}
              />
            </div>
          </form>

          {/* Main Cards Section */}
          <div className="flex-1 space-y-4">
            {/* Explorar Card - Destaque */}
            <Link
              to="/agenda"
              onClick={onClose}
              className={cn(
                "block p-6 rounded-2xl transition-all duration-300",
                "bg-gradient-to-br from-primary to-secondary",
                "shadow-lg hover:shadow-xl hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-primary-foreground/20">
                    <Star className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-foreground">Explorar</h3>
                    <p className="text-primary-foreground/80 text-sm">Descubra o melhor da cena</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-primary-foreground/80">eventos</span>
                  <div className="text-lg font-bold text-primary-foreground">{eventCount}</div>
                </div>
              </div>
            </Link>

            {/* Cards Secundários Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Card Revista */}
              <Link
                to="/revista"
                onClick={onClose}
                className={cn(
                  "block p-4 h-20 rounded-xl transition-all duration-300",
                  "bg-gradient-to-br from-secondary/20 to-secondary/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-secondary/40">
                    <Newspaper className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <span className="font-semibold text-secondary-foreground text-sm">
                    Revista
                  </span>
                </div>
              </Link>

              {/* Card Artistas */}
              <Link
                to="/perfis?type=artista"
                onClick={onClose}
                className={cn(
                  "block p-4 h-20 rounded-xl transition-all duration-300",
                  "bg-gradient-to-br from-accent/20 to-accent/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-accent/40">
                    <Music className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <span className="font-semibold text-accent-foreground text-sm">
                    Artistas
                  </span>
                </div>
              </Link>

              {/* Card Meu Perfil */}
              {publicUser ? (
                <Link
                  to="/profile"
                  onClick={onClose}
                  className={cn(
                    "block p-4 h-20 rounded-xl transition-all duration-300",
                    "bg-gradient-to-br from-muted/40 to-muted/60",
                    "shadow-md hover:shadow-lg hover:scale-[1.02]",
                    "active:scale-[0.98] backdrop-blur-sm"
                  )}
                >
                  <div className="flex items-center space-x-3 h-full">
                    <div className="p-2 rounded-lg bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-semibold text-muted-foreground text-sm">
                      Meu Perfil
                    </span>
                  </div>
                </Link>
              ) : (
                <div className={cn(
                  "p-4 h-20 rounded-xl",
                  "bg-gradient-to-br from-muted/30 to-muted/50",
                  "shadow-md backdrop-blur-sm opacity-50"
                )}>
                  <div className="flex items-center space-x-3 h-full">
                    <div className="p-2 rounded-lg bg-muted">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="font-semibold text-muted-foreground text-sm">
                      Meu Perfil
                    </span>
                  </div>
                </div>
              )}

              {/* Theme Toggle Card */}
              <button
                onClick={toggleTheme}
                className={cn(
                  "p-4 h-20 rounded-xl transition-all duration-300",
                  "bg-gradient-to-br from-accent/20 to-accent/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-accent/40">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-accent-foreground" />
                    ) : (
                      <Moon className="h-4 w-4 text-accent-foreground" />
                    )}
                  </div>
                  <span className="font-semibold text-accent-foreground text-sm">
                    Tema
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer - Conditional */}
          <div className="mt-8 pt-6 border-t border-border/30">
            {!publicUser && (
              <Button
                onClick={() => {
                  setShowPublicAuth?.(true);
                }}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-base",
                  "bg-gradient-to-r from-primary to-secondary",
                  "hover:from-primary/90 hover:to-secondary/90",
                  "text-primary-foreground shadow-lg hover:shadow-xl",
                  "transition-all duration-300 hover:scale-[1.02]",
                  "active:scale-[0.98]"
                )}
              >
                Entrar na plataforma
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};