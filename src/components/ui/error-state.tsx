import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  msg: string;
  onRetry?: () => void;
}

export function ErrorState({ msg, onRetry }: ErrorStateProps) {
  return (
    <div 
      className="min-h-[70vh] flex items-center justify-center px-4 text-center"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
    >
      <div className="max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-400 mb-2">Ops. Algo deu errado</h2>
        <p className="text-sm text-white/80 mb-4">{msg}</p>
        <div className="flex gap-2 justify-center">
          {onRetry && (
            <Button 
              onClick={onRetry} 
              className="h-10 px-4 rounded-xl bg-[#c77dff] hover:bg-[#b968f5] text-black font-medium"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar página
            </Button>
          )}
          <Button 
            variant="outline" 
            className="h-10 px-4 rounded-xl border-white/20"
          >
            Tentar novamente
          </Button>
        </div>
      </div>
    </div>
  );
}