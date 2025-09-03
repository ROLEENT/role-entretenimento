import { useState } from "react";
import { Image as ImageIcon, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Profile } from "@/features/profiles/api";
import { useProfileMedia } from "@/features/profiles/hooks/useProfileMedia";

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

export function ProfileMediaGridMobile({ profile }: ProfileMediaGridMobileProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const { data: mediaData = [], isLoading } = useProfileMedia(profile.user_id);
  
  // Convert media data to MediaItem format
  const mediaItems: MediaItem[] = mediaData.map(item => ({
    id: item.id,
    url: item.url,
    type: item.type,
    alt: item.alt_text || item.caption || "Mídia",
  }));

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
            className="relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedMedia(item)}
          >
            <img
              src={item.url}
              alt={item.alt || "Mídia"}
              className="w-full h-full object-cover"
            />
            
            {item.type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Media Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-screen-sm p-0">
          {selectedMedia && (
            <div className="w-full">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || "Mídia"}
                  className="w-full h-auto"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  className="w-full h-auto"
                  poster={selectedMedia.thumbnail}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}