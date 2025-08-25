import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  fileName?: string;
  onCancel?: () => void;
  className?: string;
}

export const UploadProgress = ({
  progress,
  status,
  fileName,
  onCancel,
  className
}: UploadProgressProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        if (progress < 30) return 'Preparando upload...';
        if (progress < 80) return 'Enviando arquivo...';
        return 'Processando...';
      case 'success':
        return 'Upload concluído!';
      case 'error':
        return 'Erro no upload';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-pulse" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={cn("space-y-2 p-4 bg-card border rounded-lg", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {fileName || 'Upload'}
          </span>
        </div>
        {status === 'uploading' && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancelar
          </button>
        )}
      </div>
      
      {status === 'uploading' && (
        <Progress value={progress} className="h-2" />
      )}
      
      <p className="text-xs text-muted-foreground">
        {getStatusMessage()}
      </p>
    </div>
  );
};