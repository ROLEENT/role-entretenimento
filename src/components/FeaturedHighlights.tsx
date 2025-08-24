import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { MapPin, Calendar, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { usePublishedHighlights } from "@/hooks/usePublishedHighlights";
import { Skeleton } from "./ui/skeleton";

const FeaturedHighlights = () => {
  const { highlights, loading, error, getImageUrl, getCityDisplayName } = usePublishedHighlights(6);

  const formatEventDate = (dateString?: string | null) => {
    if (!dateString) return 'Data não informada';
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long'
      });
    } catch {
      return 'Data inválida';
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Destaques da Semana
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">Erro ao carregar destaques: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Destaques da Semana
          </h2>
          <Button variant="outline" className="rounded-full" asChild>
              <Link to="/highlights">
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
                  src={getImageUrl(highlight.image_url)}
                  alt={`${highlight.event_title} em ${highlight.venue}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.jpg';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatEventDate(highlight.event_date)}
                  </Badge>
                </div>
                {highlight.photo_credit && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="outline" className="bg-black/50 text-white text-xs">
                      {highlight.photo_credit}
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">
                    {getCityDisplayName(highlight.city)}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{highlight.like_count || 0}</span>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg mb-1">{highlight.event_title}</h3>
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span className="text-sm">{highlight.venue}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {highlight.role_text}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {highlight.selection_reasons.slice(0, 3).map((reason, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {reason}
                    </Badge>
                  ))}
                  {highlight.selection_reasons.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{highlight.selection_reasons.length - 3}
                    </Badge>
                  )}
                </div>

                <Button
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-medium rounded-full"
                  asChild
                >
                  <Link to={`/destaques/${highlight.city}`}>
                    Ver Destaque
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {highlights.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum destaque publicado no momento
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Volte em breve para ver os novos destaques da cena cultural!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedHighlights;