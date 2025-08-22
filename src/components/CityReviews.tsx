import { useState } from 'react';
import { Star, User, ThumbsUp, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Review {
  id: string;
  user: {
    name: string;
    avatar?: string;
    verified: boolean;
    totalReviews: number;
  };
  rating: number;
  date: string;
  title: string;
  content: string;
  likes: number;
  category: 'Vida Noturna' | 'Eventos' | 'Venues' | 'Segurança' | 'Transporte';
  helpful: boolean;
}

interface CityReviewsProps {
  cityName: string;
  overallRating: number;
  totalReviews: number;
}

const CityReviews = ({ cityName, overallRating, totalReviews }: CityReviewsProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const reviews: Review[] = [
    {
      id: '1',
      user: {
        name: 'Marina Silva',
        avatar: '/api/placeholder/40/40',
        verified: true,
        totalReviews: 23
      },
      rating: 5,
      date: '2024-08-15',
      title: 'Cena incrível!',
      content: 'A vida noturna de São Paulo é incomparável. Variedade incrível de eventos e sempre rola algo diferente. Os venues são top e a galera é receptiva.',
      likes: 42,
      category: 'Vida Noturna',
      helpful: false
    },
    {
      id: '2',
      user: {
        name: 'Carlos Mendes',
        avatar: '/api/placeholder/40/40',
        verified: false,
        totalReviews: 8
      },
      rating: 4,
      date: '2024-08-10',
      title: 'Eventos de qualidade',
      content: 'Frequento os eventos há anos e a qualidade só melhora. Sound systems excelentes e lineup sempre surpreende. Único ponto negativo é o trânsito.',
      likes: 28,
      category: 'Eventos',
      helpful: true
    },
    {
      id: '3',
      user: {
        name: 'Ana Costa',
        avatar: '/api/placeholder/40/40',
        verified: true,
        totalReviews: 15
      },
      rating: 5,
      date: '2024-08-05',
      title: 'Diversidade musical',
      content: 'O que mais amo é a diversidade. Num final de semana você encontra desde techno até funk, passando por rock e jazz. Cidade cultural rica!',
      likes: 35,
      category: 'Vida Noturna',
      helpful: false
    }
  ];

  const categories = ['Todos', 'Vida Noturna', 'Eventos', 'Venues', 'Segurança', 'Transporte'];

  const ratingDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 25 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 }
  ];

  const filteredReviews = selectedCategory === 'Todos' 
    ? reviews 
    : reviews.filter(review => review.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Reviews da Cena de {cityName}
          </h2>
          <p className="text-muted-foreground">
            O que a galera está falando sobre a vida noturna da cidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Avaliação Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {overallRating}
                  </div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i}
                        className={`h-5 w-5 ${
                          i < Math.floor(overallRating) 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-muted-foreground'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-muted-foreground">
                    {totalReviews} avaliações
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {ratingDistribution.map((item) => (
                    <div key={item.stars} className="flex items-center gap-2">
                      <div className="flex items-center gap-1 w-12">
                        <span className="text-sm">{item.stars}</span>
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-6" variant="outline">
                  Escrever Review
                </Button>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Filtrar por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.user.avatar} alt={review.user.name} />
                        <AvatarFallback>
                          {review.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{review.user.name}</h4>
                          {review.user.verified && (
                            <Badge variant="secondary" className="text-xs">
                              Verificado
                            </Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            • {review.user.totalReviews} reviews
                          </span>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-yellow-400' 
                                    : 'text-muted-foreground'
                                }`}
                              />
                            ))}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.date)}
                          </span>
                        </div>

                        <h5 className="font-medium mb-2">{review.title}</h5>
                        <p className="text-muted-foreground mb-4">
                          {review.content}
                        </p>

                        <div className="flex items-center gap-4">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <ThumbsUp className="h-4 w-4" />
                            Útil ({review.likes})
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Responder
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline">
                Carregar Mais Reviews
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CityReviews;