import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { 
  OrganizerEnhancedForm, 
  PRODUCTION_SPECIALTIES, 
  AGENCY_SERVICES, 
  COLLECTIVE_AREAS,
  WORK_AREAS,
  TARGET_AUDIENCES 
} from '@/schemas/entities/organizer-enhanced';

interface OrganizerTypeFieldsProps {
  form: UseFormReturn<OrganizerEnhancedForm>;
  organizerType: string;
}

export const OrganizerTypeFields: React.FC<OrganizerTypeFieldsProps> = ({ form, organizerType }) => {
  switch (organizerType) {
    case 'coletivo':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações do Coletivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="collective_members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Membros</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="5" 
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="collective_areas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Áreas de Atuação</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={COLLECTIVE_AREAS.map(area => ({ label: area, value: area }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione as áreas de atuação"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="collective_philosophy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Filosofia do Coletivo</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva a filosofia e valores do coletivo"
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
                name="company_cnpj"
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
                name="company_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Porte da Empresa</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o porte" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pequena">Pequena</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="grande">Grande</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialties"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidades</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={PRODUCTION_SPECIALTIES.map(spec => ({ label: spec, value: spec }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione as especialidades"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolio_highlights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destaques do Portfólio</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[]}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Digite os principais trabalhos realizados"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                name="roster_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamanho do Cast</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number" 
                        placeholder="25" 
                        onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="commission_structure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estrutura de Comissão</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 10-20%" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="services"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviços Oferecidos</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={AGENCY_SERVICES.map(service => ({ label: service, value: service }))}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os serviços"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="territories"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Territórios de Atuação</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { label: 'São Paulo', value: 'São Paulo' },
                        { label: 'Rio de Janeiro', value: 'Rio de Janeiro' },
                        { label: 'Minas Gerais', value: 'Minas Gerais' },
                        { label: 'Bahia', value: 'Bahia' },
                        { label: 'Nacional', value: 'Nacional' },
                        { label: 'Internacional', value: 'Internacional' },
                      ]}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Selecione os territórios"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      );

    case 'pessoa-fisica':
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Informações Profissionais</h3>
            
            <FormField
              control={form.control}
              name="professional_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiência Profissional</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva sua experiência profissional"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="education_background"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Formação Acadêmica</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descreva sua formação acadêmica"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="certifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Certificações</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[]}
                      value={field.value || []}
                      onChange={field.onChange}
                      placeholder="Digite suas certificações"
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
};