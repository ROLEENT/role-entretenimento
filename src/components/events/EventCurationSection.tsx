import React from 'react';
import { CurationChips } from './CurationChips';
import { useCurationData } from '@/hooks/useCurationData';
import { Badge } from '@/components/ui/badge';

interface EventCurationSectionProps {
  eventId: string;
  highlightType?: string;
  className?: string;
}

// Mapeamento para compatibilidade com dados existentes
const isCuratorialType = (type?: string): boolean => {
  return type === 'curatorial' || type === 'editorial';
};

export function EventCurationSection({ eventId, highlightType, className }: EventCurationSectionProps) {
  const { data: curationData, isLoading } = useCurationData(eventId);

  // Só exibe para eventos curatoriais com chips
  if (!isCuratorialType(highlightType)) return null;
  if (isLoading || !curationData?.chips?.length) return null;

  return (
    <section className={className} data-event-curation>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-foreground">
            Este evento se destaca por
          </h3>
          {curationData.score > 0 && (
            <Badge variant="outline" className="text-xs">
              {curationData.score} de 8 critérios
            </Badge>
          )}
        </div>
        
        <CurationChips 
          chips={curationData.chips} 
          variant="secondary"
          maxChips={3}
        />
        
        {curationData.notes && (
          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-2 border-[#c77dff]">
            {curationData.notes}
          </p>
        )}
      </div>
    </section>
  );
}