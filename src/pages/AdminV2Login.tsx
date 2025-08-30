import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface LoginAttempt {
  timestamp: number;
  success: boolean;
}

const AUTHORIZED_EMAILS = [
  'pablohenrique.dev@gmail.com',
  'admin@role.app',
  'fiih@roleentretenimento.com',
  'guilherme@roleentretenimento.com'
];

const RATE_LIMIT_ATTEMPTS = 5;
const BACKOFF_DURATION = 30000; // 30 seconds
const CAPTCHA_THRESHOLD = 5;

const AdminV2Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockEndTime, setBlockEndTime] = useState<number | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next') || '/admin-v2';
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const captchaRef = useRef<any>(null);

  // Environment detection
  const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('lovable');

  useEffect(() => {
    // Check for existing session
    const checkExistingSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email && AUTHORIZED_EMAILS.includes(session.user.email)) {
          console.log('[ADMIN-V2] login ok');
          navigate(nextUrl);
        }
      } catch (error) {
        console.error('[ADMIN-V2] Session check error:', error);
      }
    };

    checkExistingSession();

    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, nextUrl]);

  // Rate limiting logic
  useEffect(() => {
    const recentAttempts = loginAttempts.filter(
      attempt => Date.now() - attempt.timestamp < BACKOFF_DURATION
    );
    
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= RATE_LIMIT_ATTEMPTS) {
      setIsBlocked(true);
      setBlockEndTime(Date.now() + BACKOFF_DURATION);
      
      if (failedAttempts.length >= CAPTCHA_THRESHOLD) {
        setShowCaptcha(true);
      }
    } else {
      setIsBlocked(false);
      setBlockEndTime(null);
    }
  }, [loginAttempts]);

  // Block countdown
  useEffect(() => {
    if (!isBlocked || !blockEndTime) return;

    const interval = setInterval(() => {
      if (Date.now() >= blockEndTime) {
        setIsBlocked(false);
        setBlockEndTime(null);
        // Reset attempts after block expires
        setLoginAttempts([]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isBlocked, blockEndTime]);

  const addLoginAttempt = (success: boolean) => {
    setLoginAttempts(prev => [...prev, { timestamp: Date.now(), success }]);
  };

  const provisionUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase.rpc('provision_user_profile', {
        p_user_id: userId,
        p_email: userEmail
      });

      if (error) throw error;
      
      console.log('[ADMIN-V2] provision viewer');
      return data;
    } catch (error) {
      console.error('[ADMIN-V2] Profile provision error:', error);
      throw error;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      const remainingTime = Math.ceil((blockEndTime! - Date.now()) / 1000);
      toast.error(`Muitas tentativas. Tente novamente em ${remainingTime}s`);
      return;
    }

    if (!isOnline) {
      toast.error('Sem conexão com a internet');
      return;
    }

    if (!AUTHORIZED_EMAILS.includes(email)) {
      setAuthError('Credenciais inválidas');
      addLoginAttempt(false);
      return;
    }

    setLoading(true);
    setAuthError('');

    try {
      // Revoke old sessions first
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setAuthError('Credenciais inválidas');
        addLoginAttempt(false);
        return;
      }

      if (data.user) {
        // Provision profile if needed
        const profile = await provisionUserProfile(data.user.id, data.user.email!);
        const userRole = profile?.role || 'viewer';
        
        console.log(`[ADMIN-V2] role:${userRole}`);
        
        if (userRole === 'admin' || userRole === 'editor') {
          console.log('[ADMIN-V2] login ok');
          addLoginAttempt(true);
          toast.success('Login realizado com sucesso!');
          navigate(nextUrl);
        } else {
          // Block viewer access
          console.log('[ADMIN-V2] guard:denied');
          setAuthError('Acesso negado. Entre em contato com o administrador.');
          await supabase.auth.signOut();
          addLoginAttempt(false);
        }
      }
    } catch (error: any) {
      console.error('[ADMIN-V2] Login error:', error);
      setAuthError('Credenciais inválidas');
      addLoginAttempt(false);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Digite seu email primeiro');
      return;
    }

    if (!AUTHORIZED_EMAILS.includes(email)) {
      toast.error('Email não autorizado');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin-v2/login`
      });

      if (error) throw error;
      
      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
    } catch (error: any) {
      toast.error('Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Digite seu email primeiro');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-v2/login`
        }
      });

      if (error) throw error;
      
      toast.success('Email de verificação reenviado!');
    } catch (error: any) {
      toast.error('Erro ao reenviar verificação');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin(e as any);
    }
  };

  const remainingTime = blockEndTime ? Math.ceil((blockEndTime - Date.now()) / 1000) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      {/* Staging Banner */}
      {!isProduction && (
        <div className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground text-center py-2 text-sm font-medium z-50">
          🚧 STAGING ENVIRONMENT
        </div>
      )}

      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-destructive text-destructive-foreground text-center py-2 text-sm font-medium z-40 flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Sem conexão com a internet
        </div>
      )}

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin V2 - Role</CardTitle>
          <CardDescription>
            Sistema avançado de administração
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 mobile-input"
                  autoComplete="email"
                  required
                  disabled={loading || isBlocked}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={passwordInputRef}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10 mobile-input"
                  autoComplete="current-password"
                  required
                  disabled={loading || isBlocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 touch-target"
                  disabled={loading || isBlocked}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {authError && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md" role="alert" aria-live="polite">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{authError}</span>
              </div>
            )}

            {/* Rate Limit Warning */}
            {isBlocked && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 text-warning-foreground rounded-md" role="alert" aria-live="polite">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">
                  Muitas tentativas. Tente novamente em {remainingTime}s
                </span>
              </div>
            )}

            {/* hCaptcha placeholder */}
            {showCaptcha && (
              <div className="p-4 bg-muted rounded-md text-center text-sm text-muted-foreground">
                hCaptcha seria exibido aqui após 5 tentativas falhadas
              </div>
            )}

            <Button
              type="submit"
              className="w-full mobile-auth-button"
              disabled={loading || isBlocked || !isOnline}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-primary hover:underline disabled:opacity-50"
                disabled={loading || !email}
              >
                Esqueci minha senha
              </button>
              
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm text-primary hover:underline disabled:opacity-50"
                disabled={loading || !email}
              >
                Reenviar verificação de email
              </button>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground mb-2">
                Ao continuar, você concorda com nossos
              </p>
              <div className="flex justify-center space-x-4 text-xs">
                <Link to="/termos-usuario" className="text-primary hover:underline">
                  Termos de Uso
                </Link>
                <Link to="/politica-privacidade" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3" />
                <span>Conectado</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3" />
                <span>Offline</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminV2Login;