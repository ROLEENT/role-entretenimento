import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VenueEnhancedForm } from '@/schemas/entities/venue-enhanced';
import { OrganizerEnhancedForm } from '@/schemas/entities/organizer-enhanced';
import { ArtistEnhancedForm } from '@/schemas/entities/artist-enhanced';

interface BusinessFieldsProps {
  form: UseFormReturn<any>;
}

export const BusinessFields: React.FC<BusinessFieldsProps> = ({ form }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Contato para Booking</h3>
      
      <FormField
        control={form.control}
        name="booking_contact.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome do Responsável</FormLabel>
            <FormControl>
              <Input placeholder="Nome completo" {...field} />
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
            <FormLabel>Email de Booking</FormLabel>
            <FormControl>
              <Input type="email" placeholder="booking@exemplo.com" {...field} />
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
            <FormLabel>WhatsApp de Booking</FormLabel>
            <FormControl>
              <Input placeholder="(11) 99999-9999" {...field} />
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
            <FormLabel>Cargo/Função</FormLabel>
            <FormControl>
              <Input placeholder="Gerente, Produtor, etc." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Configurações</h3>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prioridade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  value={field.value ?? 0}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="internal_notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notas Internas</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Anotações internas sobre este registro"
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