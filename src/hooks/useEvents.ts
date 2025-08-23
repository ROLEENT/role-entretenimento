import { useState, useEffect } from 'react';
import { eventService, favoriteService, type EventFilters } from '@/services/eventService';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export const useEvents = (filters: EventFilters = {}, limit = 20) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, [JSON.stringify(filters), limit]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEvents(filters, limit);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      toast({
        title: "Erro",
        description: "Falha ao carregar eventos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents
  };
};

export const useNearbyEvents = (lat?: number, lng?: number, radiusKm = 50) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat && lng) {
      fetchNearbyEvents();
    }
  }, [lat, lng, radiusKm]);

  const fetchNearbyEvents = async () => {
    if (!lat || !lng) return;

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getNearbyEvents(lat, lng, radiusKm);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby events');
      toast({
        title: "Erro",
        description: "Falha ao carregar eventos próximos. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    refetch: fetchNearbyEvents
  };
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const data = await favoriteService.getFavorites(user.id);
      setFavorites(data);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao carregar favoritos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para favoritar eventos.",
        variant: "destructive"
      });
      return;
    }

    try {
      await favoriteService.addFavorite(eventId);
      await fetchFavorites();
      toast({
        title: "Sucesso",
        description: "Evento adicionado aos favoritos!"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao adicionar aos favoritos.",
        variant: "destructive"
      });
    }
  };

  const removeFavorite = async (eventId: string) => {
    if (!user) return;

    try {
      await favoriteService.removeFavorite(eventId);
      await fetchFavorites();
      toast({
        title: "Sucesso",
        description: "Evento removido dos favoritos!"
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: "Falha ao remover dos favoritos.",
        variant: "destructive"
      });
    }
  };

  const isFavorited = (eventId: string) => {
    return favorites.some(fav => fav.id === eventId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorited,
    refetch: fetchFavorites
  };
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (err) => {
        setError('Erro ao obter localização: ' + err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    location,
    loading,
    error,
    requestLocation
  };
};