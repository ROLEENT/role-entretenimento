import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFSlug, RHFTextarea, RHFTagsEditor } from '@/components/form';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { Badge, MapPin } from 'lucide-react';
import { IntelligentStatusField } from '@/components/form/IntelligentStatusField';
import VenueCategorySelect from '@/components/fields/VenueCategorySelect';

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <VenueCategorySelect name="category_id" placeholder="Selecione a categoria" />
            </div>
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
            
            <RHFTagsEditor
              name="tags"
              label="Tags"
              placeholder="Ex: casa-de-shows, rock, eletrônico"
              maxTags={15}
            />
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
            {/* Removed priority field - doesn't exist in database */}
          </div>

          {/* Intelligent Status Field */}
          <IntelligentStatusField 
            form={form} 
            type="venue" 
          />
        </CardContent>
      </Card>
    </div>
  );
};