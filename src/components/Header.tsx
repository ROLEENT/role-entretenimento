import { Search, Menu, User } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotificationSystem from "@/components/NotificationSystem";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import roleLogo from "@/assets/role-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Início", href: "/" },
    { name: "Destaques", href: "/destaques" },
    { name: "Eventos", href: "/eventos" },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-sm border-b shadow-md" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
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

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <NotificationSystem />
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="gradient">
              Criar Evento
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
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
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Minha Conta
                  </Button>
                  <Button variant="gradient" className="w-full">
                    Criar Evento
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;