import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArtistFlexibleForm } from '@/schemas/agents-flexible';
import { RHFArtistRolesSelect } from '@/components/form/RHFArtistRolesSelect';

interface ArtistProfessionalTabProps {
  form: UseFormReturn<ArtistFlexibleForm>;
}

export const ArtistProfessionalTab: React.FC<ArtistProfessionalTabProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="fee_range"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faixa de Cachê</FormLabel>
              <FormControl>
                <Input placeholder="Ex: R$ 5.000 - R$ 15.000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="show_format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Formato do Show</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Live, DJ Set, Acústico" {...field} />
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
                  placeholder="Ex: 4"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
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
                  placeholder="Ex: 60"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="space-y-4">
        <RHFArtistRolesSelect name="roles" maxRoles={3} />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Requisitos Técnicos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="tech_audio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Requisitos de Áudio</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os requisitos de som necessários"
                    className="min-h-[80px]"
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
                <FormLabel>Requisitos de Iluminação</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os requisitos de iluminação"
                    className="min-h-[80px]"
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
                <FormLabel>Requisitos de Palco</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva os requisitos de palco e espaço"
                    className="min-h-[80px]"
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
                <FormLabel>URL do Rider Técnico</FormLabel>
                <FormControl>
                  <Input 
                    type="url"
                    placeholder="https://exemplo.com/rider.pdf"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="accommodation_notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações sobre Hospedagem</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Requisitos especiais para hospedagem"
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};