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
  const contentItems: any[] = []; // Temporarily empty to show empty state

  if (contentItems.length === 0) {
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

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <FileTextIcon className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">Conteúdo em Breve</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Este artista ainda não publicou conteúdos em sua timeline. 
              Acompanhe para ser notificado sobre novos lançamentos, eventos e atualizações!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="bg-background/50">
                <HeartIcon className="w-4 h-4 mr-2" />
                Seguir atualizações
              </Button>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <ShareIcon className="w-4 h-4 mr-2" />
                Compartilhar perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ... keep existing code (content rendering logic)
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