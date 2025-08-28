import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ImageOff, MapPin, Calendar, Hash } from 'lucide-react';
import { AdvancedHighlightFormData } from '@/lib/advancedHighlightSchema';

interface QualityBadgesProps {
  data: Partial<AdvancedHighlightFormData>;
}

export const QualityBadges = ({ data }: QualityBadgesProps) => {
  const badges = [];

  if (!data.cover_url) {
    badges.push({
      type: 'warning',
      text: 'Sem capa',
      icon: ImageOff,
      tooltip: 'Imagem de capa é obrigatória para publicação'
    });
  }

  if (!data.city) {
    badges.push({
      type: 'warning', 
      text: 'Sem cidade',
      icon: MapPin,
      tooltip: 'Cidade é obrigatória para publicação'
    });
  }

  if (data.start_at && data.end_at && new Date(data.start_at) >= new Date(data.end_at)) {
    badges.push({
      type: 'error',
      text: 'Datas invertidas',
      icon: Calendar,
      tooltip: 'Data de fim deve ser posterior à data de início'
    });
  }

  // TODO: verificar slug duplicado quando conectado ao backend
  // if (data.slug && isDuplicateSlug) {
  //   badges.push({
  //     type: 'error',
  //     text: 'Slug duplicado',
  //     icon: Hash,
  //     tooltip: 'Este slug já está sendo usado por outro destaque'
  //   });
  // }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
        <AlertTriangle className="w-4 h-4" />
        Problemas de qualidade:
      </div>
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <Badge
            key={index}
            variant={badge.type === 'error' ? 'destructive' : 'secondary'}
            className="gap-1"
            title={badge.tooltip}
          >
            <Icon className="w-3 h-3" />
            {badge.text}
          </Badge>
        );
      })}
    </div>
  );
};