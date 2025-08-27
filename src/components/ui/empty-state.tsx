import { FileX, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  msg: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ msg, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FileX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Nenhum resultado encontrado</h3>
        <p className="text-muted-foreground mb-4">{msg}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="gap-2">
            <Plus className="w-4 h-4" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}