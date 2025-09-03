import React, { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { EventFormData } from '@/schemas/eventSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link, 
  Search, 
  Globe, 
  Ticket, 
  Instagram, 
  Facebook, 
  Plus,
  X,
  Accessibility,
  CreditCard,
  Clock,
  MapPin
} from 'lucide-react';

const SOCIAL_PLATFORMS = [
  { id: 'website', label: 'Website', icon: Globe, placeholder: 'https://meusite.com' },
  { id: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/evento' },
  { id: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/evento' },
  { id: 'youtube', label: 'YouTube', icon: Globe, placeholder: 'https://youtube.com/evento' },
  { id: 'spotify', label: 'Spotify', icon: Globe, placeholder: 'https://spotify.com/playlist' },
  { id: 'soundcloud', label: 'SoundCloud', icon: Globe, placeholder: 'https://soundcloud.com/evento' }
];

const ACCESSIBILITY_FEATURES = [
  { id: 'wheelchair_accessible', label: 'Acessível para cadeirantes' },
  { id: 'hearing_loop', label: 'Loop auditivo disponível' },
  { id: 'sign_language', label: 'Intérprete de libras' },
  { id: 'braille_materials', label: 'Materiais em braille' },
  { id: 'audio_description', label: 'Audiodescrição' },
  { id: 'reserved_seating', label: 'Assentos reservados PcD' },
  { id: 'accessible_parking', label: 'Estacionamento acessível' },
  { id: 'accessible_restrooms', label: 'Banheiros acessíveis' }
];

export const LinksStep: React.FC = () => {
  const { control, watch, setValue } = useFormContext<EventFormData>();
  const [activeTab, setActiveTab] = useState('links');

  const watchedLinks = watch('links') || {};
  const watchedAccessibility = watch('accessibility') || {};
  const watchedTicketing = watch('ticketing') || {};

  const {
    fields: ticketRules,
    append: appendTicketRule,
    remove: removeTicketRule
  } = useFieldArray({
    control,
    name: 'ticket_rules'
  });

  const updateLinks = (platform: string, url: string) => {
    const currentLinks = watchedLinks;
    setValue('links', {
      ...currentLinks,
      [platform]: url
    });
  };

  const updateAccessibility = (feature: string, enabled: boolean) => {
    const currentAccessibility = watchedAccessibility;
    setValue('accessibility', {
      ...currentAccessibility,
      [feature]: enabled
    });
  };

  const updateTicketing = (field: string, value: any) => {
    const currentTicketing = watchedTicketing;
    setValue('ticketing', {
      ...currentTicketing,
      [field]: value
    });
  };

  const addTicketRule = () => {
    appendTicketRule({
      description: '',
      rule: ''
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Links
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Ingressos
          </TabsTrigger>
          <TabsTrigger value="accessibility" className="flex items-center gap-2">
            <Accessibility className="w-4 h-4" />
            Acessibilidade
          </TabsTrigger>
        </TabsList>

        {/* Links & Social Media */}
        <TabsContent value="links" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Links e Redes Sociais</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Adicione links relevantes para o evento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => {
              const IconComponent = platform.icon;
              return (
                <div key={platform.id} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {platform.label}
                  </label>
                  <Input
                    placeholder={platform.placeholder}
                    value={watchedLinks[platform.id] || ''}
                    onChange={(e) => updateLinks(platform.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          {/* Custom Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Links Personalizados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Link</label>
                  <Input placeholder="Ex: Press Kit" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <div className="flex gap-2">
                    <Input placeholder="https://..." />
                    <Button type="button" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">SEO & Metadados</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Otimize seu evento para mecanismos de busca
            </p>
          </div>

          <div className="space-y-6">
            <FormField
              control={control}
              name="seo_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título SEO</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Título otimizado para busca (máx. 60 caracteres)"
                      {...field}
                      maxLength={60}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/60 caracteres - Aparece nos resultados de busca
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="seo_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição SEO</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição que aparece nos resultados de busca (máx. 160 caracteres)"
                      {...field}
                      maxLength={160}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/160 caracteres - Meta description para buscadores
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* SEO Preview */}
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Preview do Google</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {watch('seo_title') || watch('title') || 'Título do Evento'}
                  </div>
                  <div className="text-green-700 text-sm">
                    meusite.com › eventos › {watch('slug') || 'evento'}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {watch('seo_description') || watch('summary') || 'Descrição do evento que aparecerá nos resultados de busca...'}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Keywords */}
            <FormField
              control={control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags/Palavras-chave</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="música, festa, eletrônica, são paulo (separadas por vírgula)"
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => {
                        const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                        field.onChange(tags);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Palavras-chave relevantes para o evento, separadas por vírgula
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </TabsContent>

        {/* Tickets */}
        <TabsContent value="tickets" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Informações de Ingressos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Configure informações sobre a venda de ingressos
            </p>
          </div>

          <div className="space-y-6">
            {/* Ticket URL */}
            <FormField
              control={control}
              name="ticket_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link para Compra de Ingressos</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Ticket className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="https://eventbrite.com/evento"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Link direto para a plataforma de venda de ingressos
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ticketing Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma de Venda</label>
                <Select
                  value={watchedTicketing.platform || ''}
                  onValueChange={(value) => updateTicketing('platform', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a plataforma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eventbrite">Eventbrite</SelectItem>
                    <SelectItem value="sympla">Sympla</SelectItem>
                    <SelectItem value="blueticket">Blue Ticket</SelectItem>
                    <SelectItem value="ingresse">Ingresse</SelectItem>
                    <SelectItem value="bilheteria_digital">Bilheteria Digital</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status da Venda</label>
                <Select
                  value={watchedTicketing.status || 'available'}
                  onValueChange={(value) => updateTicketing('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="coming_soon">Em breve</SelectItem>
                    <SelectItem value="sold_out">Esgotado</SelectItem>
                    <SelectItem value="closed">Vendas encerradas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket Rules */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Regras de Ingressos</h4>
                  <p className="text-sm text-muted-foreground">
                    Políticas de cancelamento, troca, etc.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTicketRule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Regra
                </Button>
              </div>

              {ticketRules.map((rule, index) => (
                <Card key={rule.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={control}
                            name={`ticket_rules.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título da Regra</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ex: Política de Cancelamento"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center space-x-2">
                            <FormField
                              control={control}
                              name={`ticket_rules.${index}.required`}
                              render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm">
                                    Regra obrigatória
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <FormField
                          control={control}
                          name={`ticket_rules.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrição</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Descrição detalhada da regra..."
                                  {...field}
                                  rows={3}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTicketRule(index)}
                        className="text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Accessibility */}
        <TabsContent value="accessibility" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Acessibilidade</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Informe sobre os recursos de acessibilidade disponíveis
            </p>
          </div>

          <div className="space-y-6">
            {/* Accessibility Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recursos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ACCESSIBILITY_FEATURES.map((feature) => (
                    <div key={feature.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature.id}
                        checked={watchedAccessibility[feature.id] || false}
                        onCheckedChange={(checked) => updateAccessibility(feature.id, !!checked)}
                      />
                      <label
                        htmlFor={feature.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Accessibility Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Informações Adicionais de Acessibilidade</label>
                <Textarea
                  placeholder="Descreva outros recursos de acessibilidade ou instruções especiais..."
                  value={watchedAccessibility.additional_info || ''}
                  onChange={(e) => updateAccessibility('additional_info', e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Contato para Acessibilidade</label>
                <Input
                  placeholder="Email ou telefone para dúvidas sobre acessibilidade"
                  value={watchedAccessibility.contact || ''}
                  onChange={(e) => updateAccessibility('contact', e.target.value)}
                />
              </div>
            </div>

            {/* Accessibility Badge */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Accessibility className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      Comprometimento com a Acessibilidade
                    </p>
                    <p className="text-sm text-green-600">
                      Eventos inclusivos garantem que todos possam participar e aproveitar a experiência.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};