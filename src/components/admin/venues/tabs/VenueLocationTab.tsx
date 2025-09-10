import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFLocationPicker } from '@/components/form';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { MapPin } from 'lucide-react';

interface VenueLocationTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueLocationTab: React.FC<VenueLocationTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFInput
            name="address_line"
            label="Endereço"
            placeholder="Rua, número, complemento"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RHFInput
              name="district"
              label="Bairro"
              placeholder="Centro"
            />
            
            <RHFInput
              name="city"
              label="Cidade"
              placeholder="São Paulo"
            />
            
            <RHFInput
              name="state"
              label="Estado"
              placeholder="SP"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="postal_code"
              label="CEP"
              placeholder="01234-567"
            />
            
            <RHFInput
              name="country"
              label="País"
              placeholder="Brasil"
            />
          </div>
        </CardContent>
      </Card>

      <RHFLocationPicker
        latitudeName="latitude"
        longitudeName="longitude"
        addressName="address_line"
        label="Coordenadas Geográficas"
        description="Ajuda a localizar o venue com precisão no mapa"
      />
    </div>
  );
};