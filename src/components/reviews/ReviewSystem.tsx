import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Star, MessageSquare, Send } from 'lucide-react';
import { StarRating } from '@/components/ui/star-rating';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface ReviewSystemProps {
  itemId: string;
  itemType: 'event' | 'highlight';
  reviews: Review[];
  onReviewAdded: () => void;
  loading?: boolean;
  averageRating?: number;
  onAddReview: (rating: number, comment?: string) => Promise<void>;
}

export function ReviewSystem({
  itemId,
  itemType,
  reviews,
  onReviewAdded,
  loading = false,
  averageRating,
  onAddReview
}: ReviewSystemProps) {
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { isAuthenticated } = useAuth();

  const calculatedAverage = averageRating ?? (
    reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0
  );

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast({
        title: "Erro",
        description: "Selecione uma avaliação de 1 a 5 estrelas.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await onAddReview(rating, comment.trim() || undefined);
      
      toast({
        title: "Sucesso",
        description: "Avaliação enviada com sucesso!"
      });
      
      setRating(0);
      setComment('');
      setShowForm(false);
      onReviewAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao enviar avaliação. Você já pode ter avaliado este ${itemType === 'event' ? 'evento' : 'destaque'}.`,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Avaliações ({reviews.length})
            </CardTitle>
            {reviews.length > 0 && (
              <CardDescription className="flex items-center gap-2 mt-2">
                <StarRating rating={Math.round(calculatedAverage)} readonly />
                <span>{calculatedAverage.toFixed(1)} de 5.0</span>
              </CardDescription>
            )}
          </div>
          
          {isAuthenticated && !showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="gap-2"
            >
              <Star className="w-4 h-4" />
              Avaliar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Review Form */}
        {showForm && isAuthenticated && (
          <form onSubmit={handleSubmitReview} className="space-y-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Sua avaliação
              </label>
              <StarRating 
                rating={rating} 
                interactive 
                onRatingChange={setRating}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Comentário (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Compartilhe sua experiência..."
                className="min-h-[80px]"
                disabled={submitting}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={submitting || !rating}
                className="gap-2"
                size="sm"
              >
                {submitting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Enviar Avaliação
              </Button>
              
              <Button 
                type="button"
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment('');
                }}
                size="sm"
                disabled={submitting}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {!isAuthenticated && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Faça login para avaliar este {itemType === 'event' ? 'evento' : 'destaque'}
            </p>
            <Button onClick={() => window.location.href = '/auth'}>
              Fazer Login
            </Button>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma avaliação ainda. Seja o primeiro a avaliar!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div key={review.id}>
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.user?.avatar_url} />
                    <AvatarFallback>
                      {review.user?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {review.user?.display_name || 'Usuário'}
                      </span>
                      <StarRating rating={review.rating} size="sm" readonly />
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {format(new Date(review.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </p>
                    
                    {review.comment && (
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
                
                {index < reviews.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}