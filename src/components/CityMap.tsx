import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Event } from '@/data/eventsData';

interface CityMapProps {
  events: Event[];
  center: [number, number];
  className?: string;
}

const CityMap: React.FC<CityMapProps> = ({ events, center, className }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');

  useEffect(() => {
    // For now, we'll use a placeholder token. In production, this should come from environment variables or Supabase secrets
    const token = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHpnNHd0aDgwMDF4MmpxejdocHc4OW10In0.example'; // Replace with actual token
    setMapboxToken(token);
  }, []);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 12,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for events
    events.forEach((event) => {
      if (event.coordinates) {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        markerEl.innerHTML = `
          <div class="marker-pin">
            <div class="marker-price">${event.price === 0 ? 'Free' : `R$ ${event.price}`}</div>
          </div>
        `;
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${event.title}</h3>
            <p class="text-xs text-gray-600">${event.venue}</p>
            <p class="text-xs text-gray-500">${event.time} • ${event.date}</p>
            <p class="text-sm font-medium text-blue-600 mt-1">${event.price === 0 ? 'Gratuito' : `R$ ${event.price}`}</p>
          </div>
        `);

        // Add marker to map
        new mapboxgl.Marker(markerEl)
          .setLngLat([event.coordinates.lng, event.coordinates.lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [events, center, mapboxToken]);

  if (!mapboxToken) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <div className="text-center p-8">
          <h3 className="text-lg font-semibold mb-2">Mapa Interativo</h3>
          <p className="text-muted-foreground mb-4">
            Para visualizar o mapa, configure seu token do Mapbox
          </p>
          <div className="text-xs text-muted-foreground">
            <p>1. Acesse <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">mapbox.com</a></p>
            <p>2. Obtenha seu token público</p>
            <p>3. Configure nas variáveis de ambiente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapContainer} className={className} />
      <style>
        {`
        .custom-marker {
          cursor: pointer;
        }
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #3b82f6;
          position: relative;
          transform: rotate(-45deg);
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .marker-pin::after {
          content: '';
          width: 14px;
          height: 14px;
          margin: 6px 0 0 6px;
          background: #ffffff;
          position: absolute;
          border-radius: 50%;
        }
        .marker-price {
          position: absolute;
          top: -25px;
          left: -10px;
          background: #ffffff;
          padding: 2px 6px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          color: #3b82f6;
          border: 1px solid #3b82f6;
          transform: rotate(45deg);
          white-space: nowrap;
        }
        `}
      </style>
    </div>
  );
};

export default CityMap;