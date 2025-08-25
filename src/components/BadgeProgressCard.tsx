import React from 'react';
import { Target, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import BadgeDisplay from './BadgeDisplay';
import { useGamification } from '@/hooks/useGamification';

interface BadgeProgressCardProps {
  limit?: number;
  className?: string;
}

const BadgeProgressCard: React.FC<BadgeProgressCardProps> = ({
  limit = 4,
  className
}) => {
  const { getUpcomingBadges, loading } = useGamification();
  
  const upcomingBadges = getUpcomingBadges().slice(0, limit);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (upcomingBadges.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Próximas Conquistas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Você conquistou todos os badges disponíveis!</p>
            <p className="text-sm mt-1">Continue participando para novos badges.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Próximas Conquistas</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {upcomingBadges.map((badge) => (
          <div key={badge.id} className="flex items-center space-x-3">
            <BadgeDisplay
              badge={badge}
              earned={false}
              progress={badge.progress}
              size="sm"
              showTooltip={false}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm truncate">{badge.name}</h4>
                <span 
                  className="text-xs font-medium"
                  style={{ color: badge.color }}
                >
                  {badge.progress.toFixed(0)}%
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                {badge.description}
              </p>
              
              <div className="space-y-1">
                <Progress 
                  value={badge.progress} 
                  className="h-1.5"
                />
                <p className="text-xs text-muted-foreground">
                  {badge.progressText}
                </p>
              </div>
            </div>
          </div>
        ))}

        {upcomingBadges.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center justify-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              Continue participando para conquistar mais badges!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BadgeProgressCard;