import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Star, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getCitiesWithPosts, getLatestPostByCity } from "@/data/blogData";
import { citiesData } from "@/data/citiesData";
import cityPlaceholder from "@/assets/city-placeholder.jpg";

const FeaturedHighlights = () => {
  const citiesWithPosts = getCitiesWithPosts();
  
  const highlights = citiesWithPosts.map(citySlug => {
    const cityData = citiesData[citySlug];
    const latestPost = getLatestPostByCity(citySlug);
    
    if (!cityData || !latestPost) return null;
    
    return {
      id: citySlug,
      city: cityData.name,
      citySlug: citySlug,
      description: cityData.description,
      state: cityData.state,
      events: cityData.stats.monthlyEvents,
      rating: cityData.stats.rating,
      date: latestPost.weekRange,
      image: cityData.image,
      title: latestPost.title,
      href: `/destaques/${citySlug}`
    };
  }).filter(Boolean);

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Destaques da Semana
          </h2>
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/destaques">
              Ver todos os destaques
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {highlights.map((highlight) => (
            <Card
              key={highlight.id}
              className="group overflow-hidden bg-gradient-card hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 border-0"
            >
              <div className="relative overflow-hidden">
                <img
                  src={highlight.image}
                  alt={`Cena cultural de ${highlight.city}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = cityPlaceholder;
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {highlight.date}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {highlight.city}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{highlight.rating}</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{highlight.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {highlight.state}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    🎸 {highlight.events} eventos mensais
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium rounded-full"
                  asChild
                >
                  <Link to={highlight.href}>
                    Ler Destaques
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedHighlights;