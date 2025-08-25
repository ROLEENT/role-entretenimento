import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, CheckCircle, Camera, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface EventCheckInProps {
  eventId: string;
  eventTitle: string;
}

const EventCheckIn = ({ eventId, eventTitle }: EventCheckInProps) => {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user, isAuthenticated } = useAuth();

  // Generate QR Code for event check-in
  const generateQRCode = () => {
    if (!user) return;
    
    const checkInData = {
      eventId,
      userId: user.id,
      timestamp: Date.now(),
      eventTitle
    };
    
    const qrData = btoa(JSON.stringify(checkInData));
    setQrCode(qrData);
  };

  // Check-in function
  const handleCheckIn = async () => {
    if (!user || !isAuthenticated) {
      toast({
        title: "Erro",
        description: "Faça login para fazer check-in no evento",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Check if user is already checked in
      const { data: existingCheckIn } = await supabase
        .from('event_checkins')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (existingCheckIn) {
        setIsCheckedIn(true);
        toast({
          title: "Check-in já realizado",
          description: "Você já fez check-in neste evento!"
        });
        return;
      }

      // Create check-in record
      const { error } = await supabase
        .from('event_checkins')
        .insert({
          event_id: eventId,
          user_id: user.id,
          checked_in_at: new Date().toISOString()
        });

      if (error) throw error;

      setIsCheckedIn(true);
      toast({
        title: "Check-in realizado!",
        description: "Você foi registrado no evento com sucesso!"
      });

    } catch (error) {
      console.error('Check-in error:', error);
      toast({
        title: "Erro no check-in",
        description: "Não foi possível realizar o check-in. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Check-in do Evento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Faça login para realizar o check-in no evento
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Check-in do Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isCheckedIn ? (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Check-in realizado com sucesso! Aproveite o evento.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Realize o check-in para confirmar sua presença no evento
            </p>
            
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleCheckIn}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Fazer Check-in
              </Button>
              
              <Button 
                variant="outline"
                onClick={generateQRCode}
                className="w-full gap-2"
              >
                <QrCode className="w-4 h-4" />
                Gerar QR Code
              </Button>
            </div>

            {qrCode && (
              <div className="mt-4 p-4 bg-white rounded-lg border text-center">
                <p className="text-sm font-medium mb-2">Seu QR Code de Check-in:</p>
                <div className="inline-block p-4 bg-gray-100 rounded">
                  <div className="w-32 h-32 bg-black text-white flex items-center justify-center text-xs break-all">
                    {qrCode.slice(0, 20)}...
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Apresente este código na entrada do evento
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCheckIn;