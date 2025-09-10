import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';
import { MultiSelect } from '@/components/ui/multi-select';

interface ArtistContactFieldsProps {
  form: UseFormReturn<ArtistEnhancedForm>;
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
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

const TIME_PERIODS = [
  { value: 'manha', label: 'Manhã' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noite', label: 'Noite' },
  { value: 'madrugada', label: 'Madrugada' },
];

const FEE_RANGES = [
  { value: 'ate-2k', label: 'Até R$ 2.000' },
  { value: '2k-5k', label: 'R$ 2.000 - R$ 5.000' },
  { value: '5k-10k', label: 'R$ 5.000 - R$ 10.000' },
  { value: '10k-mais', label: 'R$ 10.000+' },
  { value: 'negociavel', label: 'Negociável' },
];

export const ArtistContactFields: React.FC<ArtistContactFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações de Contato</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="contato@exemplo.com"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  WhatsApp
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="(11) 99999-9999"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Instagram
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="@usuario ou apenas usuario"
                    {...field}
                    onChange={(e) => {
                      let value = e.target.value.replace('@', '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Localização</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Cidade
                  <span className="text-destructive ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="São Paulo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {BRAZILIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
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
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>País</FormLabel>
                <FormControl>
                  <Input placeholder="Brasil" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Professional Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informações Profissionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fee_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de Cachê</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma faixa" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="availability.days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dias Disponíveis</FormLabel>
                <FormControl>
                <MultiSelect
                  options={WEEKDAYS.map(day => ({ label: day.label, value: day.value }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione os dias"
                />
                </FormControl>
                <FormDescription>
                  Dias da semana em que costuma estar disponível
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability.times"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Períodos Disponíveis</FormLabel>
                <FormControl>
                <MultiSelect
                  options={TIME_PERIODS.map(period => ({ label: period.label, value: period.value }))}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Selecione os períodos"
                />
                </FormControl>
                <FormDescription>
                  Períodos do dia em que costuma estar disponível
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="availability.cities"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cidades de Atuação</FormLabel>
              <FormControl>
                <MultiSelect
                  options={[]}
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Digite as cidades onde atua"
                  allowCustom
                />
              </FormControl>
              <FormDescription>
                Cidades onde costuma fazer apresentações
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Booking Contact */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Contato para Booking (opcional)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="booking_contact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do manager/agente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_contact.role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Função</FormLabel>
                <FormControl>
                  <Input placeholder="Manager, Agente, Produtor..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_contact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email"
                    placeholder="booking@exemplo.com"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="booking_contact.whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="(11) 99999-9999" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};