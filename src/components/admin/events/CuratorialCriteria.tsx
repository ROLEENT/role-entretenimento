import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, CheckCircle2 } from 'lucide-react';

interface CuratorialCriteriaProps {
  form: UseFormReturn<any>;
}

export type CuratorialCriterion = { 
  checked: boolean; 
  note?: string; 
};

export type CuratorialCriteria = {
  cultural_relevance: CuratorialCriterion;
  lineup: CuratorialCriterion;
  visual_identity: CuratorialCriterion;
  audience_experience: CuratorialCriterion;
  city_connection: CuratorialCriterion;
  audience_fit: CuratorialCriterion;
  engagement_potential: CuratorialCriterion;
  authenticity_innovation: CuratorialCriterion;
  lgbtqiap_diversity: CuratorialCriterion;
  community_support: CuratorialCriterion;
};

interface CriterionData {
  key: string;
  title: string;
  description: string;
}

const CRITERIA: CriterionData[] = [
  {
    key: 'cultural_relevance',
    title: 'Relevância cultural',
    description: 'Este evento dialoga com a cena e amplia repertório cultural?'
  },
  {
    key: 'lineup',
    title: 'Line-up ou proposta artística',
    description: 'Curadoria coerente, autêntica e provocativa?'
  },
  {
    key: 'visual_identity',
    title: 'Identidade visual e comunicação',
    description: 'Arte e texto bem cuidados, alinhados ao público?'
  },
  {
    key: 'audience_experience',
    title: 'Experiência para o público',
    description: 'Ambientação, acessibilidade e camadas além da música?'
  },
  {
    key: 'city_connection',
    title: 'Conexão com a cidade',
    description: 'Ocupa e ressignifica espaços urbanos e culturais?'
  },
  {
    key: 'audience_fit',
    title: 'Coerência com o público do ROLÊ',
    description: 'Alinha com nosso público urbano e criativo?'
  },
  {
    key: 'engagement_potential',
    title: 'Potencial de engajamento',
    description: 'Gera desejo de compartilhar, comentar e estar?'
  },
  {
    key: 'authenticity_innovation',
    title: 'Autenticidade ou inovação',
    description: 'Mostra identidade própria ou mistura ousada?'
  },
  {
    key: 'lgbtqiap_diversity',
    title: 'Diversidade e representatividade LGBTQIAP+',
    description: 'Presença de artistas, equipes e público queer com políticas claras de respeito e segurança?'
  },
  {
    key: 'community_support',
    title: 'Impacto comunitário e suporte à cena',
    description: 'Ação com coletivos, contratação local, formação, preços acessíveis, ações solidárias?'
  }
];

export function CuratorialCriteria({ form }: CuratorialCriteriaProps) {
  const curatorialCriteria = form.watch('curatorial_criteria') || {};

  // Calcular quantos critérios estão marcados
  const checkedCount = CRITERIA.filter(criterion => 
    curatorialCriteria[criterion.key]?.checked === true
  ).length;

  const getScoreColor = (count: number) => {
    if (count >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (count >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (count >= 3) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreText = (count: number) => {
    if (count >= 7) return 'Potencial alto para destaque';
    if (count >= 5) return 'Potencial médio para destaque';
    if (count >= 3) return 'Potencial baixo para destaque';
    return 'Não recomendado para destaque';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>Critérios de Curadoria</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`${getScoreColor(checkedCount)} font-medium`}
            >
              {checkedCount}/10 critérios
            </Badge>
            {checkedCount > 0 && (
              <span className={`text-sm ${getScoreColor(checkedCount).split(' ')[0]}`}>
                {getScoreText(checkedCount)}
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Avalie este evento com base nos critérios de curadoria do ROLÊ para definir se deve ser um destaque curatorial.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {CRITERIA.map((criterion, index) => (
          <div key={criterion.key} className="space-y-3 p-4 border rounded-lg bg-background/50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1 space-y-2">
                <FormField
                  control={form.control}
                  name={`curatorial_criteria.${criterion.key}.checked`}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value || false}
                          onCheckedChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-base flex items-center gap-2">
                          {criterion.title}
                          {field.value && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {criterion.description}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`curatorial_criteria.${criterion.key}.note`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Adicione uma justificativa ou observação (opcional)"
                          className="min-h-[60px] text-sm"
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        ))}
        
        {checkedCount > 0 && (
          <div className={`p-4 rounded-lg border ${getScoreColor(checkedCount)} bg-opacity-50`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Avaliação Automática:</span>
              <span>{getScoreText(checkedCount)}</span>
            </div>
            <p className="text-sm mt-1 opacity-80">
              Com base nos {checkedCount} critérios marcados, este evento {checkedCount >= 5 ? 'pode ser considerado' : 'não é recomendado'} para destaque curatorial.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}