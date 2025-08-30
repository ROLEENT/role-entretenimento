import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, MailOpen, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  applications: number;
  contacts: number;
  newsletters: number;
  newApplications: number;
  newContacts: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    applications: 0,
    contacts: 0,
    newsletters: 0,
    newApplications: 0,
    newContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total applications
        const { count: totalApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true });

        // Get new applications (last 7 days)
        const { count: newApplications } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Get total contact messages
        const { count: totalContacts } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true });

        // Get new contact messages (last 7 days)
        const { count: newContacts } = await supabase
          .from('contact_messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Get total newsletter subscriptions
        const { count: totalNewsletters } = await supabase
          .from('newsletter_subscriptions')
          .select('*', { count: 'exact', head: true });

        setStats({
          applications: totalApplications || 0,
          contacts: totalContacts || 0,
          newsletters: totalNewsletters || 0,
          newApplications: newApplications || 0,
          newContacts: newContacts || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Candidaturas",
      value: stats.applications,
      description: `${stats.newApplications} novos nos últimos 7 dias`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Mensagens de Contato",
      value: stats.contacts,
      description: `${stats.newContacts} novas nos últimos 7 dias`,
      icon: Mail,
      color: "text-green-600",
    },
    {
      title: "Newsletter",
      value: stats.newsletters,
      description: "Inscrições confirmadas",
      icon: MailOpen,
      color: "text-purple-600",
    },
    {
      title: "Atividade Recente",
      value: stats.newApplications + stats.newContacts,
      description: "Total de novos itens (7 dias)",
      icon: Activity,
      color: "text-orange-600",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do painel administrativo</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do painel administrativo</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <CardDescription className="text-xs">
                {card.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Links úteis do painel administrativo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <a 
                href="/admin/applications" 
                className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Gerenciar Candidaturas</span>
              </a>
              <a 
                href="/admin/contact" 
                className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Mensagens de Contato</span>
              </a>
              <a 
                href="/admin/newsletter" 
                className="flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors"
              >
                <MailOpen className="h-4 w-4" />
                <span>Inscrições Newsletter</span>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Atividades</CardTitle>
            <CardDescription>Principais métricas dos últimos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Novas candidaturas</span>
                <span className="font-medium">{stats.newApplications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Novas mensagens</span>
                <span className="font-medium">{stats.newContacts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total de atividade</span>
                <span className="font-medium">{stats.newApplications + stats.newContacts}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};