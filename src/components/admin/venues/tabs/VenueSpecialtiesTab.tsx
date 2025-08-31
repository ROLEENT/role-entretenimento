import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { VenueFormData } from '@/schemas/venue';
import { Star, Utensils, Wine, Shield, Accessibility, Users } from 'lucide-react';

interface VenueSpecialtiesTabProps {
  form: UseFormReturn<VenueFormData>;
}

export const VenueSpecialtiesTab: React.FC<VenueSpecialtiesTabProps> = ({ form }) => {
  const { register, watch, setValue } = form;
  
  const diferenciais = watch('diferenciais');
  const bebidas = watch('bebidas');
  const cozinha = watch('cozinha');
  const seguranca = watch('seguranca');
  const acessibilidade = watch('acessibilidade');
  const banheiros = watch('banheiros');

  const handleCheckboxChange = (section: string, field: string, checked: boolean) => {
    setValue(`${section}.${field}` as any, checked);
  };

  const handleNumberChange = (section: string, field: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setValue(`${section}.${field}` as any, numValue);
  };

  const diferenciaisList = [
    { key: 'dj', label: 'DJ' },
    { key: 'happy_hour', label: 'Happy Hour' },
    { key: 'mesa_bilhar', label: 'Mesa de Bilhar' },
    { key: 'jogos_arcade', label: 'Jogos Arcade' },
    { key: 'karaoke', label: 'Karaokê' },
    { key: 'narguile', label: 'Narguilé' },
    { key: 'transmissao_eventos_esportivos', label: 'Transmissão de Eventos Esportivos' },
    { key: 'shows_ao_vivo', label: 'Shows ao Vivo' },
    { key: 'stand_up', label: 'Stand-up' },
    { key: 'musica_ao_vivo', label: 'Música ao Vivo' },
    { key: 'amigavel_lgbtqia', label: 'Amigável LGBTQIA+' },
  ];

  const bebidasList = [
    { key: 'menu_cervejas', label: 'Menu de Cervejas' },
    { key: 'cervejas_artesanais', label: 'Cervejas Artesanais' },
    { key: 'coqueteis_classicos', label: 'Coquetéis Clássicos' },
    { key: 'coqueteis_autorais', label: 'Coquetéis Autorais' },
    { key: 'menu_vinhos', label: 'Menu de Vinhos' },
  ];

  const cozinhaList = [
    { key: 'serve_comida', label: 'Serve Comida' },
    { key: 'opcoes_veganas', label: 'Opções Veganas' },
    { key: 'opcoes_vegetarianas', label: 'Opções Vegetarianas' },
    { key: 'opcoes_sem_gluten', label: 'Opções sem Glúten' },
    { key: 'opcoes_sem_lactose', label: 'Opções sem Lactose' },
    { key: 'menu_kids', label: 'Menu Kids' },
  ];

  const segurancaList = [
    { key: 'equipe_seguranca', label: 'Equipe de Segurança' },
    { key: 'bombeiros_local', label: 'Bombeiros no Local' },
    { key: 'saidas_emergencia_sinalizadas', label: 'Saídas de Emergência Sinalizadas' },
  ];

  const acessibilidadeList = [
    { key: 'elevador_acesso', label: 'Elevador de Acesso' },
    { key: 'rampa_cadeirantes', label: 'Rampa para Cadeirantes' },
    { key: 'banheiro_acessivel', label: 'Banheiro Acessível' },
    { key: 'cardapio_braille', label: 'Cardápio em Braille' },
    { key: 'audio_acessivel', label: 'Áudio Acessível' },
    { key: 'area_caes_guia', label: 'Área para Cães Guia' },
  ];

  return (
    <div className="space-y-6">
      {/* Diferenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Diferenciais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="diferenciais.descricao">Descrição dos Diferenciais</Label>
            <Textarea
              id="diferenciais.descricao"
              placeholder="Descreva os principais diferenciais do local..."
              {...register('diferenciais.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {diferenciaisList.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`diferenciais.${key}`}
                    checked={Boolean(diferenciais?.[key as keyof typeof diferenciais]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('diferenciais', key, checked as boolean)
                    }
                  />
                <Label
                  htmlFor={`diferenciais.${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bebidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5" />
            Bebidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bebidas.descricao">Descrição das Bebidas</Label>
            <Textarea
              id="bebidas.descricao"
              placeholder="Descreva o cardápio de bebidas..."
              {...register('bebidas.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {bebidasList.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bebidas.${key}`}
                    checked={Boolean(bebidas?.[key as keyof typeof bebidas]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('bebidas', key, checked as boolean)
                    }
                  />
                <Label
                  htmlFor={`bebidas.${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cozinha */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Cozinha
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="cozinha.descricao">Descrição da Cozinha</Label>
            <Textarea
              id="cozinha.descricao"
              placeholder="Descreva o cardápio e opções gastronômicas..."
              {...register('cozinha.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cozinhaList.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cozinha.${key}`}
                    checked={Boolean(cozinha?.[key as keyof typeof cozinha]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('cozinha', key, checked as boolean)
                    }
                  />
                <Label
                  htmlFor={`cozinha.${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seguranca.descricao">Descrição de Segurança</Label>
            <Textarea
              id="seguranca.descricao"
              placeholder="Descreva as medidas de segurança do local..."
              {...register('seguranca.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {segurancaList.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`seguranca.${key}`}
                    checked={Boolean(seguranca?.[key as keyof typeof seguranca]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('seguranca', key, checked as boolean)
                    }
                  />
                <Label
                  htmlFor={`seguranca.${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acessibilidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Accessibility className="h-5 w-5" />
            Acessibilidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="acessibilidade.descricao">Descrição de Acessibilidade</Label>
            <Textarea
              id="acessibilidade.descricao"
              placeholder="Descreva os recursos de acessibilidade..."
              {...register('acessibilidade.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {acessibilidadeList.map(({ key, label }) => (
              <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`acessibilidade.${key}`}
                    checked={Boolean(acessibilidade?.[key as keyof typeof acessibilidade]) || false}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('acessibilidade', key, checked as boolean)
                    }
                  />
                <Label
                  htmlFor={`acessibilidade.${key}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Banheiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Banheiros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="banheiros.descricao">Descrição dos Banheiros</Label>
            <Textarea
              id="banheiros.descricao"
              placeholder="Descreva informações adicionais sobre os banheiros..."
              {...register('banheiros.descricao')}
              className="min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="banheiros.masculinos">Masculinos</Label>
              <input
                type="number"
                id="banheiros.masculinos"
                min="0"
                value={banheiros?.masculinos || 0}
                onChange={(e) => handleNumberChange('banheiros', 'masculinos', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="banheiros.femininos">Femininos</Label>
              <input
                type="number"
                id="banheiros.femininos"
                min="0"
                value={banheiros?.femininos || 0}
                onChange={(e) => handleNumberChange('banheiros', 'femininos', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
            <div>
              <Label htmlFor="banheiros.genero_neutro">Gênero Neutro</Label>
              <input
                type="number"
                id="banheiros.genero_neutro"
                min="0"
                value={banheiros?.genero_neutro || 0}
                onChange={(e) => handleNumberChange('banheiros', 'genero_neutro', e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};