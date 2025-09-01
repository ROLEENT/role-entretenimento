import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArtistFormData } from '../AdminArtistForm';

interface ArtistProfessionalTabProps {
  form: UseFormReturn<ArtistFormData>;
}

const FEE_RANGES = [
  { value: 'R$ 500 - R$ 1.000', label: 'R$ 500 - R$ 1.000' },
  { value: 'R$ 1.000 - R$ 2.500', label: 'R$ 1.000 - R$ 2.500' },
  { value: 'R$ 2.500 - R$ 5.000', label: 'R$ 2.500 - R$ 5.000' },
  { value: 'R$ 5.000 - R$ 10.000', label: 'R$ 5.000 - R$ 10.000' },
  { value: 'R$ 10.000 - R$ 25.000', label: 'R$ 10.000 - R$ 25.000' },
  { value: 'R$ 25.000+', label: 'R$ 25.000+' },
  { value: 'A combinar', label: 'A combinar' },
];

const SHOW_FORMATS = [
  { value: 'DJ Set', label: 'DJ Set' },
  { value: 'Live Set', label: 'Live Set' },
  { value: 'Show Acústico', label: 'Show Acústico' },
  { value: 'Show Completo', label: 'Show Completo' },
  { value: 'Apresentação', label: 'Apresentação' },
  { value: 'Performance', label: 'Performance' },
];

const WEEKDAYS = [
  { value: 'segunda', label: 'Segunda-feira' },
  { value: 'terca', label: 'Terça-feira' },
  { value: 'quarta', label: 'Quarta-feira' },
  { value: 'quinta', label: 'Quinta-feira' },
  { value: 'sexta', label: 'Sexta-feira' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

export const ArtistProfessionalTab: React.FC<ArtistProfessionalTabProps> = ({ form }) => {
  const availabilityDays = form.watch('availability_days') || [];

  const handleAvailabilityChange = (day: string, checked: boolean) => {
    const currentDays = availabilityDays;
    if (checked) {
      form.setValue('availability_days', [...currentDays, day]);
    } else {
      form.setValue('availability_days', currentDays.filter(d => d !== day));
    }
  };

  return (
    <div className="space-y-6">
      {/* Performance Details */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Detalhes da Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="show_format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formato do Show</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SHOW_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="set_time_minutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração do Set (minutos)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="team_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tamanho da Equipe</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="2" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fee_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de Cachê</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FEE_RANGES.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Disponibilidade</h3>
        <div className="space-y-4">
          <div>
            <FormLabel>Dias da Semana Disponíveis</FormLabel>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
              {WEEKDAYS.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.value}
                    checked={availabilityDays.includes(day.value)}
                    onCheckedChange={(checked) => 
                      handleAvailabilityChange(day.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={day.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Requirements */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Requisitos Técnicos</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="tech_audio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Equipamentos de Áudio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descrição dos equipamentos de áudio necessários"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tech_light"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Iluminação</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Requisitos de iluminação"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tech_stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Palco e Estrutura</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Requisitos de palco e estrutura"
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tech_rider_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link do Tech Rider</FormLabel>
                <FormControl>
                  <Input 
                    type="url" 
                    placeholder="https://drive.google.com/..." 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Accommodation */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Hospedagem e Observações</h3>
        <FormField
          control={form.control}
          name="accommodation_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas sobre Hospedagem</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Requisitos especiais de hospedagem, alimentação, etc."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};