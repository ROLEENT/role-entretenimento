import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useRef } from "react";

interface CityChip {
  code: string;
  name: string;
  slug: string;
}

const cities: CityChip[] = [
  { code: 'POA', name: 'Porto Alegre', slug: 'porto-alegre' },
  { code: 'SP', name: 'São Paulo', slug: 'sao-paulo' },
  { code: 'RJ', name: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  { code: 'FLN', name: 'Florianópolis', slug: 'florianopolis' },
  { code: 'CWB', name: 'Curitiba', slug: 'curitiba' }
];

interface CityChipsProps {
  className?: string;
}

export default function CityChips({ className }: CityChipsProps) {
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);

  const isCityActive = (citySlug: string) => {
    return location.pathname === `/agenda/cidade/${citySlug}`;
  };

  return (
    <div className={cn("relative", className)}>
      {/* Left fade */}
      <div className="absolute left-0 top-0 z-10 h-full w-6 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      
      {/* Scrollable container */}
      <div 
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        style={{ 
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <nav 
          className="flex gap-2 px-6"
          aria-label="Navegação rápida por cidades"
          role="navigation"
        >
          {cities.map((city) => (
            <Link
              key={city.code}
              to={`/agenda/cidade/${city.slug}`}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "scroll-snap-align-start focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                isCityActive(city.slug)
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              aria-label={`Ver agenda de ${city.name}`}
              aria-current={isCityActive(city.slug) ? 'page' : undefined}
            >
              {city.code}
            </Link>
          ))}
          <Link 
            to="/agenda/outras-cidades" 
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              "scroll-snap-align-start focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              location.pathname === '/agenda/outras-cidades'
                ? "bg-primary text-primary-foreground"
                : "bg-background border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            aria-label="Ver outras cidades disponíveis"
            aria-current={location.pathname === '/agenda/outras-cidades' ? 'page' : undefined}
          >
            Outras cidades
          </Link>
        </nav>
      </div>

      {/* Right fade */}
      <div className="absolute right-0 top-0 z-10 h-full w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}