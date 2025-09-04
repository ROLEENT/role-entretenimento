import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type HighlightType = 'curatorial' | 'vitrine' | 'none';

interface HighlightBadgeProps {
  type: HighlightType;
  isSponsored?: boolean;
  className?: string;
}

const HIGHLIGHT_CONFIG = {
  curatorial: {
    label: 'Destaque Curatorial',
    icon: Star,
    variant: 'outline' as const,
    className: 'border-primary text-primary bg-transparent',
    ariaLabel: 'Destaque curatorial',
    tooltip: 'Selecionado pela curadoria do ROLÊ'
  },
  vitrine: {
    label: 'Vitrine Cultural',
    sublabel: 'patrocinado',
    icon: Megaphone,
    variant: 'default' as const,
    className: 'bg-primary text-primary-foreground',
    ariaLabel: 'Vitrine Cultural, conteúdo publicitário',
    tooltip: 'Conteúdo publicitário contratado pelo produtor'
  }
};

export function HighlightBadge({ type, isSponsored, className }: HighlightBadgeProps) {
  if (type === 'none' || !type) return null;

  const config = HIGHLIGHT_CONFIG[type];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, 'flex items-center gap-1.5 text-xs font-medium', className)}
      aria-label={config.ariaLabel}
      title={config.tooltip}
    >
      <Icon className="w-3 h-3" />
      <span>{config.label}</span>
      {type === 'vitrine' && (
        <span className="text-[10px] uppercase tracking-wider opacity-80">
          • {HIGHLIGHT_CONFIG.vitrine.sublabel}
        </span>
      )}
    </Badge>
  );
}