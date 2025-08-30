import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link } from "react-router-dom";
import { PageWrapper } from "@/components/PageWrapper";
import SEOHead from "@/components/SEOHead";

interface CityCount {
  city: string;
  count: number;
  slug: string;
}

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
};

const OutrasCidades = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const mainCities = ['POA', 'SP', 'RJ', 'FLN', 'CWB'];

  const { data: cities = [], isLoading, error } = useQuery({
    queryKey: ['outras-cidades'],
    queryFn: async (): Promise<CityCount[]> => {
      const { data, error } = await supabase
        .from('agenda_itens')
        .select('city')
        .eq('status', 'published')
        .not('city', 'in', `(${mainCities.join(',')})`)
        .is('deleted_at', null)
        .not('city', 'is', null);

      if (error) {
        console.error('Error fetching cities:', error);
        throw error;
      }

      // Group by city and count
      const cityMap = new Map<string, number>();
      data?.forEach(item => {
        if (item.city) {
          const count = cityMap.get(item.city) || 0;
          cityMap.set(item.city, count + 1);
        }
      });

      // Convert to array and add slugs
      const citiesWithCount: CityCount[] = Array.from(cityMap.entries())
        .map(([city, count]) => ({
          city,
          count,
          slug: slugify(city)
        }))
        .sort((a, b) => a.city.localeCompare(b.city, 'pt-BR'));

      return citiesWithCount;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    
    const term = searchTerm.toLowerCase();
    return cities.filter(city => 
      city.city.toLowerCase().includes(term)
    );
  }, [cities, searchTerm]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-muted-foreground">Carregando cidades...</p>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro ao carregar cidades</h1>
            <p className="text-muted-foreground">
              Ocorreu um erro ao buscar as cidades. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      <SEOHead 
        title="Outras Cidades - Agenda Cultural | ROLÊ"
        description="Explore eventos culturais em diversas cidades do Brasil além das capitais. Descubra shows, exposições, peças teatrais e experiências únicas em sua região."
        canonical="/agenda/outras-cidades"
      />
      
      <PageWrapper>
        <div className="container mx-auto px-4 py-8 pt-20">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Outras Cidades</h1>
            <p className="text-muted-foreground">
              Explore a agenda cultural em cidades além das capitais principais
            </p>
          </header>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <label htmlFor="city-search" className="sr-only">
              Buscar cidade por nome
            </label>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" aria-hidden="true" />
            <Input
              id="city-search"
              placeholder="Buscar cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Digite o nome da cidade para filtrar os resultados
            </div>
          </div>

          {/* Cities List */}
          <div 
            role="region" 
            aria-label="Lista de cidades com eventos"
            aria-live="polite"
            aria-busy={isLoading}
          >
            {filteredCities.length === 0 ? (
              <Card role="status" aria-live="polite">
                <CardContent className="text-center py-12">
                  {searchTerm ? (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Nenhuma cidade encontrada</h3>
                      <p className="text-muted-foreground">
                        Não encontramos cidades que correspondam à sua busca por "{searchTerm}".
                      </p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Nenhuma cidade disponível</h3>
                      <p className="text-muted-foreground">
                        No momento não há eventos publicados em outras cidades.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3" role="list">
                {filteredCities.map((city) => (
                  <article key={city.city} role="listitem">
                    <Link
                      to={`/agenda/cidade/${city.slug}`}
                      className="block group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                      aria-label={`Ver agenda de ${city.city} - ${city.count} ${city.count === 1 ? 'evento' : 'eventos'}`}
                    >
                      <Card className="transition-all duration-200 group-hover:shadow-md group-hover:-translate-y-0.5">
                        <CardContent className="flex items-center justify-between py-4">
                          <span className="font-medium group-hover:text-primary transition-colors">
                            {city.city}
                          </span>
                          <span className="text-sm text-muted-foreground" aria-label={`${city.count} ${city.count === 1 ? 'evento' : 'eventos'}`}>
                            {city.count} {city.count === 1 ? 'evento' : 'eventos'}
                          </span>
                        </CardContent>
                      </Card>
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredCities.length > 0 && (
            <div className="mt-8 text-sm text-muted-foreground text-center" role="status" aria-live="polite">
              {searchTerm ? (
                <>Mostrando {filteredCities.length} {filteredCities.length === 1 ? 'cidade' : 'cidades'} para "{searchTerm}"</>
              ) : (
                <>Total: {cities.length} {cities.length === 1 ? 'cidade' : 'cidades'} com eventos</>
              )}
            </div>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default OutrasCidades;