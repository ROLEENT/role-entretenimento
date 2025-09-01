import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartIcon, MessageCircleIcon, ShareIcon, CalendarIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProfileContentTabProps {
  profile: Profile;
}

export function ProfileContentTab({ profile }: ProfileContentTabProps) {
  // Mock content data - replace with real data
  const contentItems = [
    {
      id: "1",
      type: "post",
      title: "Novo single disponível em todas as plataformas!",
      content: "Estou muito feliz em compartilhar minha nova música com vocês. Foi um trabalho de meses e espero que gostem do resultado.",
      date: new Date(2024, 8, 15),
      likes: 234,
      comments: 45,
      image: "/placeholder.svg",
      tags: ["música", "single", "lançamento"]
    },
    {
      id: "2", 
      type: "event-announcement",
      title: "Festival de Verão 2024 - Lineup confirmado!",
      content: "Muito animado para estar no lineup deste festival incrível. Nos vemos na praia!",
      date: new Date(2024, 8, 10),
      likes: 156,
      comments: 28,
      image: "/placeholder.svg",
      tags: ["festival", "verão", "lineup"]
    },
    {
      id: "3",
      type: "release",
      title: "Behind the scenes do novo videoclipe",
      content: "Algumas fotos dos bastidores da gravação. Foi uma experiência incrível trabalhar com essa equipe talentosa.",
      date: new Date(2024, 8, 5),
      likes: 89,
      comments: 12,
      image: "/placeholder.svg",
      tags: ["videoclipe", "bastidores", "produção"]
    }
  ];

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'event-announcement':
        return <CalendarIcon className="h-4 w-4" />;
      case 'release':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getContentLabel = (type: string) => {
    switch (type) {
      case 'event-announcement':
        return 'Evento';
      case 'release':
        return 'Lançamento';
      default:
        return 'Post';
    }
  };

  const ContentCard = ({ item }: { item: any }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{profile.name}</span>
              <span className="text-sm text-muted-foreground">@{profile.handle}</span>
              <Badge variant="secondary" className="text-xs">
                {getContentIcon(item.type)}
                <span className="ml-1">{getContentLabel(item.type)}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(item.date, "dd 'de' MMM", { locale: ptBR })}
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.content}</p>
            </div>
            
            {item.image && (
              <div className="rounded-lg overflow-hidden bg-muted">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  {item.likes}
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageCircleIcon className="h-4 w-4 mr-1" />
                  {item.comments}
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ShareIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Timeline de Conteúdos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Acompanhe as últimas novidades, lançamentos e atualizações do perfil.
          </p>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {contentItems.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
      
      <div className="text-center py-8">
        <Button variant="outline">Carregar mais conteúdos</Button>
      </div>
    </div>
  );
}