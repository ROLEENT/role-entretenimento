import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserRoleData {
  user_email: string;
  profile_role: 'admin' | 'editor';
  profile_is_admin: boolean;
  in_approved_admins: boolean;
  in_admin_users: boolean;
  is_consistent: boolean;
}

interface SystemStats {
  total_profiles: number;
  total_admins: number;
  total_editors: number;
  approved_admins: number;
  admin_users: number;
  inconsistent_users: number;
}

export const RoleManagement = () => {
  const [roleData, setRoleData] = useState<UserRoleData[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar dados de consistência de roles
      const { data: roles, error: rolesError } = await supabase
        .rpc('validate_role_consistency');
      
      if (rolesError) throw rolesError;
      
      // Carregar estatísticas do sistema
      const { data: stats, error: statsError } = await supabase
        .rpc('debug_auth_system');
      
      if (statsError) throw statsError;
      
      setRoleData(roles || []);
      setSystemStats(stats || null);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados de roles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inconsistentUsers = roleData.filter(user => !user.is_consistent);
  const adminUsers = roleData.filter(user => user.profile_role === 'admin');
  const editorUsers = roleData.filter(user => user.profile_role === 'editor');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Roles e Permissões</h1>
        <p className="text-muted-foreground">
          Monitor e gerencie roles de usuários e consistência do sistema
        </p>
      </div>

      {/* Estatísticas do Sistema */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.total_profiles}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.total_admins} admins, {systemStats.total_editors} editores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins Aprovados</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.approved_admins}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.admin_users} usuários admin ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inconsistências</CardTitle>
              {systemStats.inconsistent_users > 0 ? (
                <AlertTriangle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle className="h-4 w-4 text-success" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.inconsistent_users}</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.inconsistent_users === 0 ? 'Todos consistentes' : 'Requer atenção'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alertas de Inconsistência */}
      {inconsistentUsers.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{inconsistentUsers.length} usuário(s)</strong> com inconsistências de role detectadas. 
            Verifique a aba "Inconsistências" para detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs de Gerenciamento */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="admins">Administradores</TabsTrigger>
          <TabsTrigger value="editors">Editores</TabsTrigger>
          <TabsTrigger value="inconsistencies">
            Inconsistências {inconsistentUsers.length > 0 && (
              <Badge variant="destructive" className="ml-2">{inconsistentUsers.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Usuários</CardTitle>
              <CardDescription>
                Lista completa de usuários com suas roles e status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleTable users={roleData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Administradores</CardTitle>
              <CardDescription>
                Usuários com privilégios administrativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleTable users={adminUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="editors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Editores</CardTitle>
              <CardDescription>
                Usuários com privilégios de edição
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserRoleTable users={editorUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inconsistencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inconsistências Detectadas</CardTitle>
              <CardDescription>
                Usuários com roles inconsistentes entre tabelas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inconsistentUsers.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
                  <p className="text-lg font-medium">Nenhuma inconsistência detectada</p>
                  <p className="text-muted-foreground">Todos os usuários têm roles consistentes</p>
                </div>
              ) : (
                <UserRoleTable users={inconsistentUsers} showInconsistencies />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={loadData} variant="outline">
          Atualizar Dados
        </Button>
      </div>
    </div>
  );
};

interface UserRoleTableProps {
  users: UserRoleData[];
  showInconsistencies?: boolean;
}

const UserRoleTable = ({ users, showInconsistencies = false }: UserRoleTableProps) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Role</th>
            <th className="text-left p-2">Is Admin</th>
            <th className="text-left p-2">Approved</th>
            <th className="text-left p-2">Admin User</th>
            <th className="text-left p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-b">
              <td className="p-2 font-medium">{user.user_email}</td>
              <td className="p-2">
                <Badge variant={user.profile_role === 'admin' ? 'default' : 'secondary'}>
                  {user.profile_role}
                </Badge>
              </td>
              <td className="p-2">
                <Badge variant={user.profile_is_admin ? 'default' : 'outline'}>
                  {user.profile_is_admin ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="p-2">
                <Badge variant={user.in_approved_admins ? 'default' : 'outline'}>
                  {user.in_approved_admins ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="p-2">
                <Badge variant={user.in_admin_users ? 'default' : 'outline'}>
                  {user.in_admin_users ? 'Sim' : 'Não'}
                </Badge>
              </td>
              <td className="p-2">
                <Badge variant={user.is_consistent ? 'default' : 'destructive'}>
                  {user.is_consistent ? 'Consistente' : 'Inconsistente'}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};