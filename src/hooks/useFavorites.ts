import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface FavoriteEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  date: string;
  image?: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const addFavorite = (event: FavoriteEvent) => {
    const newFavorites = [...favorites, event];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.success('Evento adicionado aos favoritos!');
  };

  const removeFavorite = (eventId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== eventId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    toast.success('Evento removido dos favoritos!');
  };

  const toggleFavorite = (event: FavoriteEvent) => {
    const isFavorite = favorites.some(fav => fav.id === event.id);
    if (isFavorite) {
      removeFavorite(event.id);
    } else {
      addFavorite(event);
    }
  };

  const isFavorite = (eventId: string) => {
    return favorites.some(fav => fav.id === eventId);
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite
  };
};