import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, ExternalLink, Navigation, Layers } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EventWithLocation {
  id: string;
  title: string;
  city: string;
  venue?: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  price_min?: number;
  date_start: string;
  image_url?: string;
  status: string;
}

interface EventsMapIntegrationProps {
  events: EventWithLocation[];
  onEventSelect?: (eventId: string) => void;
  onLocationFilter?: (city: string, bounds?: { north: number; south: number; east: number; west: number }) => void;
  className?: string;
}

export const EventsMapIntegration: React.FC<EventsMapIntegrationProps> = ({ 
  events, 
  onEventSelect, 
  onLocationFilter,
  className = "h-96" 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxApiKey, setMapboxApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/light-v11');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Check for saved API key
  useEffect(() => {
    const savedKey = localStorage.getItem('mapbox-api-key');
    if (savedKey && !savedKey.includes('example')) {
      setMapboxApiKey(savedKey);
      setShowApiKeyInput(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxApiKey || mapboxApiKey.includes('example')) return;

    try {
      mapboxgl.accessToken = mapboxApiKey;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [-46.6333, -23.5505], // São Paulo as default
        zoom: 10,
        attributionControl: false
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'metric'
      }));

      // Attribution
      map.current.addControl(
        new mapboxgl.AttributionControl({ compact: true })
      );

      // Handle map bounds change for filtering
      map.current.on('moveend', () => {
        if (map.current && onLocationFilter) {
          const bounds = map.current.getBounds();
          onLocationFilter('', {
            north: bounds.getNorth(),
            south: bounds.getSouth(),
            east: bounds.getEast(),
            west: bounds.getWest()
          });
        }
      });

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowApiKeyInput(true);
    }
  }, [mapboxApiKey, mapStyle, onLocationFilter]);

  // Update markers when events change
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    const eventsWithLocation = events.filter(event => 
      event.venue?.lat && event.venue?.lng
    );

    if (eventsWithLocation.length === 0) return;

    // Group events by location to handle multiple events at same venue
    const locationGroups = new Map();
    eventsWithLocation.forEach(event => {
      if (!event.venue?.lat || !event.venue?.lng) return;
      
      const key = `${event.venue.lat},${event.venue.lng}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key).push(event);
    });

    // Add markers for each location group
    locationGroups.forEach((groupEvents, locationKey) => {
      const firstEvent = groupEvents[0];
      if (!firstEvent.venue?.lat || !firstEvent.venue?.lng) return;

      // Create cluster marker for multiple events
      const isCluster = groupEvents.length > 1;
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker relative';
      
      if (isCluster) {
        markerElement.innerHTML = `
          <div class="bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform font-bold text-sm">
            ${groupEvents.length}
          </div>
        `;
      } else {
        markerElement.innerHTML = `
          <div class="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;
      }

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'max-w-sm';
      
      if (isCluster) {
        // Multiple events popup
        popupContent.innerHTML = `
          <div class="space-y-3">
            <div class="font-semibold text-sm">
              ${groupEvents.length} eventos em ${firstEvent.venue.name}
            </div>
            <div class="max-h-64 overflow-y-auto space-y-2">
              ${groupEvents.map(event => `
                <div class="border rounded p-2 hover:bg-muted cursor-pointer" onclick="window.location.href='/evento/${event.id}'">
                  <div class="font-medium text-sm">${event.title}</div>
                  <div class="text-xs text-muted-foreground">
                    ${new Date(event.date_start).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  ${event.price_min ? `<div class="text-xs font-medium">A partir de R$ ${event.price_min}</div>` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else {
        // Single event popup
        const event = groupEvents[0];
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
      }

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px'
      }).setDOMContent(popupContent);

      // Create marker
      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat([firstEvent.venue.lng, firstEvent.venue.lat])
        .setPopup(popup)
        .addTo(map.current!);

      // Add click handler
      markerElement.addEventListener('click', () => {
        if (!isCluster && onEventSelect) {
          onEventSelect(firstEvent.id);
        }
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers
    if (locationGroups.size > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      locationGroups.forEach((groupEvents) => {
        const event = groupEvents[0];
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

  const handleApiKeySubmit = () => {
    if (mapboxApiKey && !mapboxApiKey.includes('example')) {
      localStorage.setItem('mapbox-api-key', mapboxApiKey);
      setShowApiKeyInput(false);
    }
  };

  const handleStyleChange = (style: string) => {
    setMapStyle(style);
  };

  if (showApiKeyInput) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Mapa Interativo de Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Para usar o mapa interativo, insira sua chave pública do Mapbox
            </p>
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example"
                value={mapboxApiKey}
                onChange={(e) => setMapboxApiKey(e.target.value)}
              />
              <Button
                onClick={handleApiKeySubmit}
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
            Mapa Interativo
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {eventsWithLocation.length} local{eventsWithLocation.length !== 1 ? 'ais' : ''}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStyleChange(
                mapStyle === 'mapbox://styles/mapbox/light-v11' 
                  ? 'mapbox://styles/mapbox/satellite-streets-v12'
                  : 'mapbox://styles/mapbox/light-v11'
              )}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div ref={mapContainer} className="w-full h-80 rounded-b-lg" />
        {eventsWithLocation.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum evento com localização encontrado</p>
            <p className="text-xs mt-1">
              Eventos precisam ter um local cadastrado para aparecer no mapa
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};