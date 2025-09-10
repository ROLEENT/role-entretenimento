import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    // In a production app, this would come from environment variables or Supabase secrets
    // For now, we'll show an input for the user to enter their token
    const savedToken = localStorage.getItem('mapbox_token');
    if (savedToken) {
      setMapboxToken(savedToken);
    } else {
      setShowTokenInput(true);
    }
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || !latitude || !longitude) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [longitude, latitude],
      zoom: 15
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add marker for the venue
    new mapboxgl.Marker({
      color: '#6366f1', // Primary color
      scale: 1.2
    })
      .setLngLat([longitude, latitude])
      .setPopup(
        new mapboxgl.Popup()
          .setHTML(`
            <div class="p-2">
              <h4 class="font-medium">${venueName || 'Local do evento'}</h4>
              ${address ? `<p class="text-sm text-gray-600">${address}</p>` : ''}
            </div>
          `)
      )
      .addTo(map.current);

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, latitude, longitude, venueName, address]);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      localStorage.setItem('mapbox_token', tokenInput.trim());
      setMapboxToken(tokenInput.trim());
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className={`${className} bg-muted rounded-lg flex flex-col items-center justify-center p-6 text-center`}>
        <MapPin className="h-8 w-8 mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Configure o Mapa Interativo</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          Para exibir o mapa interativo, você precisa configurar sua chave do Mapbox.
          <a 
            href="https://mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline ml-1"
          >
            Obtenha sua chave aqui
          </a>
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <input
            type="text"
            placeholder="Cole sua chave pública do Mapbox"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <Button 
            onClick={handleTokenSubmit} 
            size="sm"
            disabled={!tokenInput.trim()}
          >
            Carregar Mapa
          </Button>
        </div>
      </div>
    );
  }

  if (!latitude || !longitude) {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Localização não disponível</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border`}>
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}