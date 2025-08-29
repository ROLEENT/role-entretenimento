import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  LogOut, 
  Shield, 
  AlertTriangle, 
  Loader2,
  Settings,
  BarChart3,
  FileText,
  Users,
  Calendar
} from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface UserProfile {
  role: 'admin' | 'editor' | 'viewer';
  display_name?: string;
  email?: string;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  profile: UserProfile | null;
  accessGranted: boolean;
}

const AUTHORIZED_EMAILS = [
  'pablohenrique.dev@gmail.com',
  'admin@role.app'
];

const AdminV2Dashboard = () => {
  const [authState, setAuthState] = useState<AuthState>({
    loading: true,
    session: null,
    profile: null,
    accessGranted: false
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    let authListener: any = null;

    const checkAccess = async (session: Session | null) => {
      if (!session?.user?.email) {
        console.log('[ADMIN-V2] guard:denied reason:no_session');
        setAuthState({
          loading: false,
          session: null,
          profile: null,
          accessGranted: false
        });
        return;
      }

      if (!AUTHORIZED_EMAILS.includes(session.user.email)) {
        console.log('[ADMIN-V2] guard:denied reason:unauthorized_email');
        setAuthState({
          loading: false,
          session,
          profile: null,
          accessGranted: false
        });
        return;
      }

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, display_name, email')
          .eq('user_id', session.user.id)
          .single();

        if (!isMounted) return;

        const userRole = profile?.role || 'viewer';
        console.log(`[ADMIN-V2] role:${userRole}`);

        if (userRole === 'admin' || userRole === 'editor') {
          console.log('[ADMIN-V2] guard:allowed');
          setAuthState({
            loading: false,
            session,
            profile: { ...profile, role: userRole },
            accessGranted: true
          });
        } else {
          console.log('[ADMIN-V2] guard:denied reason:insufficient_role');
          setAuthState({
            loading: false,
            session,
            profile: { ...profile, role: userRole },
            accessGranted: false
          });
        }
      } catch (error) {
        console.error('[ADMIN-V2] Profile check error:', error);
        if (!isMounted) return;
        
        setAuthState({
          loading: false,
          session,
          profile: null,
          accessGranted: false
        });
      }
    };

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        await checkAccess(session);

        // Set up auth listener (avoiding INITIAL_SESSION)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            // Skip INITIAL_SESSION to avoid loops
            if (event === 'INITIAL_SESSION') return;
            
            console.log('[ADMIN-V2] Auth state change:', event, !!session);
            await checkAccess(session);
          }
        );

        authListener = subscription;
      } catch (error) {
        console.error('[ADMIN-V2] Auth initialization error:', error);
        if (isMounted) {
          setAuthState({
            loading: false,
            session: null,
            profile: null,
            accessGranted: false
          });
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      authListener?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      console.log('[ADMIN-V2] Signed out');
      toast.success('Logout realizado com sucesso');
      navigate('/admin-v2/login');
    } catch (error) {
      console.error('[ADMIN-V2] Sign out error:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  // Loading state
  if (authState.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Access denied for viewers
  if (!authState.accessGranted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl text-destructive">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar esta área.
              {authState.profile?.role === 'viewer' && (
                <span className="block mt-2 text-sm">
                  Sua conta tem perfil de <strong>visualizador</strong>. 
                  Entre em contato com o administrador para obter acesso.
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={handleSignOut}
              variant="outline" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main dashboard for authorized users
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin V2 Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Bem-vindo, {authState.profile?.display_name || authState.session?.user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                {authState.profile?.role?.toUpperCase()}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardHome profile={authState.profile} />} />
          <Route path="/highlights" element={<div>Gestão de Destaques</div>} />
          <Route path="/events" element={<div>Gestão de Eventos</div>} />
          <Route path="/users" element={<div>Gestão de Usuários</div>} />
          <Route path="/analytics" element={<div>Analytics</div>} />
          <Route path="/settings" element={<div>Configurações</div>} />
          <Route path="*" element={<Navigate to="/admin-v2" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome = ({ profile }: { profile: UserProfile | null }) => {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Gestão de Destaques',
      description: 'Criar, editar e publicar destaques da cidade',
      icon: FileText,
      path: '/admin-v2/highlights',
      color: 'bg-blue-500'
    },
    {
      title: 'Gestão de Eventos',
      description: 'Administrar eventos e programação',
      icon: Calendar,
      path: '/admin-v2/events',
      color: 'bg-green-500'
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários e permissões',
      icon: Users,
      path: '/admin-v2/users',
      color: 'bg-purple-500',
      adminOnly: true
    },
    {
      title: 'Analytics',
      description: 'Relatórios e métricas do sistema',
      icon: BarChart3,
      path: '/admin-v2/analytics',
      color: 'bg-orange-500'
    },
    {
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: Settings,
      path: '/admin-v2/settings',
      color: 'bg-gray-500',
      adminOnly: true
    }
  ];

  const availableModules = modules.filter(module => 
    !module.adminOnly || profile?.role === 'admin'
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-4">Painel de Controle</h2>
        <p className="text-muted-foreground">
          Gerencie o sistema Role através dos módulos abaixo.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableModules.map((module, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(module.path)}
          >
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${module.color} text-white`}>
                  <module.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Destaques Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">Eventos Este Mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">Usuários Ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Uptime Sistema</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminV2Dashboard;