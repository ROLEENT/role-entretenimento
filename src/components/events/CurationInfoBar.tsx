import React from 'react';
import { Button } from '@/components/ui/button';
import { Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurationInfoBarProps {
  type: 'curatorial' | 'vitrine';
  onShowCriteria?: () => void;
  className?: string;
}

export function CurationInfoBar({ type, onShowCriteria, className }: CurationInfoBarProps) {
  if (type === 'curatorial') {
    return (
      <div className={cn(
        'bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between gap-3',
        className
      )}>
        <div className="flex items-center gap-2 text-sm text-primary">
          <Info className="w-4 h-4" />
          <span>Este evento foi selecionado pela curadoria do ROLÊ</span>
        </div>
        {onShowCriteria && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowCriteria}
            className="text-primary hover:bg-primary/10 h-auto py-1 px-2"
          >
            Por que é destaque?
          </Button>
        )}
      </div>
    );
  }

  if (type === 'vitrine') {
    return (
      <div className={cn(
        'bg-muted border rounded-lg p-3 flex items-center justify-between gap-3',
        className
      )}>
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