import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFSlug, RHFTextarea } from '@/components/form';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { Badge, MapPin } from 'lucide-react';

interface VenueBasicTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueBasicTab: React.FC<VenueBasicTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="name"
              label="Nome do Local"
              placeholder="Ex: Teatro Municipal"
            />
            
            <RHFInput
              name="slug"
              label="Slug (URL)"
              placeholder="teatro-municipal"
            />
          </div>

          <RHFTextarea
            name="about"
            label="Sobre o Local"
            placeholder="Descrição do espaço, história, características especiais..."
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="capacity"
              label="Capacidade"
              type="number"
              placeholder="Ex: 500"
            />
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <RHFInput
                name="tags"
                placeholder="Ex: casa-de-shows, rock, eletrônico"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Separe as tags com vírgulas
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                className="w-full p-2 border rounded-md"
                {...form.register('status')}
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            
            <RHFInput
              name="priority"
              label="Prioridade"
              type="number"
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};