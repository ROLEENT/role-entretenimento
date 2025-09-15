import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { useV5Analytics } from '@/hooks/useV5Analytics';
import { useAnimatedToast } from '@/hooks/useAnimatedToast';

interface V5FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: 'v4' | 'v5';
  entityType?: string;
}

export function V5FeedbackModal({ isOpen, onClose, version, entityType = 'general' }: V5FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addUserFeedback } = useV5Analytics();
  const { showAnimatedToast } = useAnimatedToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      showAnimatedToast({
        title: 'Avaliação obrigatória',
        description: 'Por favor, selecione uma avaliação de 1 a 5 estrelas',
        icon: 'star'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      addUserFeedback({
        version,
        rating,
        comment: comment.trim() || undefined
      });

      showAnimatedToast({
        title: 'Feedback enviado!',
        description: 'Obrigado por compartilhar sua experiência conosco',
        icon: 'success'
      });

      // Reset form
      setRating(0);
      setComment('');
      onClose();
    } catch (error) {
      showAnimatedToast({
        title: 'Erro ao enviar feedback',
        description: 'Tente novamente em alguns instantes',
        icon: 'success'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Como foi sua experiência?
          </DialogTitle>
          <DialogDescription>
            Sua opinião nos ajuda a melhorar a interface {version.toUpperCase()}. 
            Avalie sua experiência e compartilhe seus comentários.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Stars */}
          <div className="space-y-2">
            <Label>Avaliação *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 rounded hover:bg-accent transition-colors"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 1 && 'Muito ruim'}
                  {rating === 2 && 'Ruim'}
                  {rating === 3 && 'Neutro'}
                  {rating === 4 && 'Bom'}
                  {rating === 5 && 'Excelente'}
                </span>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="feedback-comment">
              Comentários (opcional)
            </Label>
            <Textarea
              id="feedback-comment"
              placeholder="Compartilhe mais detalhes sobre sua experiência, sugestões de melhoria ou problemas encontrados..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/500 caracteres
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || rating === 0}
              className="min-w-24"
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}