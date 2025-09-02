import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, PlayIcon } from "lucide-react";
import { ProfileMedia } from "@/features/profiles/hooks/useProfileMedia";

interface MediaModalProps {
  media: ProfileMedia[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaModal({ media, initialIndex, isOpen, onClose }: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  if (!media.length || currentIndex >= media.length) return null;

  const currentMedia = media[currentIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 bg-black/95 border-none">
        <DialogTitle className="sr-only">
          Visualizar mídia {currentIndex + 1} de {media.length}
        </DialogTitle>
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
          <div className="text-white/80 text-sm">
            {currentIndex + 1} de {media.length}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Buttons */}
        {media.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white hover:bg-white/10"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Media Content */}
        <div className="flex items-center justify-center w-full h-full p-8">
          {currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt={currentMedia.alt_text || 'Imagem do perfil'}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: 'calc(90vh - 120px)' }}
            />
          ) : (
            <div className="relative">
              <video
                src={currentMedia.url}
                controls
                className="max-w-full max-h-full object-contain"
                style={{ maxHeight: 'calc(90vh - 120px)' }}
                autoPlay
              >
                Seu navegador não suporta o elemento video.
              </video>
            </div>
          )}
        </div>

        {/* Caption */}
        {currentMedia.caption && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg p-4">
              <p className="text-white text-sm">{currentMedia.caption}</p>
            </div>
          </div>
        )}

        {/* Thumbnails Navigation */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2">
              {media.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`relative w-12 h-12 rounded overflow-hidden transition-all ${
                    index === currentIndex 
                      ? 'ring-2 ring-white scale-110' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <PlayIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}