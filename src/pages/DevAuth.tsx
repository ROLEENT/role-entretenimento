import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Settings, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function DevAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const adminUsers = [
    { email: 'fiih@roleentretenimento.com', role: 'admin', name: 'Admin Fih' },
    { email: 'guilherme@roleentretenimento.com', role: 'admin', name: 'Admin Guilherme' }
  ];

  const handleQuickLogin = async (userEmail: string) => {
    setLoading(true);
    try {
      const result = await signIn(userEmail, '123456');
      if (result.error) {
        toast.error('Login falhou: ' + result.error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/admin-v3');
      }
    } catch (error) {
      toast.error('Erro inesperado');
    }
    setLoading(false);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error('Erro no login: ' + result.error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        navigate('/admin-v3');
      }
    } catch (error) {
      toast.error('Erro inesperado no login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao site
          </Button>
          <h1 className="text-2xl font-bold">Acesso Administrativo</h1>
          <p className="text-muted-foreground">
            Ambiente de desenvolvimento - ROLÊ Admin
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Login Rápido (Dev)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminUsers.map((user) => (
              <Button
                key={user.email}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleQuickLogin(user.email)}
                disabled={loading}
              >
                <User className="w-4 h-4 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login Manual</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@roleentretenimento.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Após o login, você será redirecionado para:</p>
          <code className="bg-muted px-2 py-1 rounded text-xs">/admin-v3</code>
        </div>
      </div>
    </div>
  );
}