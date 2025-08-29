import { Instagram, Youtube, Music2, Facebook, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Link } from "react-router-dom";
import roleLogo from "@/assets/role-logo.png";
import { useResponsive } from "@/hooks/useResponsive";

const Footer = () => {
  const { isMobile } = useResponsive();

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/role.ent", label: "Instagram" },
    { icon: Music2, href: "https://tiktok.com/@role.ent", label: "TikTok" },
    { icon: Youtube, href: "https://www.youtube.com/@roleent", label: "YouTube" },
    { icon: Facebook, href: "https://facebook.com/roleent", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com/role_ent", label: "Twitter" },
  ];

  // Institucional column
  const institucionalLinks = [
    { name: "Sobre", href: "/sobre" },
    { name: "Contato", href: "/contato" },
    { name: "Parcerias", href: "/parcerias" },
    { name: "Trabalhe Conosco", href: "/carreiras" },
    { name: "Imprensa", href: "/imprensa" }
  ];

  // Categorias column
  const categoriesLinks = [
    { name: "Agenda", href: "/agenda" },
    { name: "Vitrine Cultural", href: "/eventos" },
    { name: "Editorial", href: "/destaques" },
    { name: "Shows & Música", href: "/eventos?category=shows" },
    { name: "Teatro & Arte", href: "/eventos?category=teatro" }
  ];

  // Legal links for bottom section
  const legalLinks = [
    { name: "Política de Privacidade", href: "/politica-privacidade" },
    { name: "Termos de Uso", href: "/termos-usuario" },
    { name: "Política Antispam", href: "/politica-spam" }
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        {/* Brand Section */}
        <div className="mb-12 text-center">
          <Link to="/" className="inline-block mb-6">
            <img 
              src={roleLogo} 
              alt="ROLÊ" 
              className="h-12 w-auto mx-auto"
            />
          </Link>
          <p className="text-background/80 text-base max-w-2xl mx-auto leading-relaxed">
            Curadoria independente de eventos, cultura e experiências.
            <br />
            Vivemos a cena pra te mostrar o que realmente importa.
          </p>
        </div>

        {/* 3 Columns Section */}
        <div className={`grid ${isMobile ? 'grid-cols-1 gap-12' : 'md:grid-cols-3 gap-16'} mb-12`}>
          {/* Institucional */}
          <div>
            <h3 className="font-bold text-background text-lg mb-6">
              Institucional
            </h3>
            <ul className="space-y-4">
              {institucionalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-background/80 hover:text-primary transition-colors text-sm min-h-[14px] leading-relaxed font-medium"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categorias */}
          <div>
            <h3 className="font-bold text-background text-lg mb-6">
              Categorias
            </h3>
            <ul className="space-y-4">
              {categoriesLinks.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.href}
                    className="text-background/80 hover:text-primary transition-colors text-sm min-h-[14px] leading-relaxed font-medium"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Fique por dentro */}
          <div>
            <h3 className="font-bold text-background text-lg mb-6">
              Fique por dentro
            </h3>
            <p className="text-background/80 text-sm mb-6 leading-relaxed">
              Receba as melhores dicas de eventos e cultura na sua cidade.
            </p>
            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Digite seu email"
                className="w-full px-4 py-3 rounded-lg bg-background/10 border border-background/30 text-background placeholder:text-background/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
              />
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 font-semibold text-sm">
                Quero receber
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Social Media and Legal Links */}
        <div className="border-t border-background/20 pt-8">
          <div className={`flex ${isMobile ? 'flex-col gap-6' : 'items-center justify-between'} mb-6`}>
            {/* Social Media */}
            <div className={`${isMobile ? 'text-center' : ''}`}>
              <h4 className="font-semibold text-background text-sm mb-4">Siga nas redes sociais</h4>
              <div className="flex justify-center gap-3">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Button
                      key={social.label}
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-background/80 hover:text-primary hover:bg-background/10 rounded-full"
                      asChild
                    >
                      <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                        <IconComponent className="h-5 w-5" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Legal Links */}
            <div className={`${isMobile ? 'text-center' : 'text-right'}`}>
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                {legalLinks.map((link, index) => (
                  <span key={link.name} className="flex items-center">
                    <Link 
                      to={link.href} 
                      className="text-background/70 hover:text-primary transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                    {index < legalLinks.length - 1 && (
                      <span className="ml-6 text-background/40">|</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-6 border-t border-background/10">
            <p className="text-background/60 text-sm">
              © 2025 ROLÊ Entretenimento. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;