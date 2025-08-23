import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, KeyRound, RefreshCw } from "lucide-react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin");
      }
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/admin");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if email is approved
      const { data: approvedUser, error: checkError } = await supabase
        .from('approved_admins')
        .select('email, is_active')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (checkError || !approvedUser) {
        toast.error("Este email não está autorizado para acessar o admin. Entre em contato com fiih@roleentretenimento.com");
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: {
              full_name: fullName,
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            toast.error("Este email já possui uma conta. Faça login em vez de criar uma nova conta.");
            setIsSignUp(false);
          } else {
            throw error;
          }
        } else {
          toast.success("Conta criada! Verifique seu email para confirmar ou use 'Redefinir senha' para acesso imediato.");
        }
      } else {
        // Try normal login first
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          // Enhanced error handling for admins
          if (loginError.message.includes('Email not confirmed')) {
            toast.error("Email não confirmado. SOLUÇÃO RÁPIDA: Use 'Redefinir senha' - isso confirmará sua conta automaticamente e você poderá fazer login.", {
              duration: 8000
            });
          } else if (loginError.message.includes('Invalid login credentials')) {
            toast.error("Email ou senha incorretos. Verifique suas credenciais ou use 'Redefinir senha'.");
          } else if (loginError.message.includes('Too many requests')) {
            toast.error("Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.");
          } else if (loginError.message.includes('signup not allowed')) {
            toast.error("Este email ainda não foi configurado. Entre em contato com fiih@roleentretenimento.com");
          } else {
            throw loginError;
          }
        } else {
          toast.success("Login realizado com sucesso!");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Better error messaging
      if (error.message?.includes('JWT')) {
        toast.error("Sessão expirada. Tente fazer login novamente.");
      } else if (error.message?.includes('network')) {
        toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
      } else {
        toast.error(error.message || "Erro na autenticação");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error("Digite seu email para recuperar a senha");
      return;
    }

    setIsResetting(true);
    try {
      // Check if email is approved first
      const { data: approvedUser, error: checkError } = await supabase
        .from('approved_admins')
        .select('email, is_active')
        .eq('email', resetEmail)
        .eq('is_active', true)
        .single();

      if (checkError || !approvedUser) {
        toast.error("Este email não está autorizado para acessar o admin.");
        setIsResetting(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) throw error;

      toast.success("Email de recuperação enviado! Verifique sua caixa de entrada.");
      setShowResetDialog(false);
      setResetEmail("");
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Erro ao enviar email de recuperação");
    } finally {
      setIsResetting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast.error("Digite seu email para reenviar a confirmação");
      return;
    }

    setIsResendingConfirmation(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        }
      });

      if (error) throw error;

      toast.success("Email de confirmação reenviado! Verifique sua caixa de entrada.");
    } catch (error: any) {
      console.error("Resend confirmation error:", error);
      toast.error(error.message || "Erro ao reenviar confirmação");
    } finally {
      setIsResendingConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Admin ROLÊ
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Criar conta de administrador" : "Acesse o painel administrativo"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nome Completo
                </label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
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
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Criar Conta" : "Entrar"}
            </Button>
          </form>
          
          <div className="mt-4 space-y-3">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp ? "Já tem conta? Fazer login" : "Não tem conta? Criar conta"}
              </button>
            </div>

            {!isSignUp && (
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-2">
                      Problemas para acessar? Tente estas opções:
                    </p>
                    <div className="flex flex-wrap justify-center gap-2 text-xs">
                      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                        <DialogTrigger asChild>
                          <button className="text-primary hover:underline flex items-center gap-1">
                            <KeyRound className="h-3 w-3" />
                            Redefinir senha
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Redefinir Senha</DialogTitle>
                            <DialogDescription>
                              Digite seu email para receber um link de redefinição. Isso também confirmará sua conta automaticamente.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Input
                              type="email"
                              placeholder="seu@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={handlePasswordReset} 
                                disabled={isResetting}
                                className="flex-1"
                              >
                                {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enviar Link
                              </Button>
                              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <span className="text-muted-foreground">•</span>

                      <button 
                        onClick={handleResendConfirmation}
                        disabled={isResendingConfirmation}
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {isResendingConfirmation ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        Reenviar confirmação
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    Ainda com problemas? Entre em contato:
                    <br />
                    <a href="mailto:fiih@roleentretenimento.com" className="text-primary hover:underline">
                      fiih@roleentretenimento.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;