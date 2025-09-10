import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  XCircle, 
  Star,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PostEventActionsProps {
  event: any;
}

export function PostEventActions({ event }: PostEventActionsProps) {
  const { user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState<'attended' | 'not_attended' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Only show for past events
  const eventDate = new Date(event.date_start);
  const isPastEvent = eventDate < new Date();
  
  if (!isPastEvent || !user) {
    return null;
  }

  useEffect(() => {
    if (user && event.id) {
      loadAttendanceStatus();
    }
  }, [user, event.id]);

  const loadAttendanceStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('event_checkins')
        .select('attended')
        .eq('event_id', event.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading attendance:', error);
        return;
      }

      if (data) {
        setAttendanceStatus(data.attended ? 'attended' : 'not_attended');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAttendanceUpdate = async (attended: boolean) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('event_checkins')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          attended: attended,
          checked_in_at: new Date().toISOString()
        });

      if (error) throw error;

      setAttendanceStatus(attended ? 'attended' : 'not_attended');
      
      if (attended) {
        setShowFeedback(true);
        toast.success('Obrigado por confirmar sua presença!');
      } else {
        toast.success('Presença atualizada');
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error('Erro ao atualizar presença');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!user || rating === 0) {
      toast.error('Por favor, selecione uma avaliação');
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('event_reviews')
        .upsert({
          event_id: event.id,
          user_id: user.id,
          rating: rating,
          comment: feedback.trim() || null
        });

      if (error) throw error;

      toast.success('Obrigado pelo seu feedback!');
      setShowFeedback(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Erro ao enviar avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-lg border-orange-200 bg-orange-50">
      <CardContent className="p-4">
        <h3 className="font-medium mb-3 text-orange-900">Como foi este evento?</h3>
        
        {/* Attendance Status */}
        {!attendanceStatus && (
          <div className="space-y-3">
            <p className="text-sm text-orange-700">Você participou deste evento?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAttendanceUpdate(true)}
                disabled={loading}
                className="border-green-200 text-green-700 hover:bg-green-50"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Estive lá
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAttendanceUpdate(false)}
                disabled={loading}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Não fui
              </Button>
            </div>
          </div>
        )}

        {/* Show status after selection */}
        {attendanceStatus && !showFeedback && (
          <div className="flex items-center gap-2 text-sm">
            {attendanceStatus === 'attended' ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-green-700">Você marcou presença neste evento</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFeedback(true)}
                  className="ml-2 text-orange-600 hover:text-orange-700"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Avaliar
                </Button>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-red-700">Marcado como não compareceu</span>
              </>
            )}
          </div>
        )}

        {/* Quick Feedback Form */}
        {showFeedback && (
          <div className="mt-4 space-y-3 border-t border-orange-200 pt-4">
            <h4 className="font-medium text-sm text-orange-900">Avalie este evento</h4>
            
            {/* Star Rating */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl hover:scale-110 transition-transform"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            {/* Optional Comment */}
            <Textarea
              placeholder="Como foi sua experiência? (opcional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="text-sm"
              rows={3}
            />
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleFeedbackSubmit}
                disabled={loading || rating === 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Enviar Avaliação
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedback(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}