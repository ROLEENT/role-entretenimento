import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GalleryImage {
  id: string;
  url: string;
  alt?: string;
  caption?: string;
  type?: 'image' | 'video';
  thumbnail?: string;
}

interface EnhancedGalleryProps {
  images: GalleryImage[];
  variant?: 'grid' | 'masonry' | 'carousel' | 'hero';
  columns?: 2 | 3 | 4;
  showCaptions?: boolean;
  enableLightbox?: boolean;
  maxHeight?: number;
  className?: string;
  onImageClick?: (image: GalleryImage, index: number) => void;
}

const ImageItem = ({ 
  image, 
  index, 
  onClick,
  variant = 'grid',
  showCaptions = true,
  className 
}: {
  image: GalleryImage;
  index: number;
  onClick?: () => void;
  variant?: 'grid' | 'masonry' | 'carousel' | 'hero';
  showCaptions?: boolean;
  className?: string;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const aspectRatio = variant === 'masonry' 
    ? Math.random() > 0.5 ? 'aspect-[4/3]' : 'aspect-[3/4]'
    : 'aspect-square';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "group relative overflow-hidden rounded-lg cursor-pointer",
        aspectRatio,
        className
      )}
      onClick={onClick}
    >
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error placeholder */}
      {hasError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted-foreground/20 rounded-full mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Erro ao carregar</p>
          </div>
        </div>
      )}

      {/* Image */}
      <img
        src={image.thumbnail || image.url}
        alt={image.alt || `Imagem ${index + 1}`}
        className={cn(
          "w-full h-full object-cover transition-all duration-300",
          "group-hover:scale-110",
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        loading="lazy"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      
      {/* Hover actions */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="sm"
          className="backdrop-blur-sm bg-background/80"
        >
          <ZoomIn className="h-4 w-4 mr-2" />
          Ver
        </Button>
      </div>

      {/* Video indicator */}
      {image.type === 'video' && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs">
            Vídeo
          </Badge>
        </div>
      )}

      {/* Caption */}
      {showCaptions && image.caption && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white text-sm line-clamp-2">
            {image.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
};

const Lightbox = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  const currentImage = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Image counter */}
      <div className="absolute top-4 left-4 z-10">
        <Badge variant="secondary" className="bg-black/50 text-white">
          {currentIndex + 1} de {images.length}
        </Badge>
      </div>

      {/* Actions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" className="bg-black/50 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="secondary" size="sm" className="bg-black/50 text-white">
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </>
      )}

      {/* Main image */}
      <motion.div
        key={currentIndex}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.alt || `Imagem ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </motion.div>

      {/* Caption */}
      {currentImage.caption && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10 max-w-lg text-center">
          <p className="text-white text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
            {currentImage.caption}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export function EnhancedGallery({
  images,
  variant = 'grid',
  columns = 3,
  showCaptions = true,
  enableLightbox = true,
  maxHeight,
  className,
  onImageClick
}: EnhancedGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleImageClick = (image: GalleryImage, index: number) => {
    if (onImageClick) {
      onImageClick(image, index);
    } else if (enableLightbox) {
      setLightboxIndex(index);
    }
  };

  const handleLightboxNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const handleLightboxPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
          <ZoomIn className="h-8 w-8" />
        </div>
        <p>Nenhuma imagem disponível</p>
      </div>
    );
  }

  // Hero variant - primeira imagem em destaque
  if (variant === 'hero' && images.length > 0) {
    const heroImage = images[0];
    const otherImages = images.slice(1);

    return (
      <div className={cn("space-y-4", className)}>
        {/* Hero image */}
        <ImageItem
          image={heroImage}
          index={0}
          onClick={() => handleImageClick(heroImage, 0)}
          variant="hero"
          showCaptions={showCaptions}
          className="col-span-full h-64 md:h-80"
        />

        {/* Other images grid */}
        {otherImages.length > 0 && (
          <div className={cn(
            "grid gap-4",
            `grid-cols-${Math.min(columns, otherImages.length)}`
          )}>
            {otherImages.map((image, index) => (
              <ImageItem
                key={image.id}
                image={image}
                index={index + 1}
                onClick={() => handleImageClick(image, index + 1)}
                variant={variant}
                showCaptions={showCaptions}
              />
            ))}
          </div>
        )}

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <Lightbox
              images={images}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNext={handleLightboxNext}
              onPrev={handleLightboxPrev}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Carousel variant
  if (variant === 'carousel') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {images.map((image, index) => (
            <ImageItem
              key={image.id}
              image={image}
              index={index}
              onClick={() => handleImageClick(image, index)}
              variant={variant}
              showCaptions={showCaptions}
              className="flex-shrink-0 w-64"
            />
          ))}
        </div>

        {/* Lightbox */}
        <AnimatePresence>
          {lightboxIndex !== null && (
            <Lightbox
              images={images}
              currentIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
              onNext={handleLightboxNext}
              onPrev={handleLightboxPrev}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Grid variant (padrão)
  return (
    <div className={cn("space-y-4", className)}>
      <div 
        className={cn(
          "grid gap-4",
          variant === 'masonry' ? 'grid-cols-2 md:grid-cols-3' : `grid-cols-2 md:grid-cols-${columns}`
        )}
        style={maxHeight ? { maxHeight: `${maxHeight}px`, overflowY: 'auto' } : undefined}
      >
        {images.map((image, index) => (
          <ImageItem
            key={image.id}
            image={image}
            index={index}
            onClick={() => handleImageClick(image, index)}
            variant={variant}
            showCaptions={showCaptions}
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            currentIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNext={handleLightboxNext}
            onPrev={handleLightboxPrev}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
