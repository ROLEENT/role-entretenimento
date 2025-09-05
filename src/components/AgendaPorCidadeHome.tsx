import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CityChips from "./CityChips";

interface City {
  slug: string;
  name: string;
  count: number | null;
}

const AgendaPorCidadeHome = () => {
  const [cities, setCities] = useState<City[]>([
    { slug: "porto_alegre", name: "Porto Alegre", count: null },
    { slug: "sao_paulo", name: "São Paulo", count: null },
    { slug: "rio_de_janeiro", name: "Rio de Janeiro", count: null },
    { slug: "florianopolis", name: "Florianópolis", count: null },
    { slug: "curitiba", name: "Curitiba", count: null },
    { slug: "outras-cidades", name: "Outras cidades", count: null },
  ]);

  useEffect(() => {
    const fetchCityCounts = async () => {
      console.log('🏘️ AgendaPorCidadeHome: Fetching city counts');
      
      try {
        // Get today's date at 00:00:00 to include current day events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get next 7 days for "this week" filter
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from('events')
          .select('city')
          .eq('status', 'published')
          .gte('date_start', today.toISOString())
          .lte('date_start', nextWeek.toISOString());

        if (error) {
          console.error('❌ AgendaPorCidadeHome fetch error:', error);
          return;
        }

        console.log('✅ AgendaPorCidadeHome: Found', data?.length || 0, 'total events');

        // Count events by city
        const cityCount: Record<string, number> = {};
        (data || []).forEach((item) => {
          if (item.city) {
            cityCount[item.city] = (cityCount[item.city] || 0) + 1;
          }
        });

        console.log('🏘️ City counts:', cityCount);

        // Update cities with real counts
        setCities(prevCities => 
          prevCities.map(city => {
            let realCount = 0;
            
            // Map city names to database city values
            switch (city.slug) {
              case 'porto_alegre':
                realCount = cityCount['Porto Alegre'] || 0;
                break;
              case 'sao_paulo':
                realCount = cityCount['São Paulo'] || 0;
                break;
              case 'rio_de_janeiro':
                realCount = cityCount['Rio de Janeiro'] || 0;
                break;
              case 'florianopolis':
                realCount = cityCount['Florianópolis'] || 0;
                break;
              case 'curitiba':
                realCount = cityCount['Curitiba'] || 0;
                break;
              case 'outras-cidades':
                // Calculate other cities count
                const mainCitiesCount = (cityCount['Porto Alegre'] || 0) + 
                                      (cityCount['São Paulo'] || 0) + 
                                      (cityCount['Rio de Janeiro'] || 0) + 
                                      (cityCount['Florianópolis'] || 0) + 
                                      (cityCount['Curitiba'] || 0);
                const totalEvents = Object.values(cityCount).reduce((sum, count) => sum + count, 0);
                realCount = totalEvents - mainCitiesCount;
                break;
            }
            
            return { ...city, count: realCount };
          })
        );

      } catch (error) {
        console.error('❌ AgendaPorCidadeHome error:', error);
      }
    };

    fetchCityCounts();
  }, []);

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