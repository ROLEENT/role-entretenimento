import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Activity, Users, Database, AlertTriangle } from 'lucide-react';

interface AuditStatsProps {
  adminEmail: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AuditStats({ adminEmail }: AuditStatsProps) {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['audit-stats', adminEmail],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_audit_statistics');
      if (error) throw error;
      return data[0];
    },
    enabled: !!adminEmail
  });

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Erro ao carregar estatísticas: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse bg-muted h-20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const actionData = stats?.actions_by_type ? 
    Object.entries(stats.actions_by_type).map(([key, value]) => ({
      name: key,
      value: value as number
    })) : [];

  const tableData = stats?.actions_by_table ? 
    Object.entries(stats.actions_by_table)
      .map(([key, value]) => ({ name: key, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) : [];

  const adminData = stats?.actions_by_admin ? 
    Object.entries(stats.actions_by_admin)
      .map(([key, value]) => ({ name: key, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5) : [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_actions || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Ações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_admins || 0}</p>
                <p className="text-sm text-muted-foreground">Admins Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Database className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{tableData.length}</p>
                <p className="text-sm text-muted-foreground">Tabelas Auditadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {stats?.actions_by_type?.DELETE || 0}
                </p>
                <p className="text-sm text-muted-foreground">Exclusões</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actions by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Ações por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={actionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Tables */}
        <Card>
          <CardHeader>
            <CardTitle>Tabelas Mais Modificadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tableData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Admins Mais Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminData.map((admin, index) => (
              <div key={admin.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{admin.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress 
                    value={(admin.value / (adminData[0]?.value || 1)) * 100} 
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground min-w-[2rem]">
                    {admin.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}