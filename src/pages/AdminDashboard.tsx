
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { FileText, Calendar, MapPin, Users, MessageSquare, Tag, Image, User, Star } from "lucide-react";
import { AdminStats } from "@/components/AdminStats";

const AdminDashboard = () => {
  const { logoutAdmin, adminUser } = useAdminAuth();

  const adminCards = [
    {
      title: "Gerenciar Parceiros",
      description: "Adicionar, editar e remover parceiros",
      icon: Users,
      path: "/admin/partners",
      bgColor: "bg-blue-500/10",
      priority: "high"
    },
    {
      title: "Publicidade",
      description: "Gerenciar anúncios e banners",
      icon: Image,
      path: "/admin/advertisements",
      bgColor: "bg-red-500/10",
      priority: "high"
    },
    {
      title: "Criar Destaque",
      description: "Criar novos destaques semanais",
      icon: FileText,
      path: "/admin/highlights/create",
      bgColor: "bg-purple-500/10",
      priority: "high"
    },
    {
      title: "Destaques",
      description: "Gerenciar highlights semanais",
      icon: Star,
      path: "/admin/highlights",
      bgColor: "bg-amber-500/10",
      priority: "high"
    },
    {
      title: "Eventos",
      description: "Criar e gerenciar eventos",
      icon: Calendar,
      path: "/admin/event/create",
      bgColor: "bg-pink-500/10",
      priority: "high"
    },
    {
      title: "Mensagens de Contato",
      description: "Visualizar e responder mensagens",
      icon: MessageSquare,
      path: "/admin/contact-messages",
      bgColor: "bg-green-500/10",
      priority: "medium"
    },
    {
      title: "Histórico de Posts",
      description: "Ver, editar e excluir artigos",
      icon: FileText,
      path: "/admin/posts/history",
      bgColor: "bg-purple-400/10",
      priority: "medium"
    },
    {
      title: "Gerenciar Comentários",
      description: "Moderar comentários do blog",
      icon: MessageSquare,
      path: "/admin/comments",
      bgColor: "bg-orange-500/10",
      priority: "medium"
    },
    {
      title: "Locais",
      description: "Gerenciar venues e locais",
      icon: MapPin,
      path: "/admin/venues",
      bgColor: "bg-indigo-500/10",
      priority: "low"
    },
    {
      title: "Categorias",
      description: "Gerenciar categorias de eventos",
      icon: Tag,
      path: "/admin/categories",
      bgColor: "bg-yellow-500/10",
      priority: "low"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo, {adminUser?.full_name || adminUser?.email}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/admin/profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </Link>
          </Button>
          <Button onClick={logoutAdmin} variant="outline">Sair</Button>
        </div>
      </div>

      {/* Quick Actions - Priority Cards */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ações Prioritárias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminCards.filter(card => card.priority === 'high').map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* All Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Todas as Funcionalidades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.path} to={card.path}>
                <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-4`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      <AdminStats className="mt-8" />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Informações gerais sobre o painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm font-medium">Sistema Online</div>
            </div>
            <div className="text-center p-4 bg-blue-500/10 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Admin</div>
              <div className="text-sm font-medium">Acesso Completo</div>
            </div>
            <div className="text-center p-4 bg-purple-500/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">ROLÊ</div>
              <div className="text-sm font-medium">Plataforma Ativa</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;