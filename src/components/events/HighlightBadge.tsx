import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type HighlightType = 'curatorial' | 'vitrine' | 'editorial' | 'sponsored' | 'none';

interface HighlightBadgeProps {
  type: HighlightType;
  isSponsored?: boolean;
  className?: string;
}

// Mapeamento para compatibilidade com dados existentes
const normalizeType = (type: HighlightType): 'curatorial' | 'vitrine' | 'none' => {
  if (type === 'editorial') return 'curatorial';
  if (type === 'sponsored') return 'vitrine';
  if (type === 'curatorial' || type === 'vitrine') return type;
  return 'none';
};

const HIGHLIGHT_CONFIG = {
  curatorial: {
    label: 'Destaque Curatorial',
    icon: Star,
    variant: 'outline' as const,
    className: 'border-[#c77dff] text-[#c77dff] bg-transparent hover:bg-[#c77dff]/5',
    ariaLabel: 'Destaque curatorial',
    tooltip: 'Selecionado pela curadoria do ROLÊ'
  },
  vitrine: {
    label: 'Vitrine Cultural',
    sublabel: 'patrocinado',
    icon: Megaphone,
    variant: 'default' as const,
    className: 'bg-[#c77dff] text-black border-[#c77dff] hover:bg-[#c77dff]/90',
    ariaLabel: 'Vitrine Cultural, conteúdo publicitário',
    tooltip: 'Conteúdo publicitário contratado pelo produtor'
  }
};

export function HighlightBadge({ type, isSponsored, className }: HighlightBadgeProps) {
  if (type === 'none' || !type) return null;

  const normalizedType = normalizeType(type);
  if (normalizedType === 'none') return null;

  const config = HIGHLIGHT_CONFIG[normalizedType];
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
      {(normalizedType === 'vitrine' || type === 'sponsored') && (
        <span className="text-[10px] uppercase tracking-wider font-semibold">
          • {HIGHLIGHT_CONFIG.vitrine.sublabel}
        </span>
      )}
    </Badge>
  );
}