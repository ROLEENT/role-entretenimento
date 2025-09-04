import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurationInfoBarProps {
  type: 'curatorial' | 'vitrine' | 'editorial' | 'sponsored';
  onShowCriteria?: () => void;
  className?: string;
}

// Mapeamento para compatibilidade com dados existentes
const normalizeType = (type: CurationInfoBarProps['type']): 'curatorial' | 'vitrine' => {
  if (type === 'editorial') return 'curatorial';
  if (type === 'sponsored') return 'vitrine';
  return type as 'curatorial' | 'vitrine';
};

export function CurationInfoBar({ type, onShowCriteria, className }: CurationInfoBarProps) {
  const normalizedType = normalizeType(type);

  if (normalizedType === 'curatorial') {
    return (
      <div 
        className={cn(
          'bg-[#c77dff]/5 border border-[#c77dff]/20 rounded-lg p-3 flex items-center justify-between gap-3',
          className
        )}
        data-curation-type="curatorial"
      >
        <div className="flex items-center gap-2 text-sm text-[#c77dff]">
          <Info className="w-4 h-4" />
          <span>Este evento foi selecionado pela curadoria do ROLÊ</span>
        </div>
        {onShowCriteria && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowCriteria}
            className="text-[#c77dff] hover:bg-[#c77dff]/10 h-auto py-1 px-2"
          >
            Por que é destaque?
          </Button>
        )}
      </div>
    );
  }

  if (normalizedType === 'vitrine') {
    return (
      <div 
        className={cn(
          'bg-muted border rounded-lg p-3 flex items-center justify-between gap-3',
          className
        )}
        data-curation-type="vitrine"
        data-sponsor="true"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ExternalLink className="w-4 h-4" />
          <span>
            <strong>Parceria comercial</strong> • Conteúdo publicitário contratado pelo produtor
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const descSection = document.querySelector('[data-event-description]');
            descSection?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-muted-foreground hover:bg-muted/80 h-auto py-1 px-2"
        >
          Ver detalhes
        </Button>
      </div>
    );
  }

  return null;
}