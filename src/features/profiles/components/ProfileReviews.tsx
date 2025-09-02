import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare } from "lucide-react";
import { useProfileReviews, useProfileReviewsStats } from "../hooks/useProfileReviews";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileReviewsProps {
  profileUserId: string;
}

export function ProfileReviews({ profileUserId }: ProfileReviewsProps) {
  const { data: reviews, isLoading: reviewsLoading } = useProfileReviews(profileUserId);
  const { data: stats, isLoading: statsLoading } = useProfileReviewsStats(profileUserId);

  if (reviewsLoading || statsLoading) {
    return <ProfileContentSkeleton type="reviews" />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">Primeiras Impressões</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Este artista ainda não recebeu avaliações. Seja o primeiro a compartilhar 
              sua experiência e ajudar outros fãs a descobrirem este talento!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="bg-background/50">
                <Star className="w-4 h-4 mr-2" />
                Deixar avaliação
              </Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Conhecer o trabalho
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas de Avaliações */}
      {stats && stats.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resumo das Avaliações</h3>
              <Badge variant="secondary">
                {stats.total} {stats.total === 1 ? 'avaliação' : 'avaliações'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold">{stats.average}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(stats.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Distribuição de Estrelas */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-8">{rating}★</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{
                        width: stats.total > 0 
                          ? `${(stats.distribution[rating as keyof typeof stats.distribution] / stats.total) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">
                    {stats.distribution[rating as keyof typeof stats.distribution]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Avaliações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Avaliações</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage 
                    src={review.reviewer_profile?.avatar_url} 
                    alt={review.reviewer_profile?.name}
                  />
                  <AvatarFallback>
                    {review.reviewer_profile?.name?.charAt(0)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {review.reviewer_profile?.name || 'Usuário'}
                      </span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "d 'de' MMM, yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}