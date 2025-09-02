import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartIcon, MessageCircleIcon, ShareIcon, CalendarIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { Profile } from "@/features/profiles/api";
import { useProfileContent } from "@/features/profiles/hooks/useProfileContent";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentTabProps {
  profile: Profile;
}

export function ProfileContentTab({ profile }: ProfileContentTabProps) {
  const { data: contentItems = [], isLoading } = useProfileContent(profile.handle, profile.type);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Timeline de Conteúdos</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-5 w-20" />
                    </div>
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">{item.author_name || profile.name}</span>
              <span className="text-sm text-muted-foreground">@{profile.handle}</span>
              <Badge variant="secondary" className="text-xs bg-[hsl(var(--primary))] text-primary-foreground">
                {getContentIcon(item.type)}
                <span className="ml-1">{getContentLabel(item.type)}</span>
              </Badge>
              <span className="text-sm text-muted-foreground">
                {format(new Date(item.created_at), "dd 'de' MMM", { locale: ptBR })}
              </span>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-lg leading-tight">{item.title}</h3>
              {item.summary && (
                <p className="text-muted-foreground mb-3">{item.summary}</p>
              )}
            </div>
            
            {item.cover_image && (
              <div className="rounded-lg overflow-hidden bg-muted">
                <img 
                  src={item.cover_image} 
                  alt={item.title}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.tags.slice(0, 5).map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs hover:bg-accent cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
                {item.tags.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 5}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                  <HeartIcon className="h-4 w-4 mr-1" />
                  <span className="sr-only">Curtir</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <MessageCircleIcon className="h-4 w-4 mr-1" />
                  <span className="sr-only">Comentar</span>
                </Button>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ShareIcon className="h-4 w-4" />
                <span className="sr-only">Compartilhar</span>
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