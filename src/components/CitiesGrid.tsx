import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { citiesData } from '@/data/citiesData';

const CitiesGrid = () => {
  const cities = Object.values(citiesData);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">CIDADES DO BRASIL</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore a cena cultural das principais cidades brasileiras
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {cities.map((city) => (
            <Link 
              key={city.id} 
              to={`/cidades/${city.id}/destaques`}
              className="group"
            >
              <Card className="h-full transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-border hover:border-primary/50">
                <CardContent className="p-6 text-center h-full flex flex-col justify-center items-center">
                  <div className="mb-4 p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {city.name}
                  </h3>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">{city.stats.totalEvents}</span> eventos
                  </div>
                  
                  <div className="text-xs text-muted-foreground/70 mt-1">
                    {city.state}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Mais cidades em breve
          </p>
        </div>
      </div>
    </section>
  );
};

export default CitiesGrid;