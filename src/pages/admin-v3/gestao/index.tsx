import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Bell, BarChart3, Database, Settings, Users, Calendar, Eye, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function GestaoPage() {
  const managementFeatures = [
    {
      href: "/admin-v3/gestao/logs",
      title: "Logs do Sistema",
      description: "Visualize e monitore todas as ações administrativas realizadas no sistema",
      icon: Activity,
      color: "text-blue-600"
    },
    {
      href: "/admin-v3/gestao/notificacoes",
      title: "Notificações Push",
      description: "Configure e envie notificações push para administradores",
      icon: Bell,
      color: "text-green-600"
    },
    {
      href: "/admin-v3/gestao/analytics",
      title: "Analytics & Relatórios",
      description: "Análise detalhada de métricas, visualizações e performance",
      icon: BarChart3,
      color: "text-purple-600"
    },
    {
      href: "/admin-v3/gestao/backup",
      title: "Backup & Restore",
      description: "Gerencie backups e restauração do banco de dados",
      icon: Database,
      color: "text-red-600"
    },
    {
      href: "/admin-v3/gestao/migration-v5",
      title: "Migração V5",
      description: "Dashboard de analytics da migração V4 → V5",
      icon: Sparkles,
      color: "text-yellow-600"
    }
  ];

  const quickStats = [
    { label: "Sistema", value: "Online", icon: Settings, color: "text-green-500" },
    { label: "Usuários Ativos", value: "---", icon: Users, color: "text-blue-500" },
    { label: "Eventos Hoje", value: "---", icon: Calendar, color: "text-purple-500" },
    { label: "Visualizações", value: "---", icon: Eye, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão do Sistema</h1>
        <p className="text-muted-foreground">
          Ferramentas avançadas para administração e monitoramento
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Features */}
      <div className="grid gap-6 md:grid-cols-2">
        {managementFeatures.map((feature) => (
          <Card key={feature.href} className="group hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                {feature.title}
              </CardTitle>
              <CardDescription>
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NavLink to={feature.href}>
                <Button className="w-full group-hover:shadow-sm transition-shadow">
                  Acessar {feature.title}
                </Button>
              </NavLink>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Versão</p>
              <p className="text-lg font-semibold">Admin v3.0</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ambiente</p>
              <p className="text-lg font-semibold">Produção</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
              <p className="text-lg font-semibold">31/08/2025</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}