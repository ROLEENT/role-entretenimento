import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, AlertCircle, Mail, Lock, Shield } from 'lucide-react';

/**
 * Página de login atualizada para usar cookies seguros e RBAC
 * ETAPA 1: Sistema de login com verificação de role
 */
export default function AdminV2Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading, role } = useSecureAuth();

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score < 2) return { strength: 'weak', color: 'bg-destructive' };
    if (score < 4) return { strength: 'medium', color: 'bg-warning' };
    return { strength: 'strong', color: 'bg-success' };
  };

  // Block timer effect
  useEffect(() => {
    if (isBlocked && blockTimeLeft > 0) {
      const timer = setTimeout(() => {
        setBlockTimeLeft(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBlocked, blockTimeLeft]);

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated && role) {
      const from = location.state?.from || '/admin-v2';
      console.log('[ADMIN LOGIN] Usuário já autenticado, redirecionando para:', from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, authLoading, role, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError(`Muitas tentativas. Tente novamente em ${blockTimeLeft} segundos.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Increment login attempts on failure
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);
        
        // Block after 5 failed attempts for 60 seconds
        if (newAttempts >= 5) {
          setIsBlocked(true);
          setBlockTimeLeft(60);
          setError('Muitas tentativas falhadas. Bloqueado por 60 segundos.');
        } else {
          setError(`Login inválido. Tentativa ${newAttempts}/5`);
        }
        
        // Log failed attempt
        console.warn(`[AUTH] Failed login attempt ${newAttempts} for email: ${email}`);
        throw authError;
      }

      // Reset attempts on success
      setLoginAttempts(0);
      setIsBlocked(false);

      if (data.user) {
        console.log('[ADMIN LOGIN] Login bem-sucedido para:', data.user.email);
        
        // Aguardar um momento para o auth state atualizar
        setTimeout(() => {
          const from = location.state?.from || '/admin-v2';
          console.log('[ADMIN LOGIN] Redirecionando para:', from);
          navigate(from, { replace: true });
        }, 500);
      }
    } catch (error: any) {
      console.error('[ADMIN LOGIN] Erro no login:', error);
      if (!isBlocked) {
        setError(error.message || 'Email ou senha incorretos. Verifique suas credenciais.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Digite seu email para receber o Magic Link');
      return;
    }

    setMagicLinkLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/admin-v2`;
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setError(error.message);
        return;
      }

      setMagicLinkSent(true);
      console.log('[AUTH] Magic link sent to:', email);
      
    } catch (error: any) {
      console.error('[AUTH] Magic link error:', error);
      setError('Erro ao enviar Magic Link');
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // Mostrar loading se ainda está verificando auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Mostrar confirmação de magic link enviado
  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-success">Magic Link Enviado!</CardTitle>
            <CardDescription>
              Verifique seu email e clique no link para fazer login
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <Mail className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Enviamos um link de acesso para <strong>{email}</strong>
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setMagicLinkSent(false);
                setEmail('');
              }}
              className="w-full"
            >
              Voltar ao Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const passwordStrength = password ? getPasswordStrength(password) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            ROLÊ Admin
          </CardTitle>
          <CardDescription>
            Entre para acessar o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@role.app"
                required
                autoComplete="username"
                disabled={loading || magicLinkLoading || isBlocked}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  disabled={loading || magicLinkLoading || isBlocked}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading || magicLinkLoading || isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {password && passwordStrength && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground">Força da senha:</span>
                    <span className={`font-medium ${
                      passwordStrength.strength === 'weak' ? 'text-destructive' :
                      passwordStrength.strength === 'medium' ? 'text-warning' : 'text-success'
                    }`}>
                      {passwordStrength.strength === 'weak' ? 'Fraca' :
                       passwordStrength.strength === 'medium' ? 'Média' : 'Forte'}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${passwordStrength.color}`}
                      style={{ 
                        width: passwordStrength.strength === 'weak' ? '33%' :
                               passwordStrength.strength === 'medium' ? '66%' : '100%'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {isBlocked && (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Conta temporariamente bloqueada. Tente novamente em {blockTimeLeft} segundos.
                </AlertDescription>
              </Alert>
            )}

            {error && !isBlocked && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || magicLinkLoading || isBlocked}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Entrar com Senha
                  </>
                )}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                className="w-full" 
                disabled={loading || magicLinkLoading || isBlocked || !email}
                onClick={handleMagicLink}
              >
                {magicLinkLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Entrar com Magic Link
                  </>
                )}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground space-y-2">
            {loginAttempts > 0 && loginAttempts < 5 && (
              <p className="text-warning">
                Tentativas restantes: {5 - loginAttempts}
              </p>
            )}
            <p>Problemas para entrar? Contate: admin@role.app</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}