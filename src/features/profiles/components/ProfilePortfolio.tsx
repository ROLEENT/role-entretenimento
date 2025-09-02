import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play, Image as ImageIcon } from "lucide-react";
import { useProfileMedia } from "../hooks/useProfileMedia";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";

interface ProfilePortfolioProps {
  profileUserId: string;
}

export function ProfilePortfolio({ profileUserId }: ProfilePortfolioProps) {
  const { data: media, isLoading, error } = useProfileMedia(profileUserId);

  if (isLoading) {
    return <ProfileContentSkeleton type="portfolio" />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Erro ao carregar portfólio</p>
        </CardContent>
      </Card>
    );
  }

  if (!media || media.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-16 h-16 text-primary mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-semibold mb-3 text-primary">Portfólio Vazio</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
              Este artista ainda não adicionou fotos ou vídeos ao seu portfólio. 
              Que tal ser o primeiro a descobrir seu trabalho?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" className="bg-background/50">
                Sugerir conteúdo
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                Entrar em contato
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {media.map((item) => (
        <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
          <AspectRatio ratio={16 / 9}>
            <div className="relative w-full h-full">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.alt_text || 'Portfolio item'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative w-full h-full bg-muted flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary opacity-80" />
                  <div className="absolute inset-0 bg-black/20" />
                </div>
              )}
              
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">{item.caption}</p>
                </div>
              )}
            </div>
          </AspectRatio>
        </Card>
      ))}
    </div>
  );
}