import { Card, CardContent } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Play, Image as ImageIcon } from "lucide-react";
import { useProfileMedia } from "../hooks/useProfileMedia";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProfilePortfolioProps {
  profileUserId: string;
}

export function ProfilePortfolio({ profileUserId }: ProfilePortfolioProps) {
  const { data: media, isLoading, error } = useProfileMedia(profileUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
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
      <Card>
        <CardContent className="p-6 text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma mídia encontrada</h3>
          <p className="text-muted-foreground">
            Este perfil ainda não possui fotos ou vídeos em seu portfólio.
          </p>
        </CardContent>
      </Card>
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