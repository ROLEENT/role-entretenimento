import React, { useState, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Clock, MapPin, Globe, Users, Heart, Star, ChevronDown } from 'lucide-react';
import { OrganizersManager } from './OrganizersManager';
import { SupportersSponsorsManager } from './SupportersSponsorsManager';
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

// helpers
const toISO = (v?: Date | string | null) =>
  v ? new Date(v).toISOString() : '';

const fromISO = (iso?: string | null) =>
  iso ? new Date(iso) : undefined;

// helper simples de busca
async function fetchVenues(q: string) {
  if (!q) return [];
  const url =
    `https://nutlcbnruabjsxecqpnd.supabase.co/rest/v1/venues?select=id,name,city`
    + `&or=(name.ilike.*${encodeURIComponent(q)}*,city.ilike.*${encodeURIComponent(q)}*)`
    + `&order=name.asc&limit=10`;
  const res = await fetch(url, { 
    headers: { 
      apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c' 
    } 
  });
  if (!res.ok) return [];
  return res.json() as Promise<Array<{id:string;name:string;city?:string}>>;
}

function VenueDatalist() {
  const { setValue, watch, register } = useFormContext();
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<Array<{id:string;name:string;city?:string}>>([]);
  const selectedId = watch('venue_id') || '';

  useEffect(() => {
    let alive = true;
    fetchVenues(q).then(r => { if (alive) setOpts(r); });
    return () => { alive = false; };
  }, [q]);

  return (
    <div className="space-y-4">
      <FormItem>
        <FormLabel>Local do Evento</FormLabel>
        <FormControl>
          <input
            list="venues"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Buscar venue..."
            onChange={(e) => {
              const val = e.target.value.trim();
              setQ(val);
              const hit = opts.find(o => `${o.name}${o.city ? ' • ' + o.city : ''}`.toLowerCase() === val.toLowerCase());
              setValue('venue_id', hit ? hit.id : '', { shouldValidate: true });
            }}
          />
        </FormControl>
        <datalist id="venues">
          {opts.map(o => (
            <option key={o.id} value={`${o.name}${o.city ? ' • ' + o.city : ''}`} />
          ))}
        </datalist>
        <FormMessage />
      </FormItem>
      
      {!selectedId && (
        <FormItem>
          <FormLabel>Nome do Local</FormLabel>
          <FormControl>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input {...register("address")} placeholder="Nome e endereço do local" className="pl-10" />
            </div>
          </FormControl>
          <FormDescription>
            Informe o nome e endereço caso não encontre o venue na busca
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    </div>
  );
}

export const DateLocationStep: React.FC = () => {
  const { control, watch, setValue, clearErrors, setError, getValues } = useFormContext<EventFormData>();
  
  const startUtc = watch('start_utc');
  const endUtc = watch('end_utc');

  // Validation effect
  useEffect(() => {
    const s = getValues('start_utc');
    const e = getValues('end_utc');
    if (s && e && new Date(e) <= new Date(s)) {
      setError('end_utc', { message: 'fim precisa ser depois do início' });
    } else {
      clearErrors('end_utc');
    }
  }, [startUtc, endUtc, getValues, setError, clearErrors]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Date */}
        <Controller
          name="start_utc"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora de Início</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  step={900}
                  value={field.value ? field.value.slice(0, 16) : ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? new Date(e.target.value).toISOString() : ""
                    )
                  }
                  placeholder="Selecione a data"
                />
              </FormControl>
              <FormDescription>
                Data e horário de início do evento
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <Controller
          name="end_utc"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e Hora de Fim</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  step={900}
                  value={field.value ? field.value.slice(0,16) : ''}
                  onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
                  placeholder="Mesmo dia"
                />
              </FormControl>
              <FormDescription>
                Data e horário de fim do evento (opcional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Doors Open Time */}
        <Controller
          name="doors_open_utc"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horário de Abertura</FormLabel>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  step={900}
                  className="pl-10"
                  onChange={(e) => {
                    if (!startUtc || !e.target.value) {
                      field.onChange('');
                      return;
                    }
                    const d = new Date(startUtc);
                    const [hh, mm] = e.target.value.split(':').map(Number);
                    d.setHours(hh || 0, mm || 0, 0, 0);
                    field.onChange(d.toISOString());
                  }}
                  disabled={!startUtc}
                />
              </div>
              <FormDescription>
                {!startUtc ? 'Defina primeiro a data de início' : 'Horário que o público pode entrar'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Headliner Start Time */}
        <Controller
          name="headliner_starts_utc"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormItem>
              <FormLabel>Início do Show Principal</FormLabel>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  step={900}
                  className="pl-10"
                  onChange={(e) => {
                    if (!startUtc || !e.target.value) {
                      field.onChange('');
                      return;
                    }
                    const d = new Date(startUtc);
                    const [hh, mm] = e.target.value.split(':').map(Number);
                    d.setHours(hh || 0, mm || 0, 0, 0);
                    field.onChange(d.toISOString());
                  }}
                  disabled={!startUtc}
                />
              </div>
              <FormDescription>
                {!startUtc ? 'Defina primeiro a data de início' : 'Horário do artista principal'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Venue Selector */}
        <div className="lg:col-span-2">
          <VenueDatalist />
        </div>

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
        <div className="lg:col-span-2">
          <OrganizersManager />
        </div>

        {/* Supporters Section */}
        <div>
          <SupportersSponsorsManager 
            type="supporters" 
            title="Apoiadores" 
            icon={Heart} 
          />
        </div>

        {/* Sponsors Section */}
        <div>
          <SupportersSponsorsManager 
            type="sponsors" 
            title="Patrocinadores" 
            icon={Star} 
          />
        </div>
      </div>
    </div>
  );
};