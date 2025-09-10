import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { 
  OrganizerEnhancedForm, 
  PRODUCTION_SERVICES, 
  AGENCY_SERVICES, 
  EVENT_TYPES, 
  TARGET_AUDIENCES 
} from '@/schemas/entities/organizer-enhanced';

interface OrganizerTypeFieldsProps {
  form: UseFormReturn<OrganizerEnhancedForm>;
  organizerType: string;
}

export const OrganizerTypeFields: React.FC<OrganizerTypeFieldsProps> = ({ form, organizerType }) => {
  const watchedValue = form.watch();

  const addItem = (fieldPath: string, value: string) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];
    if (value && !currentValue.includes(value)) {
      form.setValue(fieldPath as any, [...currentValue, value]);
    }
  };

  const removeItem = (fieldPath: string, value: string) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];
    form.setValue(fieldPath as any, currentValue.filter(item => item !== value));
  };

  const renderArrayField = (
    fieldPath: string,
    label: string,
    placeholder: string,
    suggestions: string[] = []
  ) => {
    const pathArray = fieldPath.split('.');
    const currentValue = pathArray.reduce((obj, key) => obj?.[key], watchedValue) as string[] || [];

    return (
      <div className="space-y-2">
        <FormLabel>{label}</FormLabel>
        <div className="space-y-2">
          <Input
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.currentTarget.value.trim();
                if (value) {
                  addItem(fieldPath, value);
                  e.currentTarget.value = '';
                }
              }
            }}
          />
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addItem(fieldPath, suggestion)}
                  className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-1">
            {currentValue.map((item) => (
              <Badge key={item} variant="secondary" className="flex items-center gap-1">
                {item}
                <button
                  type="button"
                  onClick={() => removeItem(fieldPath, item)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  };

  switch (organizerType) {
    case 'coletivo':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Coletivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="collective_info.members_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Membros</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="5" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="collective_info.founding_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Fundação</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="2020" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'collective_info.areas_of_focus', 
              'Áreas de Foco *', 
              'Ex: Música Eletrônica, Arte Urbana',
              ['Música Eletrônica', 'Hip Hop', 'Arte Urbana', 'Teatro', 'Audiovisual', 'Ativismo', 'Educação']
            )}

            {renderArrayField(
              'collective_info.core_values', 
              'Valores Fundamentais', 
              'Ex: Diversidade, Sustentabilidade',
              ['Diversidade', 'Inclusão', 'Sustentabilidade', 'Colaboração', 'Inovação', 'Comunidade']
            )}

            <FormField
              control={form.control}
              name="collective_info.community_impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impacto na Comunidade</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva como o coletivo impacta a comunidade local"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case 'produtora':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações da Produtora</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="production_info.cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00.000.000/0001-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="production_info.legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome legal da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="production_info.founding_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Fundação</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="2018" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="production_info.team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho da Equipe</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="10" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'production_info.services', 
              'Serviços Oferecidos *', 
              'Digite um serviço',
              PRODUCTION_SERVICES
            )}

            {renderArrayField(
              'production_info.specialties', 
              'Especialidades', 
              'Ex: Eventos Corporativos, Festivais'
            )}

            {renderArrayField(
              'production_info.portfolio_highlights', 
              'Destaques do Portfólio', 
              'Ex: Rock in Rio 2024, Festival de Inverno'
            )}
          </div>
        </div>
      );

    case 'agencia':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações da Agência</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agency_info.cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00.000.000/0001-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agency_info.legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome legal da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agency_info.roster_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho do Cast</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="25" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agency_info.commission_range"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faixa de Comissão</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 10-20%" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'agency_info.services', 
              'Serviços Oferecidos *', 
              'Digite um serviço',
              AGENCY_SERVICES
            )}

            {renderArrayField(
              'agency_info.territories', 
              'Territórios de Atuação *', 
              'Ex: São Paulo, Rio de Janeiro',
              ['São Paulo', 'Rio de Janeiro', 'Minas Gerais', 'Bahia', 'Paraná', 'Nacional', 'Internacional']
            )}

            {renderArrayField(
              'agency_info.booking_focus', 
              'Foco de Booking', 
              'Ex: Festivais, Casas Noturnas',
              ['Festivais', 'Casas Noturnas', 'Eventos Corporativos', 'Bares', 'Teatro', 'Shows Privados']
            )}
          </div>
        </div>
      );

    case 'selo':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Selo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="label_info.cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="00.000.000/0001-00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label_info.legal_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome legal da empresa" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label_info.founding_year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano de Fundação</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="2019" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label_info.artists_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Artistas</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="15" 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {renderArrayField(
              'label_info.genres', 
              'Gêneros Musicais *', 
              'Ex: Techno, House',
              ['Techno', 'House', 'Electronic', 'Hip Hop', 'Funk', 'Pop', 'Rock', 'Indie', 'Experimental']
            )}

            {renderArrayField(
              'label_info.distribution_channels', 
              'Canais de Distribuição', 
              'Ex: Spotify, Beatport',
              ['Spotify', 'Apple Music', 'Beatport', 'SoundCloud', 'Bandcamp', 'YouTube Music', 'Deezer']
            )}

            <FormField
              control={form.control}
              name="label_info.label_philosophy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filosofia do Selo</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva a filosofia e missão do selo musical"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    default:
      return null;
  }

  // Common Event Focus Section (applies to all types)
  const eventFocusSection = (
    <div className="space-y-6 mt-8 pt-6 border-t">
      <div>
        <h3 className="text-lg font-medium mb-4">Foco em Eventos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="event_focus.frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequência de Eventos</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quinzenal">Quinzenal</SelectItem>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="bimestral">Bimestral</SelectItem>
                    <SelectItem value="eventual">Eventual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="event_focus.capacity_range"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faixa de Capacidade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a capacidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="até-100">Até 100 pessoas</SelectItem>
                    <SelectItem value="100-500">100 - 500 pessoas</SelectItem>
                    <SelectItem value="500-1000">500 - 1.000 pessoas</SelectItem>
                    <SelectItem value="1000-5000">1.000 - 5.000 pessoas</SelectItem>
                    <SelectItem value="5000+">5.000+ pessoas</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {renderArrayField(
          'event_focus.event_types', 
          'Tipos de Eventos', 
          'Digite um tipo',
          EVENT_TYPES
        )}

        {renderArrayField(
          'event_focus.target_audience', 
          'Público-Alvo', 
          'Digite um público',
          TARGET_AUDIENCES
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* Type-specific content rendered above */}
      {eventFocusSection}
    </div>
  );
};