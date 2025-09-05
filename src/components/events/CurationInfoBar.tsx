import React from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

  const config = {
    curatorial: {
      icon: Info,
      text: 'Selecionado pela curadoria do ROLÊ',
      linkText: 'Por que é destaque?',
      className: 'bg-[#c77dff1a] border-[#c77dff]/20'
    },
    vitrine: {
      icon: ExternalLink,
      text: 'Conteúdo publicitário',
      linkText: 'Por que é destaque?',
      className: 'bg-[#c77dff1a] border-[#c77dff]/20'
    }
  };

  const currentConfig = config[normalizedType];
  const Icon = currentConfig.icon;

  return (
    <Card className={cn('rounded-xl border', currentConfig.className, className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-[#c77dff] flex-shrink-0" />
            <span className="text-sm text-foreground line-clamp-2">
              {currentConfig.text}
            </span>
          </div>
          
          {onShowCriteria && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowCriteria}
              className="text-xs text-[#c77dff] hover:text-[#c77dff] hover:bg-[#c77dff]/10 flex-shrink-0"
            >
              {currentConfig.linkText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}