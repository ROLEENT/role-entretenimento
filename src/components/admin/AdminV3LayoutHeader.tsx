import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Home, Settings, LogOut, ChevronRight } from 'lucide-react';

interface UserProfile {
  email: string;
  role: string | null;
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Skip /admin-v3 as it's the base
  if (segments[0] === 'admin-v3') {
    segments.shift();
  }
  
  let currentPath = '/admin-v3';
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Map segments to readable labels
    let label = segment;
    switch (segment) {
      case 'dashboard':
        label = 'Dashboard';
        break;
      case 'agenda':
        label = 'Agenda';
        break;
      case 'users':
        label = 'Usuários';
        break;
      case 'list':
        label = 'Lista';
        break;
      case 'create':
        label = 'Criar';
        break;
      case 'edit':
        label = 'Editar';
        break;
      case 'view':
        label = 'Visualizar';
        break;
      default:
        // Capitalize first letter
        label = segment.charAt(0).toUpperCase() + segment.slice(1);
    }
    
    // Add breadcrumb (last item has no path)
    breadcrumbs.push({
      label,
      path: i < segments.length - 1 ? currentPath : undefined
    });
  }
  
  return breadcrumbs;
}

export function AdminV3LayoutHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        throw new Error('Sessão não encontrada');
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setUser({
        email: session.user.email || '',
        role: profileError ? null : profile?.role || null
      });

    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUser({
        email: 'Erro ao carregar',
        role: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não conferem",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Erro", 
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Senha alterada com sucesso"
      });
      
      setPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin-v3/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: "Erro",
        description: "Erro ao sair da conta",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin': return 'default';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleText = (role: string | null) => {
    return role || 'sem role';
  };

  const getUserInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        
        {/* Dashboard button */}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate('/admin-v3/dashboard')}
          className="flex items-center gap-2 text-foreground hover:text-primary"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Admin Panel</span>
        </Button>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronRight className="h-4 w-4" />
                {item.path ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(item.path!)}
                    className="h-auto p-1 text-sm hover:text-foreground"
                  >
                    {item.label}
                  </Button>
                ) : (
                  <span className="text-foreground font-medium px-1">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* User menu */}
          {loading ? (
            <Skeleton className="h-8 w-8 rounded-full" />
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {user ? getUserInitials(user.email) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only" aria-label={`Menu do usuário ${user?.email || ''}`}>
                    Abrir menu do usuário
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm leading-none">{user?.email}</p>
                    <Badge variant={getRoleBadgeVariant(user?.role)} className="w-fit text-xs">
                      {getRoleText(user?.role)}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => setPasswordModalOpen(true)} 
                  className="cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Alterar senha</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Password change modal */}
      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Digite sua senha atual e a nova senha desejada.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  currentPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  newPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ 
                  ...prev, 
                  confirmPassword: e.target.value 
                }))}
                disabled={passwordLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setPasswordModalOpen(false)}
              disabled={passwordLoading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Alterando...' : 'Alterar senha'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}