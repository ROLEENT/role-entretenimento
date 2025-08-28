import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Activity } from "lucide-react";

import { withAdminAuth } from '@/components/withAdminAuth';

function AdminProfiles() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfis de Usuários</h1>
        <p className="text-muted-foreground">
          Gestão de perfis e atividades dos usuários
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Total de Usuários
            </CardTitle>
            <CardDescription>1,234 usuários registrados</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Usuários Ativos
            </CardTitle>
            <CardDescription>892 usuários ativos este mês</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Novos Usuários
            </CardTitle>
            <CardDescription>45 novos usuários esta semana</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminProfiles, 'admin');