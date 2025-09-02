import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { useArtistReview } from '@/hooks/useArtistReview';
import { AuthRequiredDialog } from '@/components/auth/AuthRequiredDialog';
import { PublicAuthDialog } from '@/components/auth/PublicAuthDialog';
import { Trash2, Edit3, Star } from 'lucide-react';

interface ArtistReviewFormProps {
  profileUserId: string;
  artistName?: string;
}

export function ArtistReviewForm({ profileUserId, artistName = "artista" }: ArtistReviewFormProps) {
  const { 
    userReview, 
    loading, 
    submitReview, 
    deleteReview, 
    canReview, 
    isAuthenticated 
  } = useArtistReview(profileUserId);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showPublicAuthDialog, setShowPublicAuthDialog] = useState(false);

  // Sincronizar com review existente
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || '');
      setIsEditing(false);
    } else {
      setRating(0);
      setComment('');
      setIsEditing(false);
    }
  }, [userReview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (rating === 0) {
      return;
    }

    const result = await submitReview(rating, comment);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja remover sua avaliação?')) {
      await deleteReview();
    }
  };

  const startEditing = () => {
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || '');
    }
    setIsEditing(false);
  };

  // Se não pode avaliar (não autenticado ou é o próprio perfil)
  if (!canReview && isAuthenticated) {
    return null; // Não pode avaliar o próprio perfil
  }

  // Se não autenticado, mostrar prompt
  if (!isAuthenticated) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Avalie {artistName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Faça login para avaliar e comentar sobre este artista.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowAuthDialog(true)} variant="outline">
                Entrar
              </Button>
              <Button onClick={() => setShowPublicAuthDialog(true)}>
                Criar Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        <AuthRequiredDialog 
          open={showAuthDialog} 
          onOpenChange={setShowAuthDialog}
          action="review"
          onSignIn={() => {
            setShowAuthDialog(false);
            setShowPublicAuthDialog(true);
          }}
        />
        <PublicAuthDialog 
          open={showPublicAuthDialog} 
          onOpenChange={setShowPublicAuthDialog}
        />
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              {userReview && !isEditing ? 'Sua Avaliação' : `Avalie ${artistName}`}
            </div>
            {userReview && !isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startEditing}
                  disabled={loading}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userReview && !isEditing ? (
            // Mostrar review existente
            <div className="space-y-3">
              <StarRating 
                rating={userReview.rating} 
                readonly 
                showValue
              />
              {userReview.comment && (
                <p className="text-sm leading-relaxed">
                  {userReview.comment}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {userReview.created_at !== userReview.updated_at 
                  ? `Atualizada em ${new Date(userReview.updated_at).toLocaleDateString()}`
                  : `Avaliada em ${new Date(userReview.created_at).toLocaleDateString()}`
                }
              </p>
            </div>
          ) : (
            // Formulário de avaliação
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Sua Avaliação *
                </label>
                <StarRating
                  rating={rating}
                  onRatingChange={setRating}
                  interactive
                  showValue
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Comentário (opcional)
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Conte-nos sobre sua experiência com ${artistName}...`}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {comment.length}/500 caracteres
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={rating === 0 || loading}
                  className="flex-1"
                >
                  {loading ? (
                    'Salvando...'
                  ) : userReview ? (
                    'Atualizar Avaliação'
                  ) : (
                    'Enviar Avaliação'
                  )}
                </Button>
                {isEditing && userReview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEditing}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <AuthRequiredDialog 
        open={showAuthDialog} 
        onOpenChange={setShowAuthDialog}
        action="review"
        onSignIn={() => {
          setShowAuthDialog(false);
          setShowPublicAuthDialog(true);
        }}
      />
      <PublicAuthDialog 
        open={showPublicAuthDialog} 
        onOpenChange={setShowPublicAuthDialog}
      />
    </>
  );
}