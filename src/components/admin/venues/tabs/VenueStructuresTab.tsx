import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VenueFormData } from '@/schemas/venue';
import { Building2 } from 'lucide-react';

interface VenueStructuresTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueStructuresTab: React.FC<VenueStructuresTabProps> = ({ form }) => {
  const { register, watch, setValue } = form;
  
  const estruturas = watch('estruturas');

  const handleCheckboxChange = (field: keyof typeof estruturas, checked: boolean) => {
    setValue(`estruturas.${field}`, checked);
  };

  const estruturasList = [
    { key: 'ar_condicionado', label: 'Ar Condicionado' },
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'aquecimento', label: 'Aquecimento' },
    { key: 'estacionamento', label: 'Estacionamento' },
    { key: 'aceita_pets', label: 'Aceita Pets' },
    { key: 'area_fumantes', label: 'Área para Fumantes' },
    { key: 'pista_danca', label: 'Pista de Dança' },
    { key: 'area_vip', label: 'Área VIP' },
    { key: 'rooftop', label: 'Rooftop' },
    { key: 'estacoes_carregamento', label: 'Estações de Carregamento' },
    { key: 'lugares_sentados', label: 'Lugares Sentados' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Estruturas e Facilidades
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="estruturas.descricao">Descrição das Estruturas</Label>
            <Textarea
              id="estruturas.descricao"
              placeholder="Descreva detalhes específicos sobre as estruturas do local..."
              {...register('estruturas.descricao')}
              className="min-h-[80px]"
            />
          </div>

          <div>
            <h4 className="font-medium mb-4">Facilidades Disponíveis</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {estruturasList.map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`estruturas.${key}`}
                    checked={Boolean(estruturas?.[key as keyof typeof estruturas]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange(key as keyof typeof estruturas, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`estruturas.${key}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};