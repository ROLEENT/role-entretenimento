import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Music, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSpotifyAuth } from '@/hooks/useSpotifyAuth';
import { toast } from 'sonner';

const MusicCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const { handleCallback } = useSpotifyAuth();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Erro na autenticação: ${error}`);
        toast.error('Falha ao conectar com o Spotify');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Parâmetros de autenticação inválidos');
        toast.error('Parâmetros de autenticação inválidos');
        return;
      }

      try {
        const success = await handleCallback(code, state);
        
        if (success) {
          setStatus('success');
          setMessage('Conectado ao Spotify com sucesso!');
          
          // Redirecionar após 2 segundos
          setTimeout(() => {
            navigate('/musica');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Falha ao processar autenticação');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setStatus('error');
        setMessage('Erro interno ao processar autenticação');
        toast.error('Erro ao conectar com o Spotify');
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  const handleRetry = () => {
    navigate('/musica');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            {status === 'loading' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            )}
            {status === 'error' && (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-xl">
            {status === 'loading' && 'Conectando ao Spotify...'}
            {status === 'success' && 'Conexão Realizada!'}
            {status === 'error' && 'Falha na Conexão'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">{message}</p>
          
          {status === 'loading' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Processando sua autenticação...
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Music className="h-5 w-5" />
                <span className="text-sm font-medium">Spotify conectado com sucesso!</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Redirecionando para a central de música...
              </p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Button onClick={handleRetry} className="w-full">
                  Tentar Novamente
                </Button>
                <Button onClick={handleGoHome} variant="outline" className="w-full">
                  Voltar ao Início
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MusicCallbackPage;