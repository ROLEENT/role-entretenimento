import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Upload, X, RotateCcw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  className?: string;
  bucket?: string;
  maxSize?: number; // em MB
  allowedTypes?: string[];
  showPreview?: boolean;
  onPreview?: () => void;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  className,
  bucket = 'admin',
  maxSize = 5,
  allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'],
  showPreview = false,
  onPreview
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de arquivo não suportado. Use: ${allowedTypes.join(', ')}`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSize}MB`;
    }
    
    return null;
  };

  const uploadFile = useCallback(async (file: File) => {
    const validation = validateFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      // Gerar nome único
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const extension = file.name.split('.').pop();
      const fileName = `${timestamp}_${randomStr}.${extension}`;
      const filePath = `covers/${fileName}`;

      // Upload com progresso
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      setProgress(100);
      toast.success('Imagem enviada com sucesso!');
      
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setError(error.message || 'Erro ao enviar arquivo');
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [bucket, maxSize, allowedTypes, onChange]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadFile]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      uploadFile(file);
    }
  }, [uploadFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback(() => {
    onRemove();
    setError(null);
    toast.success('Imagem removida');
  }, [onRemove]);

  const retry = useCallback(() => {
    setError(null);
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          uploading ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          value && "border-solid border-border"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !uploading && !value && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {value ? (
          <div className="relative">
            <img
              src={value}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg object-cover"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              {showPreview && onPreview && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview();
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : uploading ? (
          <div className="space-y-3">
            <Upload className="h-8 w-8 mx-auto text-primary animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground">Enviando...</p>
              <Progress value={progress} className="mt-2" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Clique ou arraste uma imagem</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, JPEG, WebP até {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error with Retry */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={retry}
              className="ml-2"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}