import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type CriterionKey = 'relevancia' | 'qualidade' | 'diversidade' | 'impacto' | 'coerencia' | 'experiencia' | 'tecnica' | 'acessibilidade';

interface CurationChipsProps {
  chips: string[];
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  maxChips?: number;
}

const CHIP_LABELS: Record<string, string> = {
  relevancia: 'Relevância Cultural',
  qualidade: 'Qualidade Artística', 
  diversidade: 'Diversidade',
  impacto: 'Impacto Local',
  coerencia: 'Coerência',
  experiencia: 'Experiência',
  tecnica: 'Produção',
  acessibilidade: 'Acessibilidade'
};

export function CurationChips({ 
  chips, 
  className, 
  variant = 'secondary',
  maxChips = 3 
}: CurationChipsProps) {
  if (!chips || chips.length === 0) return null;

  const displayChips = chips.slice(0, maxChips);
  const hasMore = chips.length > maxChips;

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {displayChips.map((chip) => (
        <Badge
          key={chip}
          variant={variant}
          className="text-xs font-medium"
        >
          {CHIP_LABELS[chip] || chip}
        </Badge>
      ))}
      {hasMore && (
        <Badge variant="outline" className="text-xs">
          +{chips.length - maxChips} mais
        </Badge>
      )}
    </div>
  );
}