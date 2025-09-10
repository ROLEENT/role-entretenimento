import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  eventId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
}

export function FavoriteButton({ eventId, className, size = 'sm', variant = 'ghost' }: FavoriteButtonProps) {
  const { isFavorite, removeFavorite } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  
  const isFav = isFavorite(eventId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isFav) {
      // Para adicionar favorito, seria necessário ter os dados completos do evento
      // Por enquanto, apenas permite remover
      return;
    }
    
    setIsLoading(true);
    try {
      await removeFavorite(eventId);
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading || !isFav}
      className={cn(
        variant === 'ghost' && "p-2 h-auto bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50",
        className
      )}
      aria-label={isFav ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isFav ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        )} 
      />
    </Button>
  );
}