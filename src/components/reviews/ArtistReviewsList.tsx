import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/ui/star-rating';
import { Progress } from '@/components/ui/progress';
import { useArtistReview } from '@/hooks/useArtistReview';
import { MessageCircle, Star, TrendingUp } from 'lucide-react';

interface ArtistReviewsListProps {
  profileUserId: string;
  artistName?: string;
}

export function ArtistReviewsList({ profileUserId, artistName = "artista" }: ArtistReviewsListProps) {
  const { reviews, stats, loading } = useArtistReview(profileUserId);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 bg-muted rounded w-16"></div>
                    <div className="flex-1 h-2 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            Avaliações de {artistName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Ainda não há avaliações para este artista.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Seja o primeiro a avaliar!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Estatísticas das Avaliações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Média Geral */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.average}</div>
              <StarRating rating={stats.average} readonly size="sm" />
              <div className="text-sm text-muted-foreground mt-1">
                {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
              </div>
            </div>
            
            {/* Distribuição por Estrelas */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating] || 0;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1 w-12">
                      <span>{rating}</span>
                      <Star className="h-3 w-3 fill-current text-yellow-400" />
                    </div>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="w-8 text-right text-muted-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Avaliações dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      <Star className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">Usuário</span>
                        <StarRating rating={review.rating} readonly size="sm" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {review.comment && (
                      <p className="text-sm leading-relaxed text-foreground">
                        {review.comment}
                      </p>
                    )}
                    
                    {review.created_at !== review.updated_at && (
                      <p className="text-xs text-muted-foreground">
                        Editada em {new Date(review.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}