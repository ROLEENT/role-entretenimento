import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MailOpen, Activity } from "lucide-react";
import { useAdminDashboardCounts } from "@/hooks/useAdminDashboardCounts";

export const AdminDashboard = () => {
  const { counts, loading, error } = useAdminDashboardCounts();
  const navigate = useNavigate();

  const statCards = counts ? [
    {
      title: "Contatos",
      value: counts.contacts.total,
      description: `${counts.contacts.last_7d} novos nos últimos 7 dias`,
      icon: Mail,
      color: "text-green-600",
      href: "/admin/contact",
    },
    {
      title: "Newsletter",
      value: counts.newsletter.total,
      description: `${counts.newsletter.last_7d} novos nos últimos 7 dias`,
      icon: MailOpen,
      color: "text-purple-600",
      href: "/admin/newsletter",
    },
    {
      title: "Candidaturas",
      value: counts.job_applications.total,
      description: `${counts.job_applications.last_7d} novos nos últimos 7 dias`,
      icon: Users,
      color: "text-blue-600",
      href: "/admin/applications",
    },
  ] : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do painel administrativo</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do painel administrativo</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Erro ao carregar dados: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do painel administrativo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((card, index) => (
          <Card 
            key={index} 
            className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]"
            onClick={() => navigate(card.href)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
              <div className="mt-3 text-xs font-medium text-primary">
                Ver lista →
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Atividades</CardTitle>
          <CardDescription>Principais métricas dos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Novos contatos</span>
              <span className="font-medium">{counts?.contacts.last_7d || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Newsletter inscrições</span>
              <span className="font-medium">{counts?.newsletter.last_7d || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Novas candidaturas</span>
              <span className="font-medium">{counts?.job_applications.last_7d || 0}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-medium">Total de atividade</span>
              <span className="font-bold">
                {(counts?.contacts.last_7d || 0) + (counts?.newsletter.last_7d || 0) + (counts?.job_applications.last_7d || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};