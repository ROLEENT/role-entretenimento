import { Profile } from "@/features/profiles/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Camera, FileText, ArrowRight } from "lucide-react";

interface ProfileOverviewNewProps {
  profile: Profile;
  onTabChange: (tab: string) => void;
}

export function ProfileOverviewNew({ profile, onTabChange }: ProfileOverviewNewProps) {
  const quickActions = [
    {
      icon: Calendar,
      title: 'Próximos Eventos',
      description: 'Veja os próximos eventos agendados',
      tab: 'agenda',
      count: Math.floor(Math.random() * 10) + 1
    },
    {
      icon: FileText,
      title: 'Conteúdos',
      description: 'Artigos, entrevistas e materiais',
      tab: 'conteudos',
      count: Math.floor(Math.random() * 20) + 1
    },
    {
      icon: Camera,
      title: 'Galeria',
      description: 'Fotos e vídeos dos shows',
      tab: 'fotos-videos',
      count: Math.floor(Math.random() * 50) + 10
    }
  ];

  return (
    <div className="space-y-6">
      {/* Bio Completa */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle>Sobre</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.tab}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onTabChange(action.tab)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                      <span className="text-xs text-primary font-medium">
                        {action.count} itens
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Novo evento adicionado', time: '2 dias atrás', type: 'event' },
              { action: 'Foto adicionada à galeria', time: '1 semana atrás', type: 'media' },
              { action: 'Perfil atualizado', time: '2 semanas atrás', type: 'profile' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-semibold mb-2">Gostou do perfil?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Siga para receber notificações sobre novos eventos e conteúdos
          </p>
          <Button size="sm">
            Seguir Perfil
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}