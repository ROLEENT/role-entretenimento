import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, Lock, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function AdminAccessButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, role } = useAuth();
  const navigate = useNavigate();

  // Quick login options for development
  const quickLoginOptions = [
    { email: 'fiih@roleentretenimento.com', role: 'admin', name: 'Admin Fih' },
    { email: 'guilherme@roleentretenimento.com', role: 'admin', name: 'Admin Guilherme' }
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.error) {
        toast.error('Erro no login: ' + result.error.message);
      } else {
        toast.success('Login realizado com sucesso!');
        setIsOpen(false);
        // Small delay to allow auth state to update
        setTimeout(() => {
          navigate('/admin-v3');
        }, 500);
      }
    } catch (error) {
      toast.error('Erro inesperado no login');
    }
    setLoading(false);
  };

  const handleQuickLogin = async (userEmail: string) => {
    setEmail(userEmail);
    setPassword('123456'); // Default password for development
    
    const result = await signIn(userEmail, '123456');
    if (result.error) {
      toast.error('Login rápido falhou. Use senha personalizada.');
    } else {
      toast.success('Login realizado com sucesso!');
      setIsOpen(false);
      setTimeout(() => {
        navigate('/admin-v3');
      }, 500);
    }
  };

  // If user is already authenticated, show quick access
  if (user && (role === 'admin' || role === 'editor')) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button 
          onClick={() => navigate('/admin-v3')}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
        >
          <Settings className="w-4 h-4 mr-2" />
          Área Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline"
            size="sm"
            className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10"
          >
            <Lock className="w-4 h-4 mr-2" />
            Admin
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Acesso Administrativo
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Quick Login Buttons for Development */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Login Rápido (Desenvolvimento)</Label>
              <div className="grid gap-2">
                {quickLoginOptions.map((option) => (
                  <Button
                    key={option.email}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickLogin(option.email)}
                    className="justify-start"
                  >
                    <User className="w-4 h-4 mr-2" />
                    {option.name} ({option.role})
                  </Button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ou use suas credenciais
                </span>
              </div>
            </div>

            {/* Manual Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
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
                {loading ? 'Entrando...' : 'Entrar no Admin'}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}