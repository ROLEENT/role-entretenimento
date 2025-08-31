import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VenueFormData } from '@/schemas/venue';
import { Info } from 'lucide-react';

interface VenueCharacteristicsTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueCharacteristicsTab: React.FC<VenueCharacteristicsTabProps> = ({ form }) => {
  const { register, watch } = form;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Características do Estabelecimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="caracteristicas_estabelecimento.descricao">
              Descrição Geral
            </Label>
            <Textarea
              id="caracteristicas_estabelecimento.descricao"
              placeholder="Descreva as principais características do estabelecimento..."
              {...register('caracteristicas_estabelecimento.descricao')}
              className="min-h-[100px]"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Uma descrição geral que destaque o que torna este local especial
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};