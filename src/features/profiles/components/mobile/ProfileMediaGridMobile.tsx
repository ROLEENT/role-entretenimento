import { useState, memo, useCallback, useMemo } from "react";
import { Image as ImageIcon, Play, Share2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile } from "@/features/profiles/api";
import { useProfileMedia } from "@/features/profiles/hooks/useProfileMedia";
import { useAnimatedToast } from "@/hooks/useAnimatedToast";
import { LazyImage } from "@/components/ui/lazy-image";

interface ProfileMediaGridMobileProps {
  profile: Profile;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  alt?: string;
}

export const ProfileMediaGridMobile = memo(function ProfileMediaGridMobile({ profile }: ProfileMediaGridMobileProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const { data: mediaData = [], isLoading } = useProfileMedia(profile.user_id);
  const { showAnimatedToast } = useAnimatedToast();
  
  // Convert media data to MediaItem format
  const mediaItems: MediaItem[] = useMemo(() => 
    mediaData.map(item => ({
      id: item.id,
      url: item.url,
      type: item.type,
      alt: item.alt_text || item.caption || "Mídia",
    })), [mediaData]
  );

  const handleMediaClick = useCallback((item: MediaItem) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    setSelectedMedia(item);
  }, []);

  const handleShare = useCallback(async (media: MediaItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Mídia de ${profile.name}`,
          url: media.url,
        });
        showAnimatedToast({
          title: "Compartilhado com sucesso!",
          icon: "share"
        });
      } else {
        await navigator.clipboard.writeText(media.url);
        showAnimatedToast({
          title: "Link copiado!",
          description: "Link da mídia copiado para área de transferência",
          icon: "copy"
        });
      }
    } catch (error) {
      showAnimatedToast({
        title: "Erro ao compartilhar",
        description: "Tente novamente"
      });
    }
  }, [profile.name, showAnimatedToast]);

  const handleDownload = useCallback(async (media: MediaItem) => {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `media-${media.id}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      showAnimatedToast({
        title: "Download iniciado!",
        icon: "success"
      });
    } catch (error) {
      showAnimatedToast({
        title: "Erro no download",
        description: "Tente novamente"
      });
    }
  }, [showAnimatedToast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (mediaItems.length === 0) {
    return (
      <div className="text-center py-8">
        <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Nenhuma mídia encontrada
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1">
        {mediaItems.map((item) => (
          <div 
            key={item.id}
            className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={() => handleMediaClick(item)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleMediaClick(item);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`Ver ${item.type === 'video' ? 'vídeo' : 'imagem'}: ${item.alt}`}
          >
            <LazyImage
              src={item.url}
              alt={item.alt || "Mídia"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      {/* Enhanced Media Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-screen-sm p-0">
          {selectedMedia && (
            <>
              <DialogHeader className="p-4 pb-0">
                <DialogTitle className="sr-only">
                  {selectedMedia.type === 'video' ? 'Vídeo' : 'Imagem'} de {profile.name}
                </DialogTitle>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(selectedMedia)}
                    aria-label="Compartilhar mídia"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(selectedMedia)}
                    aria-label="Baixar mídia"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="w-full">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.alt || "Mídia"}
                    className="w-full h-auto"
                    loading="eager"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    className="w-full h-auto"
                    poster={selectedMedia.thumbnail}
                    preload="metadata"
                  />
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
});