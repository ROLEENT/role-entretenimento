import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RHFLocationPickerProps {
  latitudeName?: string;
  longitudeName?: string;
  addressName?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const RHFLocationPicker: React.FC<RHFLocationPickerProps> = ({
  latitudeName = 'latitude',
  longitudeName = 'longitude',
  addressName = 'address_line',
  label = "Localização",
  description,
  disabled,
  required,
  className,
}) => {
  const { control, setValue, watch } = useFormContext();
  const [isSearching, setIsSearching] = useState(false);
  
  const latitude = watch(latitudeName);
  const longitude = watch(longitudeName);
  const address = watch(addressName);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada por este navegador.');
      return;
    }

    setIsSearching(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue(latitudeName, position.coords.latitude);
        setValue(longitudeName, position.coords.longitude);
        setIsSearching(false);
      },
      (error) => {
        console.error('Erro ao obter localização:', error);
        alert('Erro ao obter sua localização.');
        setIsSearching(false);
      }
    );
  };

  const searchByAddress = async () => {
    if (!address) return;

    setIsSearching(true);
    try {
      // Simple geocoding using Nominatim (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setValue(latitudeName, parseFloat(data[0].lat));
        setValue(longitudeName, parseFloat(data[0].lon));
      } else {
        alert('Endereço não encontrado.');
      }
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      alert('Erro ao buscar o endereço.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address Search */}
        <FormField
          control={control}
          name={addressName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Endereço</FormLabel>
              <FormControl>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o endereço para buscar"
                    disabled={disabled}
                    {...field}
                    value={field.value || ''}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={searchByAddress}
                    disabled={disabled || isSearching || !field.value}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Coordinates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name={latitudeName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-23.5505"
                    disabled={disabled}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={longitudeName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="-46.6333"
                    disabled={disabled}
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value ? parseFloat(value) : undefined);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Current Location Button */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={disabled || isSearching}
            className="flex-1"
          >
            <MapPin className="h-4 w-4 mr-2" />
            Usar Localização Atual
          </Button>
        </div>

        {/* Coordinates Preview */}
        {latitude && longitude && (
          <div className="text-sm text-muted-foreground">
            Coordenadas: {latitude.toFixed(6)}, {longitude.toFixed(6)}
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-primary hover:underline"
            >
              Ver no Google Maps
            </a>
          </div>
        )}

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};