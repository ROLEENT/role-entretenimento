import { Link } from "react-router-dom";
import { cityNameToSlug } from "@/lib/cityToSlug";

interface City {
  slug: string;
  name: string;
  count: number | null;
}

// TODO: Replace with real Supabase aggregator counting events for next 7 days
async function getCities(): Promise<City[]> {
  return [
    { slug: "porto-alegre", name: "Porto Alegre", count: 42 },
    { slug: "sao-paulo", name: "São Paulo", count: 120 },
    { slug: "rio-de-janeiro", name: "Rio de Janeiro", count: 88 },
    { slug: "florianopolis", name: "Florianópolis", count: 15 },
    { slug: "curitiba", name: "Curitiba", count: 27 },
    { slug: "outras-cidades", name: "Outras cidades", count: 0 },
  ];
}

const AgendaPorCidadeHome = () => {
  // Use static data for now to eliminate loading/flickering
  const cities = [
    { slug: "porto-alegre", name: "Porto Alegre", count: 42 },
    { slug: "sao-paulo", name: "São Paulo", count: 120 },
    { slug: "rio-de-janeiro", name: "Rio de Janeiro", count: 88 },
    { slug: "florianopolis", name: "Florianópolis", count: 15 },
    { slug: "curitiba", name: "Curitiba", count: 27 },
    { slug: "outras-cidades", name: "Outras cidades", count: 0 },
  ];

  const CHIPS = ["porto-alegre", "sao-paulo", "rio-de-janeiro", "florianopolis", "curitiba", "outras-cidades"];
  const chips = cities.filter(c => CHIPS.includes(c.slug));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <header className="mb-8 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
          Agenda por cidade
        </h2>
        <p className="mt-2 text-muted-foreground text-lg">
          Acompanhe os principais eventos por região.
        </p>
      </header>

      {/* City Chips */}
      <div className="mx-auto mb-8 flex w-full max-w-4xl flex-wrap items-center justify-center gap-3">
        {chips.map((city) => (
          <Link
            key={city.slug}
            to={`/agenda/cidade/${city.slug}`}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm transition-all duration-200"
            aria-label={`Ver agenda de ${city.name}`}
          >
            {city.name}
          </Link>
        ))}
      </div>

      {/* City Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cities.map((city) => (
          <Link
            key={city.slug}
            to={`/agenda/cidade/${city.slug}`}
            className="group relative block rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:shadow-md hover:border-primary/30"
          >
            {/* Fixed height container to prevent layout shift */}
            <div className="h-28 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors">
                  {city.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {typeof city.count === "number"
                    ? (city.count > 0 ? `${city.count} eventos nesta semana` : "Em breve")
                    : "Carregando…"}
                </p>
              </div>
              
              <div className="text-sm font-medium text-muted-foreground opacity-70 group-hover:opacity-100 group-hover:text-primary transition-all">
                Ver agenda →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View All Cities Link */}
      <div className="mt-10 text-center">
        <Link
          to="/cidades"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-sm transition-all duration-200"
        >
          Ver todas as cidades
        </Link>
      </div>
    </section>
  );
};

export default AgendaPorCidadeHome;