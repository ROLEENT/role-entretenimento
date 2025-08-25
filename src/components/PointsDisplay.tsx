import React from 'react';
import { TrendingUp, Zap, Calendar, Target } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useGamification } from '@/hooks/useGamification';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface PointsDisplayProps {
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({
  compact = false,
  showDetails = true,
  className
}) => {
  const { user } = useAuth();
  const { userPoints, loading, getLevelDetails } = useGamification();

  if (!user || loading || !userPoints) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-8 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const levelDetails = getLevelDetails(userPoints.level, userPoints.total_points);

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-2', className)}>
        <div className="flex items-center space-x-1">
          <span className="text-2xl">{levelDetails.current.icon}</span>
          <span className="font-semibold text-sm">{userPoints.total_points}</span>
        </div>
        <Badge 
          variant="secondary"
          style={{ backgroundColor: levelDetails.current.color + '20', color: levelDetails.current.color }}
        >
          {levelDetails.current.name}
        </Badge>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>Seus Pontos</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{levelDetails.current.icon}</span>
            <Badge 
              variant="secondary"
              style={{ backgroundColor: levelDetails.current.color + '20', color: levelDetails.current.color }}
            >
              {levelDetails.current.name}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pontos totais */}
        <div className="text-center">
          <div className="text-3xl font-bold text-primary mb-1">
            {userPoints.total_points.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            pontos totais
          </div>
        </div>

        {/* Progresso para próximo nível */}
        {levelDetails.next && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso para {levelDetails.next.name}</span>
              <span className="font-medium">
                {levelDetails.pointsToNext} pontos restantes
              </span>
            </div>
            <Progress 
              value={levelDetails.progress} 
              className="h-2"
            />
          </div>
        )}

        {showDetails && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {/* Pontos mensais */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              <div className="font-semibold text-blue-600">
                {userPoints.monthly_points}
              </div>
              <div className="text-xs text-muted-foreground">
                Este mês
              </div>
            </div>

            {/* Sequência atual */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Zap className="h-4 w-4 text-orange-500" />
              </div>
              <div className="font-semibold text-orange-600">
                {userPoints.current_streak}
              </div>
              <div className="text-xs text-muted-foreground">
                Dias seguidos
              </div>
            </div>

            {/* Melhor sequência */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div className="font-semibold text-green-600">
                {userPoints.best_streak}
              </div>
              <div className="text-xs text-muted-foreground">
                Recorde
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsDisplay;