import { Search, Menu, User, Heart, LogOut, Calendar } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationSettings } from "@/components/NotificationSettings";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import roleIcon from "@/assets/role-logo.png";
import { useAuth } from "@/hooks/useAuth";
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

// Header mobile 2 linhas com carrossel de cidades
const Header = () => {
  const location = useLocation();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inlineSearchOpen, setInlineSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);

  const navLinks = [
    { href: '/agenda', label: 'Agenda' },
    { href: '/destaques', label: 'Destaques' },
    { href: '/revista', label: 'Revista' },
    { href: '/cidades', label: 'Cidades' }
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
        .from('agenda')
        .select('id, title, start_at, venue_name, city')
        .eq('is_published', true)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(100);

      const { data: highlightsData } = await supabase
        .from('highlights')
        .select('id, title, excerpt, cover_url, published_at, author, slug')
        .eq('status', 'publicado')
        .order('published_at', { ascending: false })
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
    if (href === '/agenda' && location.pathname.startsWith('/agenda')) return true;
    return location.pathname === href;
  };

  const isCityActive = (citySlug: string) => {
    return location.pathname === `/agenda/cidade/${citySlug}`;
  };

  if (isMobile) {
    return (
      <>
        <header className="mobile-header">
          {/* Linha 1: Logo + Ícones */}
          <div className="mobile-header-top">
            <Link to="/" className="mobile-logo">
              <img 
                src={roleIcon} 
                alt="ROLÊ" 
                className="h-8 w-auto"
              />
            </Link>
            
            <div className="mobile-header-actions">
              <Button
                variant="ghost"
                size="icon"
                className="mobile-action-button"
                onClick={() => setSearchOpen(true)}
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <NotificationSettings />
              <ThemeToggle />
              
              {user ? (
                <Link to="/profile" className="mobile-action-button">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mobile-action-button"
                >
                  <Link to="/auth">Entrar</Link>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="mobile-action-button"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Linha 2: Barra de Cidades */}
          <div className="mobile-citybar-wrap">
            <nav className="mobile-citybar" aria-label="Filtrar por cidade">
              {cities.map((city) => (
                <Link
                  key={city.code}
                  to={`/agenda/cidade/${city.slug}`}
                  className={`mobile-city-pill ${isCityActive(city.slug) ? 'active' : ''}`}
                >
                  {city.code}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* Menu Mobile */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <nav className="space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`block py-3 px-2 text-lg font-medium transition-colors rounded-md ${
                      isActive(link.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        <GlobalSearch
          events={events}
          highlights={highlights}
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
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
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </Link>
                ))}
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

                <NotificationSettings />
                <ThemeToggle />

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">Perfil</p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
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
                        <Link to="/calendar">
                          <Calendar className="mr-2 h-4 w-4" />
                          Meu Calendário
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/auth">Entrar</Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hover:bg-accent"
                  aria-label="Favoritos"
                >
                  <Link to="/favorites">
                    <Heart className="h-4 w-4" />
                  </Link>
                </Button>
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
        .from('agenda')
        .select('id, title, start_at, venue_name, city')
        .eq('is_published', true)
        .gte('start_at', new Date().toISOString())
        .order('start_at', { ascending: true })
        .limit(100);

      const { data: highlightsData } = await supabase
        .from('highlights')
        .select('id, title, excerpt, cover_url, published_at, author, slug')
        .eq('status', 'publicado')
        .order('published_at', { ascending: false })
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