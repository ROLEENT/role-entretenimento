import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  isLoading?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function KpiCard({ 
  title, 
  value, 
  hint, 
  icon, 
  isLoading = false,
  className,
  'aria-label': ariaLabel
}: KpiCardProps) {
  return (
    <Card className={cn("dashboard-card", className)} aria-label={ariaLabel} data-testid="kpi-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground" id={`kpi-${title.toLowerCase()}`}>
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground" aria-hidden="true">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div 
            className="space-y-2" 
            role="status" 
            aria-live="polite"
            aria-label={`Carregando ${title}`}
          >
            <Skeleton className="h-8 w-16" />
            {hint && <Skeleton className="h-4 w-24" />}
          </div>
        ) : (
          <>
            <div 
              className="text-2xl font-bold" 
              aria-live="polite"
              aria-labelledby={`kpi-${title.toLowerCase()}`}
            >
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </div>
            {hint && (
              <p className="text-xs text-foreground/70 mt-1">
                {hint}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}