import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Drawer as DrawerPrimitive } from 'vaul';
import { 
  Search, 
  X,
  Star,
  Calendar,
  Music,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';
import roleLogo from '@/assets/role-logo.png';

interface RoleMenuMobileProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch?: (term: string) => void;
  eventCount?: number;
  setShowPublicAuth?: (show: boolean) => void;
}

export function RoleMenuMobile({
  isOpen,
  onClose,
  onSearch,
  eventCount = 0,
  setShowPublicAuth
}: RoleMenuMobileProps) {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-focus search when menu opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        const searchInput = document.getElementById('role-search-input');
        searchInput?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
    onClose();
  };

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
              <img 
                src={roleLogo} 
                alt="ROLÊ" 
                className="h-8 w-auto drop-shadow-sm"
              />
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
                  onClick={() => {
                    navigate('/agenda');
                    onClose();
                  }}
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
                      <div className="text-white font-bold text-lg">
                        {eventCount}
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* Secondary Cards Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Eventos Card */}
                <div 
                  className="
                    group bg-gradient-to-br from-purple-200 to-purple-300
                    dark:from-purple-800/60 dark:to-purple-900/60
                    rounded-xl p-4 h-24
                    shadow-md
                    transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
                  onClick={() => {
                    navigate('/agenda/todos');
                    onClose();
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="p-2 bg-white/30 rounded-lg w-fit">
                      <Calendar className="h-4 w-4 text-purple-700 dark:text-purple-200" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-800 dark:text-purple-100">
                        Eventos
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Artistas Card */}
                <div 
                  className="
                    group bg-gradient-to-br from-pink-200 to-orange-200
                    dark:from-pink-800/60 dark:to-orange-800/60
                    rounded-xl p-4 h-24
                    shadow-md
                    transition-all duration-200 ease-out
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    cursor-pointer
                  "
                  onClick={() => {
                    navigate('/perfis?type=artista');
                    onClose();
                  }}
                >
                  <div className="flex flex-col justify-between h-full">
                    <div className="p-2 bg-white/30 rounded-lg w-fit">
                      <Music className="h-4 w-4 text-pink-700 dark:text-pink-200" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-pink-800 dark:text-pink-100">
                        Artistas
                      </h4>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="space-y-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              
              {/* CTA Button */}
              <Button 
                className="
                  w-full h-12 
                  bg-purple-600 hover:bg-purple-700 
                  text-white font-semibold
                  rounded-xl shadow-lg
                  transition-all duration-200
                  hover:scale-[1.02] active:scale-[0.98]
                "
                onClick={() => {
                  if (setShowPublicAuth) {
                    setShowPublicAuth(true);
                  }
                  onClose();
                }}
              >
                Entrar na plataforma
              </Button>

              {/* Theme Toggle */}
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="
                    flex items-center justify-center
                    w-12 h-12 rounded-xl
                    bg-white/20 backdrop-blur-sm
                    text-white hover:bg-white/30
                    transition-all duration-200
                    hover:scale-110 active:scale-95
                  "
                >
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}