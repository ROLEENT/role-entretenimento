import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useProfileMedia } from "../hooks/useProfileMedia";
import { ProfileContentSkeleton } from "@/components/skeletons/ProfileContentSkeleton";
import { EnhancedGallery } from "@/components/ui/enhanced-gallery";

interface ProfilePortfolioProps {
  profileUserId: string;
}

export function ProfilePortfolio({ profileUserId }: ProfilePortfolioProps) {
  const { data: media, isLoading, error } = useProfileMedia(profileUserId);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number | null>(null);

  if (isLoading) {
    return <ProfileContentSkeleton />;
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

  // Convert media to gallery format
  const galleryImages = media.map(item => ({
    id: item.id,
    url: item.url,
    alt: item.alt_text || 'Portfolio item',
    caption: item.caption,
    type: item.type as 'image' | 'video',
    thumbnail: item.url
  }));

  return (
    <EnhancedGallery
      images={galleryImages}
      variant="hero"
      columns={3}
      showCaptions={true}
      enableLightbox={true}
      className="w-full"
    />
  );
}