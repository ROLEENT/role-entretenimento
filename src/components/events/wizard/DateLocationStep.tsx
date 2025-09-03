import React from 'react';
import { useFormContext } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, MapPin, Globe, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
];

const COUNTRIES = [
  'Brasil',
  'Argentina',
  'Chile',
  'Uruguai',
  'Paraguai',
  'Bolívia',
  'Peru',
  'Colômbia',
  'Venezuela',
  'Equador'
];

export const DateLocationStep: React.FC = () => {
  const { control, watch } = useFormContext<EventFormData>();
  
  const dateStart = watch('date_start');

  const formatTimeForInput = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = parseISO(isoString);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  const handleTimeChange = (value: string, fieldName: 'doors_open_utc' | 'headliner_starts_utc', onChange: (value: string) => void) => {
    if (!dateStart || !value) {
      onChange('');
      return;
    }

    try {
      const baseDate = parseISO(dateStart);
      const [hours, minutes] = value.split(':').map(Number);
      
      const newDate = new Date(baseDate);
      newDate.setHours(hours, minutes, 0, 0);
      
      onChange(newDate.toISOString());
    } catch (error) {
      console.error('Error setting time:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doors Open Time */}
        <FormField
          control={control}
          name="doors_open_utc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Abertura</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="pl-10"
                    value={formatTimeForInput(field.value)}
                    onChange={(e) => handleTimeChange(e.target.value, 'doors_open_utc', field.onChange)}
                    disabled={!dateStart}
                  />
                </div>
              </FormControl>
              <FormDescription>
                {!dateStart ? 'Defina primeiro a data de início' : 'Horário que o público pode entrar'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Headliner Start Time */}
        <FormField
          control={control}
          name="headliner_starts_utc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início do Show Principal</FormLabel>
              <FormControl>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    className="pl-10"
                    value={formatTimeForInput(field.value)}
                    onChange={(e) => handleTimeChange(e.target.value, 'headliner_starts_utc', field.onChange)}
                    disabled={!dateStart}
                  />
                </div>
              </FormControl>
              <FormDescription>
                {!dateStart ? 'Defina primeiro a data de início' : 'Horário do artista principal'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={control}
          name="address"
          render={({ field }) => (
            <FormItem className="lg:col-span-2">
              <FormLabel>Endereço Completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rua, número, bairro..."
                    className="pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Endereço completo onde o evento acontecerá
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* State */}
        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name} ({state.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Country */}
        <FormField
          control={control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>País</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o país" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {country}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price Range */}
        <FormField
          control={control}
          name="price_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Mínimo (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Menor preço disponível (deixe vazio se for gratuito)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="price_max"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preço Máximo (R$)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormDescription>
                Maior preço disponível (VIP, camarote, etc.)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}
        <FormField
          control={control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Moeda</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a moeda" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BRL">Real Brasileiro (R$)</SelectItem>
                  <SelectItem value="USD">Dólar Americano ($)</SelectItem>
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Age Rating */}
        <FormField
          control={control}
          name="age_rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Classificação Etária</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a classificação" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="livre">Livre</SelectItem>
                  <SelectItem value="10">10 anos</SelectItem>
                  <SelectItem value="12">12 anos</SelectItem>
                  <SelectItem value="14">14 anos</SelectItem>
                  <SelectItem value="16">16 anos</SelectItem>
                  <SelectItem value="18">18 anos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Organizers Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Organizadores do Evento
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione os organizadores responsáveis pelo evento
            </p>
            
            {/* Placeholder for organizers multiselect */}
            <div className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-8 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sistema de múltiplos organizadores</p>
              <p>Será implementado em versão futura</p>
            </div>
          </div>
        </div>

        {/* Supporters Section */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Apoiadores</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione os apoiadores do evento
            </p>
            
            <div className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-4 text-center">
              <p>Multiselect de apoiadores</p>
              <p>Em desenvolvimento</p>
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">Patrocinadores</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione os patrocinadores do evento
            </p>
            
            <div className="text-sm text-muted-foreground border-2 border-dashed rounded-lg p-4 text-center">
              <p>Multiselect de patrocinadores</p>
              <p>Em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};