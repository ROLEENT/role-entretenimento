import { Link } from "react-router-dom";
import CityChips from "./CityChips";
import CityCardSkeleton from "./CityCardSkeleton";

interface City {
  slug: string;
  name: string;
  count: number | null;
}

const AgendaPorCidadeHome = () => {
  // Use static data for now to eliminate loading/flickering
  const cities = [
    { slug: "porto_alegre", name: "Porto Alegre", count: 42 },
    { slug: "sao_paulo", name: "São Paulo", count: 120 },
    { slug: "rio_de_janeiro", name: "Rio de Janeiro", count: 88 },
    { slug: "florianopolis", name: "Florianópolis", count: 15 },
    { slug: "curitiba", name: "Curitiba", count: 27 },
    { slug: "outras-cidades", name: "Outras cidades", count: 0 },
  ];

  return (
    <section className="py-16 sm:py-20" aria-labelledby="agenda-por-cidade-title">
      <div className="container mx-auto px-4">
        <header className="mb-10 text-center">
          <h2 id="agenda-por-cidade-title" className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
            AGENDA POR CIDADE
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Acompanhe os principais eventos por região.
          </p>
        </header>

        {/* City Chips Navigation */}
        <div className="mb-12">
          <CityChips />
        </div>

        {/* City Cards Grid with fixed heights to prevent CLS */}
        <div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
          role="region"
          aria-label="Cards das cidades com resumo de eventos"
        >
          {cities.map((city) => (
            <article key={city.slug} className="group">
              <Link
                to={`/agenda/cidade/${city.slug}`}
                className="group relative block rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-lg hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Ver agenda completa de ${city.name}${typeof city.count === "number" && city.count > 0 ? ` - ${city.count} eventos nesta semana` : city.count === 0 ? " - sem eventos" : ""}`}
              >
                {/* Fixed height container to prevent layout shift */}
                <div className="h-32 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors mb-2">
                      {city.name}
                    </h3>
                    <p className="text-sm text-muted-foreground" aria-live="polite">
                      {typeof city.count === "number"
                        ? (city.count > 0 ? `${city.count} eventos nesta semana` : "Em breve")
                        : (
                            // Skeleton loading state with fixed height
                            <span className="inline-block w-32 h-4 bg-muted skeleton rounded" />
                          )}
                    </p>
                  </div>
                  
                  <div className="text-sm font-medium text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all flex items-center" aria-hidden="true">
                    Ver agenda →
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* View All Cities Link */}
        <div className="mt-12 text-center">
          <Link
            to="/cidades"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Ver lista completa de todas as cidades disponíveis"
          >
            Ver todas as cidades
          </Link>
        </div>
      </div>
    </section>
  );
};

export default AgendaPorCidadeHome;