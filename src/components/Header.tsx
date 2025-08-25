import { Search, Menu, User, Heart } from "lucide-react";
import { useResponsive } from "@/hooks/useResponsive";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationSystem from "@/components/NotificationSystem";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import roleLogo from "@/assets/role-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

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
    { name: "Eventos", href: "/eventos" },
    { name: "Destaques", href: "/destaques" },
    { name: "Grupos", href: "/grupos" },
    { name: "Música", href: "/musica" },
    { name: "Meu Calendário", href: "/calendario" },
    { name: "Conquistas", href: "/conquistas" },
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-sm border-b shadow-md" 
          : "bg-transparent"
      }`}
      style={{ margin: '0', padding: '0' }}
    >
      <div className="container mx-auto mobile-container">
        <div className="flex items-center justify-between h-16 min-h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src={roleLogo} 
              alt="ROLÊ Logo" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSearchOpen(true)}
              className={`touch-target ${isMobile ? 'h-10 w-10' : ''}`}
            >
              <Search className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
            </Button>
            <div className="hidden md:flex items-center space-x-4">
              <NotificationSystem />
              <ThemeToggle />
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/feed')}
                  className="text-foreground hover:text-red-500"
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" asChild>
                <Link to={user ? "/perfil" : "/auth"}>
                  <User className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/admin/login">
                  Área do Admin
                </Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="touch-target h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <Link to="/">
                    <img 
                      src={roleLogo} 
                      alt="ROLÊ Logo" 
                      className="h-8 w-auto"
                    />
                  </Link>
                  <ThemeToggle />
                </div>
                
                <nav className="flex-1 py-8">
                  <div className="space-y-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="border-t pt-6 space-y-4">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link to="/perfil">
                      <User className="h-4 w-4 mr-2" />
                      Minha Conta
                    </Link>
                  </Button>
                  <Button variant="gradient" className="w-full" asChild>
                    <Link to="/admin/login">
                      Área do Admin
                    </Link>
                  </Button>
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