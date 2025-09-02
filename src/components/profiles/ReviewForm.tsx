import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Star, Loader2 } from 'lucide-react';
import { useSubmitReview } from '@/hooks/useSubmitReview';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';

interface ReviewFormProps {
  profileId: string;
}

export function ReviewForm({ profileId }: ReviewFormProps) {
  const { submitReview, getUserReview, loading, isAuthenticated } = useSubmitReview();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);

  useEffect(() => {
    if (isAuthenticated) {
      getUserReview(profileId).then(review => {
        if (review) {
          setExistingReview(review);
          setRating(review.rating);
          setComment(review.comment || '');
        }
      });
    }
  }, [profileId, isAuthenticated, getUserReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthRequired(true);
      return;
    }

    if (rating === 0) return;

    const { error } = await submitReview(profileId, {
      rating,
      comment: comment.trim() || undefined
    });

    if (!error) {
      // Refresh existing review
      const review = await getUserReview(profileId);
      setExistingReview(review);
    }
  };

  const handleSignIn = () => {
    setShowAuthRequired(false);
    setShowAuthDialog(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deixe sua Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Faça login para deixar uma avaliação sobre sua experiência.
            </p>
            <Button onClick={() => setShowAuthRequired(true)} className="w-full">
              Fazer Login para Avaliar
            </Button>
          </CardContent>
        </Card>

        <AuthRequiredDialog
          open={showAuthRequired}
          onOpenChange={setShowAuthRequired}
          action="review"
          onSignIn={handleSignIn}
        />

        <PublicAuthDialog
          open={showAuthDialog}
          onOpenChange={setShowAuthDialog}
          defaultTab="signin"
        />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? 'Atualizar Avaliação' : 'Deixe sua Avaliação'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nota</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>


          <div className="space-y-2">
            <Label htmlFor="comment">Comentário (opcional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte sobre sua experiência..."
              className="min-h-[100px]"
            />
          </div>

          <Button 
            type="submit" 
            disabled={rating === 0 || loading}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingReview ? 'Atualizar Avaliação' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}