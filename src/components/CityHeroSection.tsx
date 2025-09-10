import { Star, MapPin, Calendar, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CityData } from '@/data/citiesData';

interface CityHeroSectionProps {
  city: CityData;
}

const CityHeroSection = ({ city }: CityHeroSectionProps) => {
  return (
    <section className="relative min-h-[60vh] flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${city.image})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-foreground/80 text-sm mb-4">
            <span>Destaques</span>
            <span>•</span>
            <span>{city.state}</span>
            <span>•</span>
            <span className="text-foreground font-medium">{city.name}</span>
          </div>

          {/* Title and Description */}
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            {city.name}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-6 max-w-2xl">
            {city.description}
          </p>

          {/* Music Style Badge */}
          <div className="mb-8">
            <Badge variant="secondary" className="bg-foreground/20 text-foreground border-foreground/30 px-4 py-2 text-sm">
              {city.scene.musicStyle}
            </Badge>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-foreground/10 backdrop-blur-sm border-foreground/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {city.stats.totalEvents}
                </div>
                <div className="text-foreground/80 text-sm">
                  Eventos Totais
                </div>
              </CardContent>
            </Card>

            <Card className="bg-foreground/10 backdrop-blur-sm border-foreground/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {city.stats.monthlyEvents}
                </div>
                <div className="text-foreground/80 text-sm">
                  Este Mês
                </div>
              </CardContent>
            </Card>

            <Card className="bg-foreground/10 backdrop-blur-sm border-foreground/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-5 w-5 text-foreground" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {city.stats.venues}
                </div>
                <div className="text-foreground/80 text-sm">
                  Venues Ativos
                </div>
              </CardContent>
            </Card>

            <Card className="bg-foreground/10 backdrop-blur-sm border-foreground/20">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-5 w-5 text-foreground fill-current" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {city.stats.rating}
                </div>
                <div className="text-foreground/80 text-sm">
                  {city.stats.reviews} reviews
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Popular Genres */}
          <div className="mt-8">
            <h3 className="text-foreground text-lg font-semibold mb-3">Gêneros Populares</h3>
            <div className="flex flex-wrap gap-2">
              {city.scene.genres.map((genre) => (
                <Badge 
                  key={genre}
                  variant="outline" 
                  className="bg-transparent border-foreground/30 text-foreground hover:bg-foreground/10"
                >
                  {genre}
                </Badge>
              ))}
            </div>
          </div>

          {/* Nightlife Score */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="text-foreground/80">Vida Noturna:</span>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold text-foreground">
                  {city.scene.nightlifeScore}
                </div>
                <div className="text-foreground/60">/10</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(city.scene.nightlifeScore / 2) 
                          ? 'text-accent fill-accent' 
                          : 'text-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityHeroSection;