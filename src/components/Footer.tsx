import { Instagram, Youtube, Music2 } from "lucide-react";
import { Button } from "./ui/button";
import roleLogo from "@/assets/role-logo.png";

const Footer = () => {
  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/role.ent", label: "Instagram" },
    { icon: Music2, href: "https://tiktok.com/@role.ent", label: "TikTok" },
    { icon: Youtube, href: "https://www.youtube.com/@roleent", label: "YouTube" },
  ];

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Revista", href: "/editorial" },
    { name: "Vitrine Cultural", href: "/vitrine" },
    { name: "Destaques", href: "/destaques" }
  ];

  const categories = [
    { name: "Shows", href: "/categorias/shows" },
    { name: "Festas", href: "/categorias/festas" },
    { name: "Teatro", href: "/categorias/teatro" },
    { name: "Arte", href: "/categorias/arte" },
    { name: "Cultura Noturna", href: "/categorias/cultura-noturna" }
  ];

  const legalLinks = [
    { name: "Política de Privacidade", href: "/politica.html" },
    { name: "Termos para Rolezeiro", href: "/termos-usuario.html" },
    { name: "Termos para Organizador", href: "/termos-organizador.html" },
    { name: "Política Antispam", href: "/politica-spam.html" },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <img 
              src={roleLogo} 
              alt="ROLÊ" 
              className="h-10 w-auto"
            />
            <p className="text-background/80 text-sm leading-relaxed">
              Curadoria independente de eventos, cultura e experiências.
              Vivemos a cena pra te mostrar o que realmente importa.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-background/80 hover:text-primary hover:bg-background/10"
                    asChild
                  >
                    <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                      <IconComponent className="h-4 w-4" />
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-background mb-4">Navegação</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-background/80 hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-background mb-4">Categorias</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <a
                    href={category.href}
                    className="text-background/80 hover:text-primary transition-colors text-sm"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-background mb-4">Fique por dentro</h3>
            <p className="text-background/80 text-sm mb-4">
              Receba as melhores dicas de eventos e cultura na sua cidade.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-3 py-2 rounded-lg bg-background/10 border border-background/20 text-background placeholder:text-background/60 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="w-full bg-gradient-primary hover:opacity-90 text-white rounded-lg">
                Inscrever-se
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 text-center space-y-2">
          <p className="text-background/60 text-sm">
            © 2025 ROLÊ Entretenimento. Todos os direitos reservados.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {legalLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-background/60 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
