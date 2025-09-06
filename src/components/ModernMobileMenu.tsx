import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Drawer as DrawerPrimitive } from 'vaul';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  User, 
  Heart, 
  Calendar, 
  Settings, 
  LogOut,
  X,
  MapPin,
  Music,
  Building2,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

interface ModernMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  publicUser: any;
  hasAdminAccess: boolean;
  publicSignOut: () => void;
  setSearchOpen: (open: boolean) => void;
  setShowPublicAuth: (show: boolean) => void;
}

interface MenuStats {
  events: number;
  artists: number;
  organizers: number;
  articles: number;
}

export function ModernMobileMenu({
  isOpen,
  onClose,
  publicUser,
  hasAdminAccess,
  publicSignOut,
  setSearchOpen,
  setShowPublicAuth
}: ModernMobileMenuProps) {
  const [stats, setStats] = useState<MenuStats>({
    events: 0,
    artists: 0,
    organizers: 0,
    articles: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, artistsRes, organizersRes, articlesRes] = await Promise.all([
          supabase.from('agenda_itens').select('id', { count: 'exact' }).eq('status', 'published'),
          supabase.from('artists').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('organizers').select('id', { count: 'exact' }),
          supabase.from('highlights').select('id', { count: 'exact' }).eq('is_published', true)
        ]);

        setStats({
          events: eventsRes.count || 0,
          artists: artistsRes.count || 0,
          organizers: organizersRes.count || 0,
          articles: articlesRes.count || 0
        });
      } catch (error) {
        console.error('Error fetching menu stats:', error);
      }
    };

    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const menuSections = [
    {
      id: 'explore',
      title: 'Explorar',
      description: 'Descubra o melhor da cena',
      icon: Sparkles,
      href: '/agenda',
      count: stats.events,
      countLabel: 'eventos',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'cities',
      title: 'Cidades',
      description: 'Eventos por região',
      icon: MapPin,
      href: '/agenda',
      count: 5,
      countLabel: 'cidades',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'artists',
      title: 'Artistas',
      description: 'Perfis e produtores',
      icon: Music,
      href: '/perfis?type=artista',
      count: stats.artists,
      countLabel: 'artistas',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'venues',
      title: 'Locais',
      description: 'Casas e espaços',
      icon: Building2,
      href: '/perfis?type=local',
      count: stats.organizers,
      countLabel: 'locais',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'magazine',
      title: 'Revista',
      description: 'Artigos e entrevistas',
      icon: BookOpen,
      href: '/revista',
      count: stats.articles,
      countLabel: 'artigos',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  return (
    <DrawerPrimitive.Root 
      direction="left" 
      open={isOpen} 
      onOpenChange={onClose}
      shouldScaleBackground={false}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Overlay className="fixed inset-0 z-40 bg-black/60" />
        
        <DrawerPrimitive.Content
          className="fixed inset-y-0 left-0 z-50 w-full bg-background shadow-xl focus:outline-none"
          style={{ touchAction: "manipulation" }}
        >
          <div className="flex h-dvh flex-col">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 pt-[calc(env(safe-area-inset-top)+24px)]">
              <div className="flex items-center justify-between mb-6">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-bold text-foreground"
                >
                  Menu
                </motion.h1>
                <DrawerPrimitive.Close asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerPrimitive.Close>
              </div>

              {/* Search Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <DrawerPrimitive.Close asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-14 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                    <span className="text-base">Buscar eventos, artistas...</span>
                  </Button>
                </DrawerPrimitive.Close>
              </motion.div>
            </div>

            {/* Main Content - Com scroll otimizado */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="space-y-4">
                {menuSections.map((section, index) => (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    <DrawerPrimitive.Close asChild>
                      <Link
                        to={section.href}
                        className="block group"
                      >
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r p-[2px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
                          {/* Gradient border */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${section.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                          
                          {/* Card content */}
                          <div className="relative bg-background rounded-2xl p-4 h-20 flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${section.gradient}`}>
                              <section.icon className="h-6 w-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {section.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {section.description}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm font-medium text-primary">
                                <TrendingUp className="h-4 w-4" />
                                {section.count}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {section.countLabel}
                              </p>
                            </div>
                            
                            <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </DrawerPrimitive.Close>
                  </motion.div>
                ))}
              </div>

              {/* User Section */}
              {publicUser && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="mt-8 pt-6 border-t border-border"
                >
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-muted/50">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {publicUser.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        Minha conta
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {publicUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <DrawerPrimitive.Close asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <User className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Perfil</span>
                      </Link>
                    </DrawerPrimitive.Close>
                    
                    <DrawerPrimitive.Close asChild>
                      <Link
                        to="/meus-salvos"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Meus Salvos</span>
                      </Link>
                    </DrawerPrimitive.Close>
                    
                    <DrawerPrimitive.Close asChild>
                      <Link
                        to="/notificacoes"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                      >
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Notificações</span>
                      </Link>
                    </DrawerPrimitive.Close>

                    {hasAdminAccess && (
                      <DrawerPrimitive.Close asChild>
                        <Link
                          to="/admin-v3"
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">Painel Admin</span>
                        </Link>
                      </DrawerPrimitive.Close>
                    )}
                    
                    <DrawerPrimitive.Close asChild>
                      <button
                        onClick={publicSignOut}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">Sair</span>
                      </button>
                    </DrawerPrimitive.Close>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border pb-[calc(env(safe-area-inset-bottom)+24px)]">
              {!publicUser && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-4"
                >
                  <DrawerPrimitive.Close asChild>
                    <Button 
                      className="w-full h-12 text-base font-medium"
                      onClick={() => setShowPublicAuth(true)}
                    >
                      Entrar na plataforma
                    </Button>
                  </DrawerPrimitive.Close>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30"
              >
                <span className="text-sm font-medium text-muted-foreground">Tema</span>
                <ThemeToggle />
              </motion.div>
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}