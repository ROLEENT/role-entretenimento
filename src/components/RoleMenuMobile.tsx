import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer as DrawerPrimitive } from 'vaul';
import { 
  Search, 
  X,
  Star,
  Newspaper,
  Music,
  User,
  Sun,
  Moon,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePublicAuth } from '@/hooks/usePublicAuth';

interface RoleMenuMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (term: string) => void;
  eventCount?: number;
  setShowPublicAuth?: (show: boolean) => void;
}

interface MenuStats {
  totalEvents: number;
  totalArtists: number;
  isLoading: boolean;
}

export function RoleMenuMobile({
  isOpen,
  onClose,
  onSearch,
  eventCount = 0,
  setShowPublicAuth
}: RoleMenuMobileProps) {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = usePublicAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  // Fetch dynamic stats for the menu
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['menu-stats'],
    queryFn: async (): Promise<MenuStats> => {
      try {
        const [eventsResult, artistsResult] = await Promise.all([
          supabase
            .from('events')
            .select('id', { count: 'exact' })
            .eq('status', 'active'),
          supabase
            .from('profiles')
            .select('id', { count: 'exact' })
            .eq('user_type', 'artist')
        ]);

        return {
          totalEvents: eventsResult.count || 0,
          totalArtists: artistsResult.count || 0,
          isLoading: false
        };
      } catch (error) {
        console.error('Error fetching menu stats:', error);
        return {
          totalEvents: eventCount,
          totalArtists: 0,
          isLoading: false
        };
      }
    },
    enabled: isOpen,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Auto-focus search when menu opens with enhanced accessibility
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.getElementById('role-search-input');
        if (searchInput) {
          searchInput.focus();
          // Add haptic feedback on supported devices
          if ('vibrate' in navigator) {
            navigator.vibrate(50);
          }
        }
      }, 150); // Slight delay for better UX
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
    onClose();
  };

  const handleNavigation = async (path: string) => {
    setIsNavigating(true);
    // Add haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    setTimeout(() => {
      navigate(path);
      onClose();
      setIsNavigating(false);
    }, 100); // Brief delay for visual feedback
  };

  const displayStats = stats || { totalEvents: eventCount, totalArtists: 0, isLoading: statsLoading };

  return (
    <DrawerPrimitive.Root 
      direction="top" 
      open={isOpen} 
      onOpenChange={onClose}
      shouldScaleBackground={true}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
        
        <DrawerPrimitive.Content
          data-testid="role-menu-mobile"
          className="
            fixed inset-0 z-50 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50
            dark:from-purple-950/90 dark:via-pink-950/90 dark:to-purple-950/90
            backdrop-blur-md focus:outline-none
            animate-in slide-in-from-top duration-300 ease-out
          "
          style={{ touchAction: "manipulation" }}
        >
          <div className="flex h-full flex-col px-6 py-8 pt-[calc(env(safe-area-inset-top)+32px)]">
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                ROLÊ
              </h1>
              <DrawerPrimitive.Close asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-10 w-10 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Fechar menu</span>
                </Button>
              </DrawerPrimitive.Close>
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="role-search-input"
                  type="text"
                  placeholder="Buscar eventos, artistas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="
                    w-full h-12 pl-12 pr-4 
                    bg-white/20 backdrop-blur-sm 
                    border border-white/30 rounded-xl
                    text-white placeholder:text-white/70
                    focus:outline-none focus:ring-2 focus:ring-white/50
                    transition-all duration-200
                  "
                />
              </div>
            </div>

            {/* Main Cards Section */}
            <div className="flex-1 space-y-6">
              
              {/* Featured Explorar Card */}
              <div className="group">
                <div 
                  className="
                    relative overflow-hidden
                    bg-gradient-to-r from-purple-600 to-pink-600
                    rounded-2xl p-6 h-32
                    shadow-lg shadow-purple-600/25
                    transition-all duration-300 ease-out
                    hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-600/40
                    active:scale-[0.98]
                    cursor-pointer
                  "
                  onClick={() => handleNavigation('/agenda')}
                >
                  <div className="flex items-center justify-between h-full">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Explorar</h3>
                        <p className="text-white/80 text-sm">Descubra o melhor da cena</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white/60 text-xs uppercase tracking-wide">
                        Eventos
                      </div>
                      <div className="text-white font-bold text-lg flex items-center gap-2">
                        {displayStats.isLoading ? (
                          <div className="w-8 h-6 bg-white/20 rounded animate-pulse" />
                        ) : (
                          <>
                            {displayStats.totalEvents}
                            {displayStats.totalEvents > 0 && (
                              <TrendingUp className="h-4 w-4 text-green-300" />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Secondary Cards Grid - Cards menores (~80px altura) */}
              <div className="grid grid-cols-3 gap-3">
                
                {/* Revista Card */}
                <div 
                  className="
                    group bg-gradient-to-br from-purple-200 to-purple-300
                    dark:from-purple-800/60 dark:to-purple-900/60
                    rounded-xl p-3 h-20
                    shadow-md
                    transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
                  onClick={() => handleNavigation('/revista')}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="p-1.5 bg-white/30 rounded-lg w-fit">
                      <Newspaper className="h-3.5 w-3.5 text-purple-700 dark:text-purple-200" />
                    </div>
                    <h4 className="font-semibold text-xs text-purple-800 dark:text-purple-100">
                      Revista
                    </h4>
                  </div>
                </div>

                {/* Artistas Card */}
                <div 
                  className="
                    group bg-gradient-to-br from-pink-200 to-orange-200
                    dark:from-pink-800/60 dark:to-orange-800/60
                    rounded-xl p-3 h-20
                    shadow-md
                    transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
                  onClick={() => handleNavigation('/perfis?type=artista')}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="p-1.5 bg-white/30 rounded-lg w-fit">
                      <Music className="h-3.5 w-3.5 text-pink-700 dark:text-pink-200" />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <h4 className="font-semibold text-xs text-pink-800 dark:text-pink-100">
                        Artistas
                      </h4>
                      <div 
                        className="text-xs text-pink-600 dark:text-pink-300 font-medium"
                        data-testid="artist-counter"
                      >
                        {displayStats.isLoading ? (
                          <div className="w-4 h-2 bg-pink-300 dark:bg-pink-700 rounded animate-pulse" />
                        ) : (
                          displayStats.totalArtists
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meu Perfil Card */}
                <div 
                  className="
                    group bg-gradient-to-br from-blue-200 to-blue-300
                    dark:from-blue-800/60 dark:to-blue-900/60
                    rounded-xl p-3 h-20
                    shadow-md
                    transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
                  onClick={() => handleNavigation(isAuthenticated ? '/profile' : '/perfis')}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="p-1.5 bg-white/30 rounded-lg w-fit">
                      <User className="h-3.5 w-3.5 text-blue-700 dark:text-blue-200" />
                    </div>
                    <h4 className="font-semibold text-xs text-blue-800 dark:text-blue-100">
                      {isAuthenticated ? 'Meu Perfil' : 'Perfis'}
                    </h4>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer - Condicional baseado no login */}
            <div className="space-y-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              
              {/* CTA Button - Só mostra se usuário NÃO está logado */}
              {!isAuthenticated && (
                <Button 
                  className="
                    w-full h-12 
                    bg-gradient-to-r from-[#8B5CF6] to-[#EC4899]
                    hover:from-[#7C3AED] hover:to-[#DB2777]
                    text-white font-semibold
                    rounded-xl shadow-lg
                    transition-all duration-300 ease-out
                    hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  disabled={isNavigating}
                  onClick={() => {
                    if (setShowPublicAuth) {
                      // Add haptic feedback
                      if ('vibrate' in navigator) {
                        navigator.vibrate(40);
                      }
                      setShowPublicAuth(true);
                    }
                    onClose();
                  }}
                >
                  {isNavigating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Carregando...
                    </div>
                  ) : (
                    'Entrar na plataforma'
                  )}
                </Button>
              )}

              {/* Theme Toggle - Sempre visível */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    // Add haptic feedback
                    if ('vibrate' in navigator) {
                      navigator.vibrate(25);
                    }
                    setTheme(theme === 'dark' ? 'light' : 'dark');
                  }}
                  className="
                    group flex items-center justify-center
                    w-12 h-12 rounded-xl
                    bg-white/20 backdrop-blur-sm
                    text-white hover:bg-white/30
                    transition-all duration-300 ease-out
                    hover:scale-110 active:scale-95
                    focus:outline-none focus:ring-2 focus:ring-white/50
                  "
                  aria-label={`Mudar para tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
                >
                  <div className="relative">
                    {theme === 'dark' ? (
                      <Sun className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                    ) : (
                      <Moon className="h-5 w-5 transition-transform duration-300 group-hover:-rotate-12" />
                    )}
                  </div>
                </button>
              </div>
            </div>

          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}