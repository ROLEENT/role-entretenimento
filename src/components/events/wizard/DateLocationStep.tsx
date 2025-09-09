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
import { VenueAutocomplete } from '@/components/ui/venue-autocomplete';
import { OrganizersManager } from './OrganizersManager';
import { SupportersSponsorsManager } from './SupportersSponsorsManager';
import { RHFDateTimeUtc } from '@/components/form';
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

// helper
async function fetchVenues(q: string) {
  if (!q) return [];
  const base = 'https://nutlcbnruabjsxecqpnd.supabase.co';
  const key  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51dGxjYm5ydWFianN4ZWNxcG5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MTcwOTgsImV4cCI6MjA3MTA5MzA5OH0.K_rfijLK9e3EbDxU4uddtY0sUMUvtH-yHNEbW8Ohp5c';
  const url =
    `${base}/rest/v1/venues?select=id,name,city` +
    `&or=(name.ilike.*${encodeURIComponent(q)}*,city.ilike.*${encodeURIComponent(q)}*)&order=name.asc&limit=10`;
  const res = await fetch(url, { headers: { apikey: key } });
  return res.ok ? (await res.json()) as {id:string;name:string;city?:string}[] : [];
}

function VenueDatalist() {
  const { register, setValue, watch } = useFormContext();
  const [q, setQ] = React.useState("");
  const [opts, setOpts] = React.useState<{id:string;name:string;city?:string}[]>([]);
  const selectedId = watch("venue_id") as string | undefined;

  React.useEffect(() => {
    let alive = true;
    fetchVenues(q).then(r => { if (alive) setOpts(r); });
    return () => { alive = false; };
  }, [q]);

  return (
    <>
      <input
        list="venues"
        className="w-full h-10 rounded-md border px-3"
        placeholder="Buscar venue..."
        onChange={(e) => {
          const val = e.target.value.trim();
          setQ(val);
          const hit = opts.find(o => `${o.name}${o.city ? " • " + o.city : ""}`.toLowerCase() === val.toLowerCase());
          setValue("venue_id", hit ? hit.id : "", { shouldValidate: true });
        }}
      />
      <datalist id="venues">
        {opts.map(o => (
          <option key={o.id} value={`${o.name}${o.city ? " • " + o.city : ""}`} />
        ))}
      </datalist>

      {!selectedId && (
        <>
          <label className="mt-2 block">Nome do Local</label>
          <input {...register("address")} className="w-full h-10 rounded-md border px-3" placeholder="Nome e endereço do local" />
        </>
      )}
    </>
  );
}

export const DateLocationStep: React.FC = () => {
  const { control, watch, setValue, clearErrors, setError, getValues } = useFormContext<EventFormData>();
  
  const dateStart = watch('date_start');
  const dateEnd = watch('date_end');

  // Validation effect
  useEffect(() => {
    const s = getValues('date_start');
    const e = getValues('date_end');
    if (s && e && new Date(e) <= new Date(s)) {
      setError('date_end', { message: 'fim precisa ser depois do início' });
    } else {
      clearErrors('date_end');
    }
  }, [dateStart, dateEnd, getValues, setError, clearErrors]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start Date */}
        <RHFDateTimeUtc
          name="date_start"
          label="Data e Hora de Início"
          showTime={true}
          timeZone="America/Sao_Paulo"
          description="Data e horário de início do evento"
        />

        {/* End Date */}
        <RHFDateTimeUtc
          name="date_end"
          label="Data e Hora de Fim"
          showTime={true}
          timeZone="America/Sao_Paulo"
          compareWithField="date_start"
          isEndDate={true}
          description="Data e horário de fim do evento (opcional)"
        />

        {/* Doors Open Time */}
        <Controller
          name="doors_open_utc"
          control={control}
          defaultValue={undefined}
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
                    if (!dateStart || !e.target.value) {
                      field.onChange(undefined);
                      return;
                    }
                    const d = new Date(dateStart);
                    const [hh, mm] = e.target.value.split(':').map(Number);
                    d.setHours(hh || 0, mm || 0, 0, 0);
                    field.onChange(d.toISOString());
                  }}
                  disabled={!dateStart}
                />
              </div>
              <FormDescription>
                {!dateStart ? 'Defina primeiro a data de início' : 'Horário que o público pode entrar'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Headliner Start Time */}
        <Controller
          name="headliner_starts_utc"
          control={control}
          defaultValue={undefined}
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
                    if (!dateStart || !e.target.value) {
                      field.onChange(undefined);
                      return;
                    }
                    const d = new Date(dateStart);
                    const [hh, mm] = e.target.value.split(':').map(Number);
                    d.setHours(hh || 0, mm || 0, 0, 0);
                    field.onChange(d.toISOString());
                  }}
                  disabled={!dateStart}
                />
              </div>
              <FormDescription>
                {!dateStart ? 'Defina primeiro a data de início' : 'Horário do artista principal'}
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

        {/* Organizers Section - Moved to Basic Info Step */}

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