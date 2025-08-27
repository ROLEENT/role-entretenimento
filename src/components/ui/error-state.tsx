import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  msg: string;
  onRetry?: () => void;
}

export function ErrorState({ msg, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/20">
      <CardContent className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Oops! Algo deu errado</h3>
        <p className="text-muted-foreground mb-4">{msg}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}