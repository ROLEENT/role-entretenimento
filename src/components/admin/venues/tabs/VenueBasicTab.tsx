import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RHFInput, RHFSlug, RHFTextarea } from '@/components/form';
import { VenueFlexibleFormData } from '@/schemas/venue-flexible';
import { Badge, MapPin } from 'lucide-react';
import { IntelligentStatusField } from '@/components/form/IntelligentStatusField';

interface VenueBasicTabProps {
  form: UseFormReturn<VenueFlexibleFormData>;
}

export const VenueBasicTab: React.FC<VenueBasicTabProps> = ({ form }) => {
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .slice(0, 80); // Limit to 80 chars
  };

  // Watch name field to auto-generate slug
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'name' && value.name) {
        const currentSlug = form.getValues('slug');
        const generatedSlug = generateSlug(form.getValues('name') || '');
        
        if (!currentSlug || currentSlug === generatedSlug) {
          form.setValue('slug', generateSlug(value.name));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, generateSlug]);

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
              required
            />
            
            <RHFInput
              name="slug"
              label="Slug (URL)"
              placeholder="teatro-municipal"
              description="URL amigável gerada automaticamente. Pode ser editada."
            />
          </div>

          <RHFTextarea
            name="about"
            label="Sobre o Local"
            placeholder="Descrição do espaço, história, características especiais..."
            rows={4}
            description="Máximo 2000 caracteres"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RHFInput
              name="capacity"
              label="Capacidade"
              type="number"
              placeholder="Ex: 500"
              description="Número máximo de pessoas (1 a 100.000)"
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
            {/* Status is now handled by IntelligentStatusField */}
            
            <RHFInput
              name="priority"
              label="Prioridade"
              type="number"
              placeholder="0"
            />
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