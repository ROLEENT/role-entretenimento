import { Search, Menu, User, Heart, X, ChevronDown } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationSystem from "@/components/NotificationSystem";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import roleLogo from "@/assets/role-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { cityToSlug, labelFromName } from "@/lib/cityToSlug";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [inlineSearchOpen, setInlineSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cities = [
    { code: "POA", name: "Porto Alegre" },
    { code: "SP", name: "São Paulo" },
    { code: "RJ", name: "Rio de Janeiro" },
    { code: "Floripa", name: "Florianópolis" },
    { code: "Curitiba", name: "Curitiba" }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Load search data
    const loadSearchData = async () => {
      try {
        const [eventsRes, highlightsRes] = await Promise.all([
          supabase.from('events').select('*, venue:venues(name), categories:event_categories(category:categories(*))').eq('status', 'active').limit(20),
          supabase.from('highlights').select('*').eq('is_published', true).limit(10)
        ]);
        
        if (eventsRes.data) setEvents(eventsRes.data);
        if (highlightsRes.data) setHighlights(highlightsRes.data);
      } catch (error) {
        console.error('Error loading search data:', error);
      }
    };
    
    loadSearchData();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Agenda", href: "/agenda" },
    { name: "Revista", href: "/revista" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  // Keyboard and accessibility handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inlineSearchOpen) {
        setInlineSearchOpen(false);
        setSearchTerm("");
      }
    };

    if (inlineSearchOpen) {
      document.addEventListener("keydown", handleKeyDown);
      searchInputRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [inlineSearchOpen]);

  const handleSearchIconClick = () => {
    if (inlineSearchOpen) {
      setInlineSearchOpen(false);
      setSearchTerm("");
    } else {
      setInlineSearchOpen(true);
    }
  };

  const handleInlineSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/agenda?search=${encodeURIComponent(searchTerm.trim())}`);
      setInlineSearchOpen(false);
      setSearchTerm("");
    }
  };

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  const isCityActive = (citySlug: string) => {
    return location.pathname === `/agenda/cidade/${citySlug}`;
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b shadow-lg' 
          : 'bg-background/80 backdrop-blur-sm border-b border-border/50'
      } ${isMobile ? 'mobile-header' : ''}`}
      style={{ margin: '0', padding: '0' }}
    >
      <div className={`container mx-auto ${isMobile ? 'mobile-header-content' : 'mobile-container'}`}>
        <div className="flex items-center justify-between h-16 min-h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
          >
            <img 
              src={roleLogo} 
              alt="ROLÊ Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" role="navigation" aria-label="Navegação principal">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    active
                      ? 'text-primary bg-primary/10 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-0.5 after:bg-primary after:rounded-full'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop City Pills */}
          <div className="hidden md:flex items-center space-x-1">
            {cities.map((city) => {
              const slug = cityToSlug(city.name);
              const active = isCityActive(slug);
              return (
                <Link
                  key={city.code}
                  to={`/agenda/cidade/${slug}`}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-accent/50 text-muted-foreground hover:bg-primary/20 hover:text-primary'
                  }`}
                >
                  {labelFromName(city.name)}
                </Link>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            {/* Inline Search */}
            <div className="relative flex items-center">
              {inlineSearchOpen ? (
                <form onSubmit={handleInlineSearch} className="flex items-center space-x-2">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64 h-9 text-sm"
                    aria-label="Campo de busca"
                  />
                  <Button 
                    type="button"
                    variant="ghost" 
                    size="sm"
                    onClick={() => setInlineSearchOpen(false)}
                    className="h-9 w-9 p-0"
                    aria-label="Fechar busca"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleSearchIconClick}
                  className="h-9 w-9 p-0"
                  aria-label="Abrir busca"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </div>

            <NotificationSystem />
            <ThemeToggle />
            
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/feed')}
                className="text-foreground hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                aria-label="Ir para feed de atividades"
              >
                <Heart className="h-4 w-4" />
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            >
              <Link to={user ? "/perfil" : "/auth"} aria-label={user ? "Ir para perfil" : "Fazer login"}>
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            {/* Mobile City Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                >
                  Cidades
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-background/95 backdrop-blur-md border">
                {cities.map((city) => {
                  const slug = cityToSlug(city.name);
                  const active = isCityActive(slug);
                  return (
                    <DropdownMenuItem key={city.code} asChild>
                      <Link
                        to={`/agenda/cidade/${slug}`}
                        className={`text-sm w-full ${
                          active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-foreground hover:bg-primary/5'
                        }`}
                      >
                        {city.name}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Profile Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              asChild
              className="h-9 w-9 p-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            >
              <Link to={user ? "/perfil" : "/auth"} aria-label={user ? "Ir para perfil" : "Fazer login"}>
                <User className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="touch-target h-10 w-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
                aria-label="Abrir menu"
                aria-expanded={mobileMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80" aria-label="Menu de navegação">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <Link 
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  >
                    <img 
                      src={roleLogo} 
                      alt="ROLÊ Logo" 
                      className="h-8 w-auto"
                    />
                  </Link>
                  <ThemeToggle />
                </div>
                
                {/* Mobile Search */}
                <div className="py-4 border-b">
                  <form onSubmit={handleInlineSearch} className="flex items-center space-x-2">
                    <Input
                      type="text"
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                      aria-label="Campo de busca mobile"
                    />
                    <Button type="submit" size="sm" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                
                {/* User Account */}
                <div className="py-4 border-b">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md" 
                    asChild
                  >
                    <Link 
                      to={user ? "/perfil" : "/auth"} 
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user ? "Minha Conta" : "Entrar"}
                    </Link>
                  </Button>
                </div>
                
                {/* Navigation */}
                <div className="flex-1 overflow-y-auto">
                  <nav className="py-8" role="navigation" aria-label="Navegação mobile">
                    <div className="space-y-4">
                      {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-current={active ? "page" : undefined}
                            className={`block text-lg font-medium transition-colors px-6 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                              active
                                ? 'text-primary bg-primary/10'
                                : (item.name === 'Agenda' || item.name === 'Revista')
                                ? 'text-primary bg-primary/5 border border-primary/20'
                                : 'text-foreground hover:text-primary hover:bg-muted'
                            }`}
                          >
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      
      <GlobalSearch 
        events={events}
        highlights={highlights}
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </header>
  );
};

export default Header;