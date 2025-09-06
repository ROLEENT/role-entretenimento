import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Star } from 'lucide-react';
import { CuratorialCriteria } from '@/schemas/eventSchema';

interface CuratorialCriteriaDisplayProps {
  criteria?: CuratorialCriteria;
}

const CRITERIA_LABELS = {
  cultural_relevance: 'Relevância cultural',
  lineup: 'Line-up ou proposta artística', 
  visual_identity: 'Identidade visual e comunicação',
  experience: 'Experiência para o público',
  city_connection: 'Conexão com a cidade',
  audience_coherence: 'Coerência com o público do ROLÊ',
  engagement_potential: 'Potencial de engajamento',
  innovation: 'Inovação ou autenticidade'
};

export function CuratorialCriteriaDisplay({ criteria }: CuratorialCriteriaDisplayProps) {
  if (!criteria) return null;

  const checkedCriteria = Object.entries(criteria).filter(([_, value]) => value?.checked === true);
  const totalScore = checkedCriteria.length;

  if (totalScore === 0) return null;

  const getScoreColor = (score: number) => {
    if (score >= 6) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (score >= 2) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getScoreText = (score: number) => {
    if (score >= 6) return 'Alto potencial para destaque';
    if (score >= 4) return 'Médio potencial para destaque';
    if (score >= 2) return 'Baixo potencial para destaque';
    return 'Não recomendado para destaque';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Critérios de Curadoria</CardTitle>
          </div>
          <Badge 
            variant="outline" 
            className={`${getScoreColor(totalScore)} font-medium`}
          >
            {totalScore}/8 critérios
          </Badge>
        </div>
        <p className={`text-sm ${getScoreColor(totalScore).split(' ')[0]}`}>
          {getScoreText(totalScore)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(CRITERIA_LABELS).map(([key, label]) => {
            const criterion = criteria[key as keyof CuratorialCriteria];
            const isChecked = criterion?.checked === true;
            
            return (
              <div key={key} className="flex items-start gap-2 p-2 rounded border">
                {isChecked ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${isChecked ? 'text-green-800' : 'text-gray-500'}`}>
                    {label}
                  </p>
                  {criterion?.note && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {criterion.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}