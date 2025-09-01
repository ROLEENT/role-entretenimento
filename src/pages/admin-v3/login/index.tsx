import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminV3Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const { session, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard when authenticated with proper role
    if (!authLoading && session && (role === 'admin' || role === 'editor')) {
      navigate('/admin-v3');
    }
  }, [session, role, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }
      
      // Navigation will happen via useEffect when role is loaded
    } catch (err) {
      setError('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Digite seu email primeiro');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin-v3/login`,
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Link de recuperação enviado para seu email');
      }
    } catch (err) {
      setError('Erro ao enviar email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Digite seu email primeiro');
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin-v3/login`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage('Email de verificação reenviado');
      }
    } catch (err) {
      setError('Erro ao reenviar verificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Admin v3 - Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert>
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <Button
              variant="link"
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full text-sm"
            >
              Esqueci minha senha
            </Button>
            
            <Button
              variant="link"
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full text-sm"
            >
              Reenviar verificação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}