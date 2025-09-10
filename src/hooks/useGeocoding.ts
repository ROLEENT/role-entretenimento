import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted_address: string;
}

interface UseGeocodingProps {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  enabled?: boolean;
}

export function useGeocoding({ 
  address, 
  city, 
  state, 
  country = "Brasil",
  enabled = true 
}: UseGeocodingProps) {
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!enabled || !address) {
      setCoordinates(null);
      return;
    }

    const geocodeAddress = async () => {
      setLoading(true);
      setError('');
      
      try {
        const { data, error } = await supabase.functions.invoke('geocode-address', {
          body: { address, city, state, country }
        });

        if (error) throw error;

        if (data?.latitude && data?.longitude) {
          setCoordinates({
            latitude: data.latitude,
            longitude: data.longitude
          });
        } else {
          setError('Coordenadas não encontradas');
        }
      } catch (err: any) {
        console.error('Geocoding error:', err);
        setError(err.message || 'Erro ao buscar coordenadas');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the geocoding request
    const timeoutId = setTimeout(geocodeAddress, 1000);

    return () => clearTimeout(timeoutId);
  }, [address, city, state, country, enabled]);

  return {
    coordinates,
    loading,
    error
  };
}