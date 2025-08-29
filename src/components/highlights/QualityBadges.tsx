import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface QualityBadgesProps {
  data: {
    cover_url?: string;
    city?: string;
    start_at?: string;
    end_at?: string;
    slug?: string;
    title?: string;
  };
  slugError?: string | null;
}

export const QualityBadges = ({ data, slugError }: QualityBadgesProps) => {
  const badges = [];
  
  if (!data.cover_url) {
    badges.push({ label: 'Sem capa', variant: 'destructive' as const });
  }
  
  if (!data.city) {
    badges.push({ label: 'Sem cidade', variant: 'destructive' as const });
  }
  
  if (data.start_at && data.end_at && new Date(data.start_at) >= new Date(data.end_at)) {
    badges.push({ label: 'Datas invertidas', variant: 'destructive' as const });
  }
  
  if (!data.title?.trim()) {
    badges.push({ label: 'Sem título', variant: 'destructive' as const });
  }
  
  if (slugError) {
    badges.push({ label: 'Slug duplicado', variant: 'destructive' as const });
  }
  
  if (badges.length === 0) {
    return (
      <Badge className="bg-green-600 text-white flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Todas as validações OK
      </Badge>
    );
  }
  
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Badge key={index} variant={badge.variant} className="flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          {badge.label}
        </Badge>
      ))}
    </div>
  );
};