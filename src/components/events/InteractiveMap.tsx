import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useGeocoding } from '@/hooks/useGeocoding';

interface InteractiveMapProps {
  latitude?: number;
  longitude?: number;
  venueName?: string;
  address?: string;
  className?: string;
}

export function InteractiveMap({ 
  latitude, 
  longitude, 
  venueName, 
  address, 
  className = "aspect-video" 
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Use geocoding if coordinates are not provided but address is available
  const { coordinates: geocodedCoords, loading: geocoding } = useGeocoding({
    address: `${venueName || ''} ${address || ''}`.trim(),
    enabled: (!latitude || !longitude) && !!(venueName || address)
  });

  // Use provided coordinates or geocoded ones
  const finalLatitude = latitude || geocodedCoords?.latitude;
  const finalLongitude = longitude || geocodedCoords?.longitude;
  const isLoadingCoords = (!latitude || !longitude) && geocoding;

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) throw error;
        
        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          setError('Token do Mapbox não configurado');
        }
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Erro ao carregar configuração do mapa');
      } finally {
        setLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !finalLatitude || !finalLongitude) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [finalLongitude, finalLatitude],
      zoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for the venue
    new mapboxgl.Marker({
      color: '#6366f1', // Primary color
      scale: 1.2
    })
      .setLngLat([finalLongitude, finalLatitude])
      .setPopup(
        new mapboxgl.Popup()
          .setHTML(`
            <div class="p-2">
              <h4 class="font-medium">${venueName || 'Local do evento'}</h4>
              ${address ? `<p class="text-sm text-gray-600">${address}</p>` : ''}
              ${!latitude && !longitude ? `<p class="text-xs text-gray-500">📍 Localização aproximada</p>` : ''}
            </div>
          `)
      )
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, finalLatitude, finalLongitude, venueName, address, latitude, longitude]);

  const generateMapsUrls = () => {
    const fullAddress = `${venueName || ''} ${address || ''}`.trim();
    const coords = finalLatitude && finalLongitude ? `${finalLatitude},${finalLongitude}` : '';
    
    return {
      google: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress || coords)}`,
      apple: `https://maps.apple.com/?daddr=${encodeURIComponent(fullAddress || coords)}`,
      waze: finalLatitude && finalLongitude ? `https://waze.com/ul?ll=${finalLatitude},${finalLongitude}&navigate=yes` : ''
    };
  };

  if (loading || isLoadingCoords) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
          <p className="text-sm">
            {loading ? 'Carregando mapa...' : 'Buscando localização...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} bg-muted rounded-lg flex flex-col items-center justify-center p-6 text-center`}>
        <MapPin className="h-8 w-8 mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Mapa Indisponível</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {error}
        </p>
        {latitude && longitude && (
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(generateMapsUrls().google, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Google Maps
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(generateMapsUrls().apple, '_blank')}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Apple Maps
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!finalLatitude || !finalLongitude) {
    const fullAddress = `${venueName || ''} ${address || ''}`.trim();
    
    return (
      <div className={`${className} bg-muted rounded-lg flex flex-col items-center justify-center p-6 text-center`}>
        <MapPin className="h-8 w-8 mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Localização Indisponível</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Não foi possível determinar a localização exata
        </p>
        {fullAddress && (
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(fullAddress)}`, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Buscar no Google Maps
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border relative`}>
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Action buttons overlay */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => window.open(generateMapsUrls().google, '_blank')}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
        >
          <Navigation className="h-4 w-4" />
          Como Chegar
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open(generateMapsUrls().waze, '_blank')}
          className="flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white/95"
        >
          🚗 Waze
        </Button>
      </div>
    </div>
  );
}