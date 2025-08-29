import { useState, useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const SessionStatusIndicator = () => {
  const { isAuthenticated, session, refreshAuth, isSessionValid } = useSecureAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!session) return;

    const updateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      
      if (expiresAt) {
        const remaining = expiresAt - now;
        setTimeLeft(remaining > 0 ? remaining : 0);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAuth();
      toast({
        title: "Sessão renovada",
        description: "Sua sessão foi renovada com sucesso.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erro ao renovar sessão",
        description: "Não foi possível renovar a sessão. Tente fazer login novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (!isAuthenticated) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Não autenticado
      </Badge>
    );
  }

  const isValid = isSessionValid();
  const isExpiringSoon = timeLeft !== null && timeLeft < 300; // 5 minutes

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={isValid ? (isExpiringSoon ? "destructive" : "default") : "destructive"}
        className="flex items-center gap-1"
      >
        {isValid ? (
          <>
            <CheckCircle className="h-3 w-3" />
            Sessão ativa
          </>
        ) : (
          <>
            <AlertCircle className="h-3 w-3" />
            Sessão inválida
          </>
        )}
      </Badge>
      
      {timeLeft !== null && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {formatTime(timeLeft)}
        </Badge>
      )}
      
      <Button
        size="sm"
        variant="ghost"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-6 w-6 p-0"
      >
        <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};