import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mapbox token - em produção, adicione como secret no Supabase
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'; // Placeholder

interface EventLocation {
  id: string;
  title: string;
  city: string;
  venue?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  price_min?: number;
  date_start: string;
  image_url?: string;
}

interface EventsMapProps {
  events: EventLocation[];
  onEventSelect?: (eventId: string) => void;
  className?: string;
}

const EventsMap: React.FC<EventsMapProps> = ({ 
  events, 
  onEventSelect, 
  className = "h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxApiKey, setMapboxApiKey] = useState(MAPBOX_TOKEN);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example'));

  useEffect(() => {
    if (!mapContainer.current || !mapboxApiKey || mapboxApiKey.includes('example')) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxApiKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-46.6333, -23.5505], // São Paulo as default center
        zoom: 10,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Add attribution
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true
        })
      );

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowApiKeyInput(true);
    }
  }, [mapboxApiKey]);

  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const eventsWithLocation = events.filter(event => 
      event.venue?.lat && event.venue?.lng
    );

    if (eventsWithLocation.length === 0) return;

    // Add markers for each event
    eventsWithLocation.forEach(event => {
      if (!event.venue?.lat || !event.venue?.lng) return;

      // Create marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div class="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'max-w-xs';
      popupContent.innerHTML = `
        <div class="space-y-2">
          ${event.image_url ? `<img src="${event.image_url}" alt="${event.title}" class="w-full h-24 object-cover rounded-md">` : ''}
          <div>
            <h3 class="font-semibold text-sm line-clamp-2">${event.title}</h3>
            <p class="text-xs text-muted-foreground flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${event.venue.name}
            </p>
            <p class="text-xs text-muted-foreground">
              ${new Date(event.date_start).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            ${event.price_min ? `<p class="text-xs font-medium">A partir de R$ ${event.price_min}</p>` : ''}
          </div>
          <button 
            onclick="window.location.href='/evento/${event.id}'"
            class="w-full bg-primary text-primary-foreground text-xs py-1 px-2 rounded hover:bg-primary/90 transition-colors flex items-center justify-center gap-1"
          >
            Ver evento
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 7h10v10"/>
              <path d="M7 17 17 7"/>
            </svg>
          </button>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setDOMContent(popupContent);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([event.venue.lng, event.venue.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (onEventSelect) {
          onEventSelect(event.id);
        }
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (eventsWithLocation.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      eventsWithLocation.forEach(event => {
        if (event.venue?.lat && event.venue?.lng) {
          bounds.extend([event.venue.lng, event.venue.lat]);
        }
      });

      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [events, onEventSelect]);

  if (showApiKeyInput) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para ver o mapa, insira sua chave pública do Mapbox
            </p>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
                value={mapboxApiKey}
                onChange={(e) => setMapboxApiKey(e.target.value)}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <Button
                onClick={() => setShowApiKeyInput(false)}
                disabled={!mapboxApiKey || mapboxApiKey.includes('example')}
                className="w-full"
              >
                Carregar Mapa
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Obtenha sua chave gratuita em{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                mapbox.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const eventsWithLocation = events.filter(event => 
    event.venue?.lat && event.venue?.lng
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa de Eventos
          </CardTitle>
          <Badge variant="secondary">
            {eventsWithLocation.length} evento{eventsWithLocation.length !== 1 ? 's' : ''} no mapa
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-80 rounded-b-lg" />
        {eventsWithLocation.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento com localização encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsMap;