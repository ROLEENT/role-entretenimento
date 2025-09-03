import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePickerStandalone } from '@/components/form/DateTimePickerStandalone';

interface TicketingData {
  platform?: 'shotgun' | 'sympla' | 'ingresse' | 'other';
  url?: string;
  min_price?: number | null;
  max_price?: number | null;
  free_until?: string;
}

interface TicketingFormProps {
  value?: TicketingData;
  onChange: (value: TicketingData) => void;
  disabled?: boolean;
}

const platforms = [
  { value: 'shotgun', label: 'Shotgun' },
  { value: 'sympla', label: 'Sympla' },
  { value: 'ingresse', label: 'Ingresse' },
  { value: 'other', label: 'Outra plataforma' },
];

export const TicketingForm = ({ value = {}, onChange, disabled }: TicketingFormProps) => {
  const updateField = (field: keyof TicketingData, newValue: any) => {
    onChange({ ...value, [field]: newValue });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Ingressos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticketing-platform">Plataforma</Label>
            <Select
              value={value.platform}
              onValueChange={(platform) => updateField('platform', platform)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a plataforma..." />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((platform) => (
                  <SelectItem key={platform.value} value={platform.value}>
                    {platform.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketing-url">URL dos Ingressos</Label>
            <Input
              id="ticketing-url"
              type="url"
              value={value.url || ''}
              onChange={(e) => updateField('url', e.target.value)}
              placeholder="https://..."
              disabled={disabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ticketing-min-price">Preço Mínimo (R$)</Label>
            <Input
              id="ticketing-min-price"
              type="number"
              min="0"
              step="0.01"
              value={value.min_price?.toString() || ''}
              onChange={(e) => updateField('min_price', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="0.00"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketing-max-price">Preço Máximo (R$)</Label>
            <Input
              id="ticketing-max-price"
              type="number"
              min="0"
              step="0.01"
              value={value.max_price?.toString() || ''}
              onChange={(e) => updateField('max_price', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="0.00"
              disabled={disabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticketing-free-until">Grátis Até</Label>
            <DateTimePickerStandalone
              id="ticketing-free-until"
              value={value.free_until ? new Date(value.free_until) : undefined}
              onChange={(date) => updateField('free_until', date?.toISOString())}
              disabled={disabled}
              placeholder="Selecione até quando será grátis..."
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>Configure os dados de ingressos do evento. O preço será exibido como uma faixa (ex: R$ 10-50).</p>
          <p>Se o evento for gratuito até uma data específica, configure "Grátis Até".</p>
        </div>
      </CardContent>
    </Card>
  );
};