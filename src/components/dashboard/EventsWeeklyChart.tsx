import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function EventsWeeklyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Eventos por Semana</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart placeholder */}
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center">
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}