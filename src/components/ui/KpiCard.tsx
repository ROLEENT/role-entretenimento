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
}

export function KpiCard({ 
  title, 
  value, 
  hint, 
  icon, 
  isLoading = false,
  className 
}: KpiCardProps) {
  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            {hint && <Skeleton className="h-4 w-24" />}
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold" aria-live="polite">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {hint && (
              <p className="text-xs text-muted-foreground mt-1">
                {hint}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}