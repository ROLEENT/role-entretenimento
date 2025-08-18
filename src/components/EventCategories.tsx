import { Music, Drama, PartyPopper, Wine, Palette } from "lucide-react";
import { Button } from "./ui/button";

const EventCategories = () => {
  const categories = [
    {
      icon: Music,
      name: "Shows",
      color: "from-purple-500 to-purple-700",
      href: "#shows"
    },
    {
      icon: Drama,
      name: "Teatro", 
      color: "from-blue-500 to-blue-700",
      href: "#teatro"
    },
    {
      icon: PartyPopper,
      name: "Festas",
      color: "from-teal-500 to-teal-700", 
      href: "#festas"
    },
    {
      icon: Wine,
      name: "Bares",
      color: "from-orange-500 to-orange-700",
      href: "#bares"
    },
    {
      icon: Palette,
      name: "Arte",
      color: "from-pink-500 to-pink-700",
      href: "#arte"
    }
  ];

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
          Categorias de Eventos
        </h2>
        <div className="flex flex-wrap justify-center gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Button
                key={category.name}
                variant="ghost"
                className="flex flex-col items-center space-y-3 p-6 h-auto hover:shadow-elevated transition-all duration-300 group"
                asChild
              >
                <a href={category.href}>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </span>
                </a>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EventCategories;