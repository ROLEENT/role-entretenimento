import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Mail, Check } from "lucide-react";

const AdminLoginSimple = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          navigate("/admin");
          return;
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };
    
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (mounted) {
          setCheckingSession(false);
          if (session && event === 'SIGNED_IN') {
            navigate("/admin");
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // URL de redirect específica para admin usando o domínio atual
      const redirectTo = `${window.location.origin}/admin`;
      
      console.log('🔐 Enviando Magic Link para:', email);
      console.log('📍 Redirect URL:', redirectTo);
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: false // Só permitir login de usuários existentes
        }
      });

      if (error) {
        if (error.message.includes('Email rate limit exceeded')) {
          toast.error("Muitos emails enviados. Aguarde alguns minutos antes de tentar novamente.");
        } else if (error.message.includes('Signup not allowed')) {
          toast.error("Este email ainda não foi configurado. Entre em contato com fiih@roleentretenimento.com");
        } else {
          throw error;
        }
      } else {
        setLinkSent(true);
        toast.success(`Magic Link enviado para ${email}! Verifique sua caixa de entrada e clique no link para fazer login.`, {
          duration: 8000
        });
      }
    } catch (error: any) {
      console.error("Magic Link error:", error);
      
      if (error.message?.includes('network')) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        toast.error(error.message || "Erro ao enviar Magic Link");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMagicLink = async () => {
    if (!email) {
      toast.error("Digite seu email primeiro");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
          shouldCreateUser: false
        }
      });

      if (error) throw error;

      toast.success("Novo Magic Link enviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error("Resend magic link error:", error);
      toast.error(error.message || "Erro ao reenviar Magic Link");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while checking session
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verificando sessão...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin ROLÊ
          </CardTitle>
          <CardDescription className="text-center">
            {linkSent ? "Verifique seu email" : "Acesse o painel administrativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {linkSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-green-50 dark:bg-green-950 rounded-full p-3">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Magic Link Enviado!</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enviamos um link de acesso para <strong>{email}</strong>
                  <br />
                  Clique no link do email para fazer login automaticamente.
                </p>
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Não viu o email? Verifique sua caixa de spam ou lixo eletrônico.
                </div>
              </div>
              <div className="space-y-2">
                <Button 
                  onClick={handleResendMagicLink}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reenviar Magic Link
                </Button>
                <Button 
                  onClick={() => setLinkSent(false)}
                  variant="ghost"
                  className="w-full"
                >
                  Usar outro email
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email do Administrador
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@role.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Magic Link
                </Button>
              </form>
              
              <div className="mt-6 space-y-3">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <h4 className="text-sm font-medium mb-2">Como funciona?</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>1. Digite seu email administrativo</p>
                    <p>2. Receba um Magic Link no seu email</p>
                    <p>3. Clique no link para entrar automaticamente</p>
                  </div>
                  <div className="mt-3 text-xs text-green-600 dark:text-green-400">
                    ✨ Sem senha, sem complicação!
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Problemas de acesso? Entre em contato:
                    <br />
                    <a href="mailto:fiih@roleentretenimento.com" className="text-primary hover:underline">
                      fiih@roleentretenimento.com
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginSimple;