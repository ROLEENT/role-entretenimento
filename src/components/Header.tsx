import { Search, Menu, User, Heart, LogOut, Calendar, Settings, ChevronDown, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePublicAuth } from "@/hooks/usePublicAuth";
import { PublicAuthDialog } from "@/components/auth/PublicAuthDialog";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationTrigger } from "@/components/NotificationTrigger";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { RoleMobileMenuDrawer } from './RoleMobileMenuDrawer';

// Header mobile 2 linhas com carrossel de cidades
const Header = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { user: publicUser, signOut: publicSignOut, isAuthenticated } = usePublicAuth(); // Public auth
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inlineSearchOpen, setInlineSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [showPublicAuth, setShowPublicAuth] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/agenda', label: 'Agenda' },
    { href: '/revista', label: 'Revista' },
    { href: '/ajuda', label: 'Ajuda' }
  ];

  const perfisDropdownItems = [
    { href: '/perfis', label: 'Todos os perfis' },
    { href: '/perfis?type=artista', label: 'Artistas' },
    { href: '/perfis?type=local', label: 'Locais' },
    { href: '/perfis?type=organizador', label: 'Organizadores' },
    { href: '/rolezeiros', label: 'Rolezeiros' }
  ];

  const cities = [
    { code: 'POA', name: 'Porto Alegre', slug: 'porto_alegre' },
    { code: 'SP', name: 'São Paulo', slug: 'sao_paulo' },
    { code: 'RJ', name: 'Rio de Janeiro', slug: 'rio_de_janeiro' },
    { code: 'FLN', name: 'Florianópolis', slug: 'florianopolis' },
    { code: 'CWB', name: 'Curitiba', slug: 'curitiba' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, date_start, location_name, city')
        .eq('status', 'published')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(100);

      const { data: highlightsData } = await supabase
        .from('highlights')
        .select('id, title, summary, cover_url, created_at, role_text, slug')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      setEvents(eventsData || []);
      setHighlights(highlightsData || []);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setInlineSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isActive = (href: string) => {
    if (href === '/' && location.pathname === '/') return true;
    if (href === '/agenda' && location.pathname.startsWith('/agenda')) return true;
    if (href === '/perfis' && location.pathname.startsWith('/perfil')) return true;
    return location.pathname === href;
  };

  const isPerfisActive = () => {
    return location.pathname.startsWith('/perfis') || location.pathname.startsWith('/perfil') || location.pathname.startsWith('/rolezeiros');
  };

  const isCityActive = (citySlug: string) => {
    return location.pathname === `/agenda/cidade/${citySlug}`;
  };

  if (isMobile) {
    return (
      <>
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-14 min-w-0">
              {/* Logo */}
              <Link to="/" className="flex items-center flex-shrink-0">
                <img 
                  src={roleIcon} 
                  alt="ROLÊ" 
                  className="h-8 w-auto"
                />
              </Link>
              
              {/* Menu button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu"
                className="h-10 w-10 flex-shrink-0"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        <RoleMobileMenuDrawer
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          publicUser={publicUser}
          setSearchOpen={setSearchOpen}
          setShowPublicAuth={setShowPublicAuth}
        />

        <GlobalSearch
          events={events}
          highlights={highlights}
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        <PublicAuthDialog
          open={showPublicAuth}
          onOpenChange={setShowPublicAuth}
          defaultTab="signin"
        />
      </>
    );
  }

  // Desktop header - mantém design original
  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 backdrop-blur-md border-b",
        isScrolled 
          ? "bg-background/95 border-border shadow-sm" 
          : "bg-background/80 border-transparent"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src={roleIcon} 
                  alt="ROLÊ" 
                  className="h-8 w-auto"
                />
              </Link>

              <nav className="hidden lg:flex items-center space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary relative",
                      isActive(link.href) 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    )}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                ))}
                
                {/* Perfis Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary relative bg-transparent border-0 cursor-pointer",
                      isPerfisActive() 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    )}>
                      Perfis
                      <ChevronDown className="h-3 w-3" />
                      {isPerfisActive() && (
                        <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-full" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {perfisDropdownItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden md:flex items-center space-x-1">
                {cities.map((city) => (
                  <Link
                    key={city.code}
                    to={`/agenda/cidade/${city.slug}`}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105",
                      isCityActive(city.slug)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {city.code}
                  </Link>
                ))}
                <Link 
                  to="/agenda/outras-cidades" 
                  className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105 bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Outras cidades
                </Link>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="hover:bg-accent"
                  aria-label="Buscar"
                >
                  <Search className="h-4 w-4" />
                </Button>

                <NotificationTrigger />
                <ThemeToggle />

                 {publicUser ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="relative h-8 w-8 rounded-full border-0 bg-transparent cursor-pointer">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {publicUser.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Minha Conta</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {publicUser.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                       <DropdownMenuItem asChild>
                         <Link to="/profile">
                           <User className="mr-2 h-4 w-4" />
                           Perfil
                         </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                          <Link to="/meus-salvos">
                            <Heart className="mr-2 h-4 w-4" />
                            Meus Salvos
                          </Link>
                       </DropdownMenuItem>
                       <DropdownMenuItem asChild>
                          <Link to="/notificacoes">
                            <Calendar className="mr-2 h-4 w-4" />
                            Minhas Notificações
                          </Link>
                       </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={publicSignOut}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowPublicAuth(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Entrar
                  </Button>
                )}

              </div>
            </div>
          </div>
        </div>
      </header>

        <GlobalSearch
          events={events}
          highlights={highlights}
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
        />

        <PublicAuthDialog
          open={showPublicAuth}
          onOpenChange={setShowPublicAuth}
          defaultTab="signin"
        />
    </>
  );
};

export default Header;

export const HeaderGlobalSearch = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, date_start, location_name, city')
        .eq('status', 'published')
        .gte('date_start', new Date().toISOString())
        .order('date_start', { ascending: true })
        .limit(100);

      const { data: highlightsData } = await supabase
        .from('highlights')
        .select('id, title, summary, cover_url, created_at, role_text, slug')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);

      setEvents(eventsData || []);
      setHighlights(highlightsData || []);
    };

    fetchData();
  }, []);

  return (
    <GlobalSearch
      events={events}
      highlights={highlights}
      isOpen={searchOpen}
      onClose={() => setSearchOpen(false)}
    />
  );
};