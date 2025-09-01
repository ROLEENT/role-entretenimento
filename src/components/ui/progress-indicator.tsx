import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, AlertCircle, TrendingUp } from 'lucide-react';
import { CompletionInfo, CompletionStatus } from '@/hooks/useCompletionStatus';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  completion: CompletionInfo;
  title?: string;
  className?: string;
  showRecommendations?: boolean;
  compact?: boolean;
}

const statusConfig: Record<CompletionStatus, {
  color: string;
  bgColor: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = {
  complete: {
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    icon: CheckCircle,
    label: 'Completo',
  },
  good: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: TrendingUp,
    label: 'Bom progresso',
  },
  incomplete: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    icon: AlertCircle,
    label: 'Incompleto',
  },
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  completion,
  title = 'Progresso do Perfil',
  className,
  showRecommendations = true,
  compact = false,
}) => {
  const config = statusConfig[completion.status];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Progress value={completion.percentage} className="h-2 flex-1" />
        <Badge variant={completion.status === 'complete' ? 'default' : 'secondary'} className="text-xs">
          {completion.percentage}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn(config.bgColor, className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn('h-4 w-4', config.color)} />
          {title}
          <Badge variant={completion.status === 'complete' ? 'default' : 'secondary'}>
            {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {completion.completedFields.length} de {Object.keys(completion.currentScore > 0 ? {} : {}).length + completion.missingImportantFields.length + completion.completedFields.length} campos preenchidos
            </span>
            <span className={cn('font-medium', config.color)}>
              {completion.percentage}%
            </span>
          </div>
          <Progress value={completion.percentage} className="h-2" />
        </div>

        {showRecommendations && completion.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Sugestões para melhorar o perfil:
            </h4>
            <ul className="space-y-1">
              {completion.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Circle className="h-3 w-3" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Simple badge component for use in lists
interface CompletionBadgeProps {
  completion: CompletionInfo;
  className?: string;
}

export const CompletionBadge: React.FC<CompletionBadgeProps> = ({
  completion,
  className,
}) => {
  const config = statusConfig[completion.status];

  return (
    <Badge 
      variant={completion.status === 'complete' ? 'default' : 'secondary'}
      className={cn('text-xs', className)}
    >
      <config.icon className="h-3 w-3 mr-1" />
      {completion.percentage}%
    </Badge>
  );
};

// Inline progress component for forms
interface InlineProgressProps {
  completion: CompletionInfo;
  className?: string;
}

export const InlineProgress: React.FC<InlineProgressProps> = ({
  completion,
  className,
}) => {
  const config = statusConfig[completion.status];

  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-lg', config.bgColor, className)}>
      <config.icon className={cn('h-4 w-4', config.color)} />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{config.label}</span>
          <span className={cn('text-sm font-medium', config.color)}>
            {completion.percentage}%
          </span>
        </div>
        <Progress value={completion.percentage} className="h-1.5" />
      </div>
    </div>
  );
};