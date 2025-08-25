import React from 'react';
import { Badge as BadgeIcon, Trophy, Award, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge as BadgeType } from '@/hooks/useGamification';

interface BadgeDisplayProps {
  badge: BadgeType;
  earned?: boolean;
  earnedAt?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badge,
  earned = false,
  earnedAt,
  progress = 0,
  size = 'md',
  showTooltip = true,
  className
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return Award;
      case 'milestone': return Trophy;
      case 'special': return Zap;
      default: return Star;
    }
  };

  const TypeIcon = getTypeIcon(badge.type);

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-20 h-20 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn('relative group', className)}>
      <Card className={cn(
        'transition-all duration-200',
        sizeClasses[size],
        earned 
          ? 'border-2 hover:scale-110 hover:shadow-lg cursor-pointer' 
          : 'border border-dashed opacity-60 hover:opacity-80',
        earned && 'hover:border-primary/50'
      )}
      style={{ borderColor: earned ? badge.color : undefined }}
      >
        <CardContent className="p-2 flex flex-col items-center justify-center h-full relative">
          {/* Ícone do badge */}
          <div 
            className={cn(
              'text-center flex flex-col items-center justify-center',
              earned ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            <div className="text-lg mb-1">{badge.icon}</div>
            {size !== 'sm' && (
              <TypeIcon className={cn(iconSizes[size], 'mx-auto')} />
            )}
          </div>

          {/* Barra de progresso para badges não conquistados */}
          {!earned && progress > 0 && (
            <div className="absolute bottom-1 left-1 right-1">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${progress}%`,
                    backgroundColor: badge.color 
                  }}
                />
              </div>
            </div>
          )}

          {/* Indicador de conquista recente */}
          {earned && earnedAt && (
            <div className="absolute -top-1 -right-1">
              <div 
                className="w-3 h-3 rounded-full border-2 border-background"
                style={{ backgroundColor: badge.color }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tooltip com informações */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-popover text-popover-foreground px-3 py-2 rounded-lg shadow-lg border max-w-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{badge.name}</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{ backgroundColor: badge.color + '20', color: badge.color }}
              >
                {badge.type}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {badge.description}
            </p>
            
            {earned && earnedAt && (
              <p className="text-xs text-green-600 font-medium">
                Conquistado em {new Date(earnedAt).toLocaleDateString('pt-BR')}
              </p>
            )}
            
            {!earned && progress > 0 && (
              <div className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-muted-foreground">Progresso:</span>
                  <span className="font-medium" style={{ color: badge.color }}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-1">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: badge.color 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;