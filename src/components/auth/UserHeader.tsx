import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
// Removido: usando sistema unificado de dropdowns
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, LogOut, UserPlus } from 'lucide-react';
import { useUserAuth } from '@/hooks/useUserAuth';
import { toast } from '@/hooks/use-toast';

export const UserHeader = () => {
  const { user, signOut } = useUserAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" asChild>
          <Link to="/auth">
            <User className="w-4 h-4 mr-2" />
            Entrar
          </Link>
        </Button>
        <Button asChild>
          <Link to="/auth">
            <UserPlus className="w-4 h-4 mr-2" />
            Criar conta
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="dd" data-dd>
      <Button variant="ghost" className="relative h-10 w-10 rounded-full dd-trigger" data-dd-trigger aria-label="Menu do usuário">
        <Avatar className="h-10 w-10">
          <AvatarImage src={undefined} alt="Avatar" />
          <AvatarFallback className="bg-primary/10">
            {getInitials(user.email || '')}
          </AvatarFallback>
        </Avatar>
      </Button>
      <div className="dd-menu w-56" data-dd-menu role="menu">
        <div className="px-3 py-2 text-sm font-medium text-muted-foreground border-b border-border">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.display_name || 'Usuário'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <hr />
        <Link to="/profile" role="menuitem">
          <User className="h-4 w-4" />
          Meu perfil
        </Link>
        <Link to="/settings" role="menuitem">
          <Settings className="h-4 w-4" />
          Configurações
        </Link>
        <hr />
        <button role="menuitem" type="button" onClick={handleSignOut}>
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
};