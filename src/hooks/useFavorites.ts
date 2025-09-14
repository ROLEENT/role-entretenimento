import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { favoriteService } from '@/services/eventService';

export interface FavoriteEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  date: string;
  image?: string;
  price?: number;
  description?: string;
  type?: 'event' | 'artist' | 'venue' | 'organizer';
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  const loadFavorites = async () => {
    if (!isAuthenticated || !user?.id) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const data = await favoriteService.getFavorites(user.id);
      const formattedFavorites = data.map((event: any) => ({
        id: event.id,
        title: event.title,
        category: event.categories?.[0]?.category?.name || 'Evento',
        city: event.city,
        date: event.start_utc || event.date_start,
        image: event.cover_url || event.image_url,
        price: event.price_from ?? event.price_min ?? 0,
        description: event.description
      }));
      setFavorites(formattedFavorites);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      toast.error('Erro ao carregar favoritos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [user, isAuthenticated]);

  const addFavorite = async (event: FavoriteEvent) => {
    if (!isAuthenticated) {
      toast.error('Faça login para adicionar favoritos');
      return;
    }

    try {
      await favoriteService.addFavorite(event.id);
      setFavorites(prev => [...prev, event]);
      toast.success('Evento adicionado aos favoritos!');
    } catch (error) {
      console.error('Erro ao adicionar favorito:', error);
      toast.error('Erro ao adicionar favorito');
    }
  };

  const removeFavorite = async (eventId: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para gerenciar favoritos');
      return;
    }

    try {
      await favoriteService.removeFavorite(eventId);
      setFavorites(prev => prev.filter(fav => fav.id !== eventId));
      toast.success('Evento removido dos favoritos!');
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      toast.error('Erro ao remover favorito');
    }
  };

  const toggleFavorite = async (eventId: string, event?: FavoriteEvent) => {
    const isFavorited = favorites.some(fav => fav.id === eventId);
    if (isFavorited) {
      await removeFavorite(eventId);
    } else {
      if (event) {
        await addFavorite(event);
      }
    }
  };

  const isFavorite = (eventId: string) => {
    return favorites.some(fav => fav.id === eventId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: loadFavorites
  };
};