import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateProfile } from '../../schemas';
import { TagSelector } from '../TagSelector';
import { Users, Building, FileText, MapPin, Mail, Phone } from 'lucide-react';

interface OrganizerFieldsProps {
  form: UseFormReturn<CreateProfile>;
}

const brazilianCities = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Brasília', 'Salvador',
  'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Belém',
  'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió',
  'Duque de Caxias', 'Natal', 'Teresina', 'São Bernardo do Campo', 'Nova Iguaçu',
  'João Pessoa', 'Santo André', 'São José dos Campos', 'Jaboatão dos Guararapes',
  'Osasco', 'Ribeirão Preto', 'Uberlândia', 'Contagem', 'Sorocaba', 'Aracaju',
  'Feira de Santana', 'Cuiabá', 'Joinville', 'Aparecida de Goiânia', 'Londrina',
  'Juiz de Fora', 'Ananindeua', 'Porto Velho', 'Serra', 'Niterói', 'Caxias do Sul',
  'Campos dos Goytacazes', 'Vila Velha', 'Mauá', 'Carapicuíba', 'Olinda',
  'Campina Grande', 'São José do Rio Preto', 'Piracicaba', 'Santos',
  'Mogi das Cruzes', 'Betim', 'Diadema', 'Jundiaí', 'Caruaru', 'Montes Claros'
];

export function OrganizerFields({ form }: OrganizerFieldsProps) {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Informações da Empresa/Coletivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="brand_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Marca/Evento</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da marca principal ou evento..." {...field} />
                </FormControl>
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

          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sobre a Organização</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva a história, missão e visão da organização..."
                    className="min-h-[100px] resize-none"
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <div className="text-xs text-muted-foreground text-right">
                  {field.value?.length || 0}/500
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Manager Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Responsável/Contato Principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="manager_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Responsável</FormLabel>
                <FormControl>
                  <Input placeholder="Nome completo do responsável..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="manager_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email do Responsável</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="responsavel@exemplo.com" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manager_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone do Responsável</FormLabel>
                  <FormControl>
                    <Input placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Geographic Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Área de Atuação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormField
            control={form.control}
            name="cities"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidades onde atua</FormLabel>
                <FormControl>
                  <TagSelector
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Adicione cidades onde a organização atua..."
                    suggestions={brazilianCities}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <h4 className="font-medium">Informações adicionais</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• O perfil de organizador é ideal para produtoras, coletivos e empresas de eventos</li>
          <li>• Você pode adicionar informações sobre locais parceiros e roster de artistas após criar o perfil</li>
          <li>• As informações de CNPJ e contato do responsável são privadas e não serão exibidas publicamente</li>
          <li>• Use as cidades de atuação para aparecer em buscas regionais</li>
        </ul>
      </div>
    </div>
  );
}