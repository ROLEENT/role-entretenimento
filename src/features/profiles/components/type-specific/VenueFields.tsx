import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { CreateProfile } from '../../schemas';
import { MapPin, Users, Clock, DollarSign, Music, Shield, FileText } from 'lucide-react';

interface VenueFieldsProps {
  form: UseFormReturn<CreateProfile>;
}

const daysOfWeek = [
  { key: 'monday', label: 'Segunda' },
  { key: 'tuesday', label: 'Terça' },
  { key: 'wednesday', label: 'Quarta' },
  { key: 'thursday', label: 'Quinta' },
  { key: 'friday', label: 'Sexta' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const accessibilityFeatures = [
  { key: 'wheelchair_ramp', label: 'Rampa de acesso' },
  { key: 'accessible_bathroom', label: 'Banheiro acessível' },
  { key: 'reserved_seating', label: 'Assentos reservados' },
  { key: 'sign_language', label: 'Intérprete de Libras' },
  { key: 'tactile_flooring', label: 'Piso tátil' },
  { key: 'audio_description', label: 'Audiodescrição' },
  { key: 'service_animals', label: 'Aceita animais de serviço' }
];

const soundEquipment = [
  { key: 'dj_mixer', label: 'Mesa de DJ' },
  { key: 'cdj_players', label: 'CDJs/Players' },
  { key: 'sound_system', label: 'Sistema de som' },
  { key: 'microphones', label: 'Microfones' },
  { key: 'stage_monitors', label: 'Monitores de palco' },
  { key: 'lighting_system', label: 'Sistema de iluminação' },
  { key: 'fog_machine', label: 'Máquina de fumaça' },
  { key: 'led_screens', label: 'Telas LED' }
];

export function VenueFields({ form }: VenueFieldsProps) {
  const watchedHours = form.watch('hours') || {};
  const watchedAccessibility = form.watch('accessibility') || {};
  const watchedSoundGear = form.watch('sound_gear') || {};

  const updateHours = (day: string, field: 'open' | 'close', value: string) => {
    const currentHours = form.getValues('hours') || {};
    form.setValue('hours', {
      ...currentHours,
      [day]: {
        ...currentHours[day],
        [field]: value
      }
    });
  };

  const updateAccessibility = (feature: string, checked: boolean) => {
    const currentAccessibility = form.getValues('accessibility') || {};
    form.setValue('accessibility', {
      ...currentAccessibility,
      [feature]: checked
    });
  };

  const updateSoundGear = (equipment: string, checked: boolean) => {
    const currentSoundGear = form.getValues('sound_gear') || {};
    form.setValue('sound_gear', {
      ...currentSoundGear,
      [equipment]: checked
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Venue Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Informações Básicas do Local
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacidade *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ex: 500" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age_policy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Política de Idade *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a política" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="livre">Livre</SelectItem>
                      <SelectItem value="10+">10+</SelectItem>
                      <SelectItem value="12+">12+</SelectItem>
                      <SelectItem value="14+">14+</SelectItem>
                      <SelectItem value="16+">16+</SelectItem>
                      <SelectItem value="18+">18+</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="price_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de Preço</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a faixa de preço" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="$">$ - Econômico (até R$ 30)</SelectItem>
                    <SelectItem value="$$">$$ - Moderado (R$ 30-80)</SelectItem>
                    <SelectItem value="$$$">$$$ - Premium (acima de R$ 80)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ (informação privada)</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0000-00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Endereço Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da rua" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.complement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto, sala, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address.zipcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="00000-000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Horário de Funcionamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {daysOfWeek.map((day) => (
              <div key={day.key} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{day.label}</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    placeholder="09:00"
                    value={watchedHours[day.key]?.open || ''}
                    onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">às</span>
                  <Input
                    type="time"
                    placeholder="02:00"
                    value={watchedHours[day.key]?.close || ''}
                    onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {accessibilityFeatures.map((feature) => (
              <div key={feature.key} className="flex items-center space-x-2">
                <Checkbox
                  id={feature.key}
                  checked={watchedAccessibility[feature.key] || false}
                  onCheckedChange={(checked) => updateAccessibility(feature.key, !!checked)}
                />
                <label
                  htmlFor={feature.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {feature.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sound Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="w-5 h-5" />
            Equipamentos de Som
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {soundEquipment.map((equipment) => (
              <div key={equipment.key} className="flex items-center space-x-2">
                <Checkbox
                  id={equipment.key}
                  checked={watchedSoundGear[equipment.key] || false}
                  onCheckedChange={(checked) => updateSoundGear(equipment.key, !!checked)}
                />
                <label
                  htmlFor={equipment.key}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {equipment.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}