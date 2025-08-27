import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  Calendar, 
  FileText, 
  Users, 
  MessageSquare, 
  TrendingUp,
  Bell,
  Target,
  Zap,
  Mic
} from "lucide-react";

const quickActions = [
  {
    title: "Criar Destaque",
    description: "Adicionar novo destaque em destaque",
    icon: Sparkles,
    path: "/admin/highlights/create",
    bgColor: "bg-gradient-to-r from-purple-500 to-pink-500"
  },
  {
    title: "Novo Evento",
    description: "Cadastrar evento na plataforma",
    icon: Calendar,
    path: "/admin/events/create",
    bgColor: "bg-gradient-to-r from-blue-500 to-cyan-500"
  },
  {
    title: "Criar Artista",
    description: "Adicionar novo artista",
    icon: Mic,
    path: "/admin-v2/artists/create",
    bgColor: "bg-gradient-to-r from-violet-500 to-purple-500"
  },
  {
    title: "Post no Blog",
    description: "Escrever nova publicação",
    icon: FileText,
    path: "/admin/blog/create",
    bgColor: "bg-gradient-to-r from-green-500 to-emerald-500"
  },
  {
    title: "Push Notification",
    description: "Enviar notificação aos usuários",
    icon: Bell,
    path: "/admin/push-notifications",
    bgColor: "bg-gradient-to-r from-orange-500 to-red-500"
  }
];

const managementSections = [
  {
    title: "Gestão de Conteúdo",
    items: [
      { title: "Destaques", path: "/admin/highlights", icon: Sparkles },
      { title: "Eventos", path: "/admin/events", icon: Calendar },
      { title: "Artistas", path: "/admin-v2/artists", icon: Mic },
      { title: "Blog", path: "/admin/blog", icon: FileText },
    ]
  },
  {
    title: "Usuários & Comunidade",
    items: [
      { title: "Perfis", path: "/admin/profiles", icon: Users },
      { title: "Comentários", path: "/admin/comments", icon: MessageSquare },
      { title: "Organizadores", path: "/admin/organizers", icon: Users },
    ]
  },
  {
    title: "Analytics & Performance",
    items: [
      { title: "Analytics", path: "/admin/analytics", icon: TrendingUp },
      { title: "Performance", path: "/admin/performance", icon: Zap },
      { title: "AdSense", path: "/admin/adsense", icon: Target },
    ]
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao painel administrativo da Plataforma Role
        </p>
      </div>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Card 
                key={action.title} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${action.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Management Sections */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Gestão</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {managementSections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <CardTitle className="text-lg">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.title}
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Informações gerais da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">Online</div>
                <div className="text-sm text-muted-foreground">Sistema</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">98.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1.2K</div>
                <div className="text-sm text-muted-foreground">Usuários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">350</div>
                <div className="text-sm text-muted-foreground">Eventos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}