import React, { useState, useEffect } from 'react';
import { X, Search, Star, Newspaper, Music, User, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
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
      setSearchOpen?.(true);
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
        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-[70] bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100",
        "dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-800/20",
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
              className="h-10 w-10 rounded-full hover:bg-white/20"
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
                  "bg-white/60 dark:bg-black/20 backdrop-blur-sm",
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
                "bg-gradient-to-br from-purple-400 to-pink-400",
                "dark:from-purple-600 dark:to-pink-600",
                "shadow-lg hover:shadow-xl hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Explorar</h3>
                    <p className="text-white/80 text-sm">Descubra o melhor da cena</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-white/80">eventos</span>
                  <div className="text-lg font-bold text-white">{eventCount}</div>
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
                  "bg-gradient-to-br from-purple-100 to-purple-200",
                  "dark:from-purple-800/30 dark:to-purple-900/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-700/50">
                    <Newspaper className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">
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
                  "bg-gradient-to-br from-orange-100 to-orange-200",
                  "dark:from-orange-800/30 dark:to-orange-900/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-orange-200 dark:bg-orange-700/50">
                    <Music className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  </div>
                  <span className="font-semibold text-orange-800 dark:text-orange-200 text-sm">
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
                    "bg-gradient-to-br from-blue-100 to-blue-200",
                    "dark:from-blue-800/30 dark:to-blue-900/30",
                    "shadow-md hover:shadow-lg hover:scale-[1.02]",
                    "active:scale-[0.98] backdrop-blur-sm"
                  )}
                >
                  <div className="flex items-center space-x-3 h-full">
                    <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-700/50">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                      Meu Perfil
                    </span>
                  </div>
                </Link>
              ) : (
                <div className={cn(
                  "p-4 h-20 rounded-xl",
                  "bg-gradient-to-br from-gray-100 to-gray-200",
                  "dark:from-gray-800/30 dark:to-gray-900/30",
                  "shadow-md backdrop-blur-sm opacity-50"
                )}>
                  <div className="flex items-center space-x-3 h-full">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700/50">
                      <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                    </div>
                    <span className="font-semibold text-gray-600 dark:text-gray-400 text-sm">
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
                  "bg-gradient-to-br from-yellow-100 to-yellow-200",
                  "dark:from-yellow-800/30 dark:to-yellow-900/30",
                  "shadow-md hover:shadow-lg hover:scale-[1.02]",
                  "active:scale-[0.98] backdrop-blur-sm"
                )}
              >
                <div className="flex items-center space-x-3 h-full">
                  <div className="p-2 rounded-lg bg-yellow-200 dark:bg-yellow-700/50">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                    ) : (
                      <Moon className="h-4 w-4 text-yellow-600 dark:text-yellow-300" />
                    )}
                  </div>
                  <span className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm">
                    Tema
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Footer - Conditional */}
          <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/30">
            {!publicUser && (
              <Button
                onClick={() => {
                  setShowPublicAuth?.(true);
                  onClose();
                }}
                className={cn(
                  "w-full h-12 rounded-xl font-semibold text-base",
                  "bg-gradient-to-r from-purple-500 to-pink-500",
                  "hover:from-purple-600 hover:to-pink-600",
                  "text-white shadow-lg hover:shadow-xl",
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