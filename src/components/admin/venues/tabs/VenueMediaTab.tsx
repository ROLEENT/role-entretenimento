import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFUpload, RHFInput } from '@/components/form';
import { VenueGalleryField } from '@/components/agentes/VenueGalleryField';
import { VenueFormData } from '@/schemas/venue';
import { Camera, Images } from 'lucide-react';

interface VenueMediaTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueMediaTab: React.FC<VenueMediaTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Imagem de Capa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RHFUpload
            name="cover_url"
            label="Imagem de Capa"
            bucket="venues"
          />
          
          <RHFInput
            name="cover_alt"
            label="Texto Alternativo"
            placeholder="Descrição da imagem para acessibilidade"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Galeria de Fotos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VenueGalleryField />
        </CardContent>
      </Card>
    </div>
  );
};