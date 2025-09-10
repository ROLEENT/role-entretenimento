import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Star, MessageCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PostEventCheckInProps {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventEndDate?: Date;
  className?: string;
}

interface CheckInData {
  id?: string;
  attended?: boolean;
  rating?: number;
  feedback?: string;
  checked_in_at: string;
}

export function PostEventCheckIn({ 
  eventId, 
  eventTitle, 
  eventDate, 
  eventEndDate,
  className 
}: PostEventCheckInProps) {
  const { user } = useAuth();
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tempRating, setTempRating] = useState(0);
  const [tempFeedback, setTempFeedback] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  // Check if event has ended (use end date if available, otherwise date + 12 hours)
  const eventEnd = eventEndDate || new Date(eventDate.getTime() + 12 * 60 * 60 * 1000);
  const hasEventEnded = new Date() > eventEnd;

  useEffect(() => {
    if (user?.id && hasEventEnded) {
      fetchCheckInData();
    }
  }, [user?.id, eventId, hasEventEnded]);

  const fetchCheckInData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_checkins')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setCheckInData(data);
      if (data?.rating) {
        setTempRating(data.rating);
      }
      if (data?.feedback) {
        setTempFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching check-in data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceUpdate = async (attended: boolean) => {
    if (!user?.id) {
      toast.error('Você precisa estar logado');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('event_checkins')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          attended,
          checked_in_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setCheckInData(data);
      
      if (attended) {
        setShowFeedbackForm(true);
        toast.success('Presença confirmada! Que tal avaliar o evento?');
      } else {
        toast.success('Obrigado pelo feedback!');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Erro ao atualizar presença');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user?.id || !checkInData) {
      toast.error('Dados inválidos para envio do feedback');
      return;
    }

    if (tempRating < 1 || tempRating > 5) {
      toast.error('Por favor, dê uma nota de 1 a 5 estrelas');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('event_checkins')
        .update({
          rating: tempRating,
          feedback: tempFeedback.trim() || null
        })
        .eq('id', checkInData.id);

      if (error) throw error;

      setCheckInData(prev => prev ? {
        ...prev,
        rating: tempRating,
        feedback: tempFeedback.trim() || undefined
      } : null);

      setShowFeedbackForm(false);
      toast.success('Avaliação enviada! Obrigado pelo feedback.');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onStarClick?: (star: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onStarClick?.(i + 1)}
      />
    ));
  };

  // Don't show anything if event hasn't ended or user not logged in
  if (!hasEventEnded || !user) {
    return null;
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Calendar className="h-5 w-5 animate-pulse text-muted-foreground mr-2" />
            <span className="text-muted-foreground">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Pós-Evento
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {eventTitle} • {eventDate.toLocaleDateString('pt-BR')}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {checkInData?.attended === undefined ? (
          /* Initial attendance question */
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="font-medium">Você participou deste evento?</h3>
              <p className="text-sm text-muted-foreground">
                Sua resposta nos ajuda a melhorar futuros eventos
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => handleAttendanceUpdate(true)}
                disabled={submitting}
                className="flex items-center gap-2 h-12"
              >
                <CheckCircle className="h-4 w-4" />
                Sim, estive lá!
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAttendanceUpdate(false)}
                disabled={submitting}
                className="flex items-center gap-2 h-12"
              >
                <XCircle className="h-4 w-4" />
                Não participei
              </Button>
            </div>
          </div>
        ) : (
          /* Show current status */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {checkInData.attended ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Você participou deste evento</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Você não participou</span>
                </>
              )}
            </div>

            {checkInData.attended && (
              <>
                <Separator />
                
                {/* Rating Section */}
                {checkInData.rating ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sua avaliação:</span>
                      <div className="flex gap-1">
                        {renderStars(checkInData.rating)}
                      </div>
                      <Badge variant="secondary">{checkInData.rating}/5</Badge>
                    </div>
                    
                    {checkInData.feedback && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{checkInData.feedback}</p>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFeedbackForm(true)}
                      className="mt-2"
                    >
                      Editar avaliação
                    </Button>
                  </div>
                ) : (
                  /* Show feedback form or button to open it */
                  showFeedbackForm ? (
                    <div className="space-y-4">
                      <h3 className="font-medium">Como foi o evento para você?</h3>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Nota geral:</label>
                        <div className="flex gap-1">
                          {renderStars(tempRating, true, setTempRating)}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Comentário (opcional):
                        </label>
                        <Textarea
                          value={tempFeedback}
                          onChange={(e) => setTempFeedback(e.target.value)}
                          placeholder="Compartilhe sua experiência sobre o evento..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleFeedbackSubmit}
                          disabled={submitting || tempRating === 0}
                        >
                          {submitting ? 'Enviando...' : 'Enviar Avaliação'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowFeedbackForm(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowFeedbackForm(true)}
                      className="w-full flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Avaliar evento
                    </Button>
                  )
                )}
              </>
            )}

            {!checkInData.attended && (
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground">
                  Obrigado pelo feedback! Esperamos vê-lo nos próximos eventos.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}