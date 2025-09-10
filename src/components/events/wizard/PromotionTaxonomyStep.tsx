import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Tag, Hash } from 'lucide-react';
import { RHFRadioGroup } from '@/components/form/RHFRadioGroup';
import { RHFCheckboxGroup } from '@/components/form/RHFCheckboxGroup';
import RHFInput from '@/components/form/RHFInput';
import RHFTextarea from '@/components/form/RHFTextarea';
import RHFDateTime from '@/components/form/RHFDateTime';
import { RHFSlider } from '@/components/form/RHFSlider';
import { RHFSelect } from '@/components/form/RHFSelect';
import { AgentesTagsInput } from '@/components/agentes/AgentesTagsInput';
import { addDays } from 'date-fns';

const PROMO_TYPE_OPTIONS = [
  {
    value: 'none',
    label: 'Nenhuma Promoção',
    description: 'Evento sem promoção especial'
  },
  {
    value: 'vitrine',
    label: 'Vitrine Cultural',
    description: 'Evento patrocinado com destaque na vitrine'
  },
  {
    value: 'destaque',
    label: 'Destaque ROLÊ',
    description: 'Evento curatorial destacado pela equipe'
  },
  {
    value: 'vitrine_destaque',
    label: 'Vitrine + Destaque',
    description: 'Ambas as modalidades de promoção'
  }
];

const VITRINE_PACKAGES = [
  { value: 'basico', label: 'Pacote Básico' },
  { value: 'premium', label: 'Pacote Premium' },
  { value: 'completo', label: 'Pacote Completo' }
];

const FEATURED_REASONS = [
  'curadoria forte',
  'proposta artística',
  'identidade visual',
  'experiência de público',
  'conexão com a cidade',
  'representatividade',
  'inovação'
];

export function PromotionTaxonomyStep() {
  console.log('🎪 PromotionTaxonomyStep renderizando...');
  const { watch, setValue, getValues } = useFormContext();
  
  const promoType = watch('promo_type') || 'none';
  const eventGenres = watch('event_genres') || [];
  const tags = watch('tags') || [];
  const lineupSlots = watch('lineup_slots') || [];
  const performances = watch('performances') || [];

  const showVitrineFields = ['vitrine', 'vitrine_destaque'].includes(promoType);
  const showFeaturedFields = ['destaque', 'vitrine_destaque'].includes(promoType);

  // Função para sugerir gêneros baseado no lineup/performances
  const handleGenreSuggestions = () => {
    const suggestedGenres: string[] = [];
    
    // Gêneros dos artistas do lineup
    lineupSlots.forEach((slot: any) => {
      if (slot.artists) {
        slot.artists.forEach((artist: any) => {
          // Aqui você pode implementar lógica para pegar gêneros dos artistas
          // Por enquanto, vamos simular
          if (artist.genres) {
            suggestedGenres.push(...artist.genres);
          }
        });
      }
    });

    // Gêneros das performances
    performances.forEach((performance: any) => {
      if (performance.performance_type) {
        // Mapear tipos de performance para gêneros
        const genreMap: Record<string, string[]> = {
          'musica': ['música ao vivo'],
          'dj-set': ['música eletrônica'],
          'teatro': ['teatro'],
          'danca': ['dança'],
          'drag-show': ['drag', 'entretenimento'],
          'poetry': ['poesia', 'literatura']
        };
        
        if (genreMap[performance.performance_type]) {
          suggestedGenres.push(...genreMap[performance.performance_type]);
        }
      }
    });

    // Remover duplicatas e pegar até 5
    const uniqueGenres = Array.from(new Set(suggestedGenres)).slice(0, 5);
    setValue('event_genres', uniqueGenres);
  };

  const formatWeight = (value: number) => `${value}%`;

  return (
    <div className="space-y-8">
      {/* Promoção do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Promoção do Evento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RHFRadioGroup
            name="promo_type"
            label="Tipo de Promoção"
            options={PROMO_TYPE_OPTIONS}
            orientation="vertical"
          />

          {showVitrineFields && (
            <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                  Vitrine Cultural
                </Badge>
              </h4>
              
              <RHFSelect
                name="vitrine_package"
                label="Pacote da Vitrine"
                placeholder="Selecione o pacote"
                options={VITRINE_PACKAGES}
                required
              />
              
              <RHFInput
                name="vitrine_order_id"
                label="ID do Pedido"
                placeholder="ex.: VC-2025-0912"
              />
              
              <RHFTextarea
                name="vitrine_notes"
                label="Observações da Vitrine"
                placeholder="Informações adicionais sobre o pacote..."
                rows={3}
              />
            </div>
          )}

          {showFeaturedFields && (
            <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <h4 className="font-medium text-orange-900 dark:text-orange-100 flex items-center gap-2">
                <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100">
                  Destaque ROLÊ
                </Badge>
              </h4>
              
              <RHFCheckboxGroup
                name="featured_reasons"
                label="Por que é destaque?"
                description="Escolha pelo menos 1 motivo que justifica o destaque"
                options={FEATURED_REASONS}
                orientation="vertical"
                min={1}
                required
              />
              
              <RHFInput
                name="featured_note"
                label="Nota Editorial"
                placeholder="Explique em poucas palavras por que este evento merece destaque..."
                required
              />
              
              <RHFDateTime
                name="featured_until"
                label="Destacar até"
              />
              
              <RHFSlider
                name="featured_weight"
                label="Peso do Destaque"
                description="Controla a posição nos blocos de destaque"
                min={0}
                max={100}
                formatValue={formatWeight}
                showValue
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Gêneros do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Gêneros do Evento
            </div>
            {(lineupSlots.length > 0 || performances.length > 0) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenreSuggestions}
                className="flex items-center gap-2"
              >
                <Star className="w-4 h-4" />
                Usar Sugestões
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentesTagsInput
            name="event_genres"
            label="Gêneros musicais e categorias"
            placeholder="Digite um gênero e pressione Enter..."
            maxTags={5}
          />
          
          {eventGenres.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">Gêneros selecionados:</p>
              <div className="flex flex-wrap gap-1">
                {eventGenres.map((genre: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Tags do Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgentesTagsInput
            name="tags"
            label="Tags livres para busca e SEO"
            placeholder="Digite uma tag e pressione Enter..."
            maxTags={10}
          />
          
          {tags.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground mb-2">Tags selecionadas:</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Use tags como nome da cidade, local do evento, 
              cena musical, tipo de público, etc. Elas ajudam na busca e no SEO.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}