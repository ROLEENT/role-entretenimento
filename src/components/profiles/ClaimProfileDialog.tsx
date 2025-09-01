import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, Lock, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ClaimProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    handle: string;
    name: string;
    bio?: string;
    avatar_url?: string;
  };
}

export const ClaimProfileDialog = ({ isOpen, onClose, profile }: ClaimProfileDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [claimCode, setClaimCode] = useState('');

  const handleClaimProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('link-profile', {
        body: {
          profileId: profile.id,
          email,
          password,
          claimCode
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast.success('Perfil reivindicado com sucesso! Faça login para continuar.');
      onClose();
      
      // Opcional: fazer login automático
      // window.location.href = '/auth';
      
    } catch (error: any) {
      console.error('Error claiming profile:', error);
      toast.error(error.message || 'Erro ao reivindicar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Reivindicar Perfil
          </DialogTitle>
          <DialogDescription>
            Reivindique este perfil para poder seguir outros perfis, deixar reviews e fazer uploads.
          </DialogDescription>
        </DialogHeader>

        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              )}
              <div>
                <CardTitle className="text-base">{profile.name}</CardTitle>
                <CardDescription>@{profile.handle}</CardDescription>
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
            )}
          </CardHeader>
        </Card>

        <form onSubmit={handleClaimProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="claimCode" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Código de Reivindicação
            </Label>
            <Input
              id="claimCode"
              placeholder="Digite o handle do perfil para confirmar"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Digite "@{profile.handle}" para confirmar que este é seu perfil
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Confirmar Senha
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirme sua senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reivindicar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};