import React, { useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, Image, Video, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RHFFileUploadProps {
  name: string;
  label?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  bucket?: string;
  folder?: string;
  className?: string;
}

interface FileWithProgress {
  file: File;
  progress: number;
  uploaded: boolean;
  url?: string;
  error?: string;
}

export const RHFFileUpload: React.FC<RHFFileUploadProps> = ({
  name,
  label,
  placeholder = "Selecione arquivos",
  description,
  disabled,
  required,
  accept = "*/*",
  multiple = false,
  maxFiles = 5,
  maxSize = 10, // 10MB default
  bucket = "uploads",
  folder = "files",
  className,
}) => {
  const { control } = useFormContext();
  const [uploading, setUploading] = useState<FileWithProgress[]>([]);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (file.type.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (file.type.includes('pdf') || file.type.includes('document')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSize}MB.`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileName = `${folder}/${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFiles = async (files: FileList, fieldValue: string[] | string, onChange: (value: any) => void) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const invalidFiles = fileArray.map(file => ({
      file,
      error: validateFile(file)
    })).filter(({ error }) => error);

    if (invalidFiles.length > 0) {
      invalidFiles.forEach(({ file, error }) => {
        toast.error(`${file.name}: ${error}`);
      });
      return;
    }

    // Check max files limit
    const currentFiles = Array.isArray(fieldValue) ? fieldValue : (fieldValue ? [fieldValue] : []);
    if (currentFiles.length + fileArray.length > maxFiles) {
      toast.error(`Máximo ${maxFiles} arquivos permitidos.`);
      return;
    }

    // Initialize upload progress
    const uploadingFiles: FileWithProgress[] = fileArray.map(file => ({
      file,
      progress: 0,
      uploaded: false
    }));

    setUploading(prev => [...prev, ...uploadingFiles]);

    // Upload files
    const uploadPromises = fileArray.map(async (file, index) => {
      try {
        const uploadingIndex = uploading.length + index;
        
        // Simulate progress (in real implementation, you'd use upload progress callback)
        const progressInterval = setInterval(() => {
          setUploading(prev => prev.map((item, i) => 
            i === uploadingIndex ? { ...item, progress: Math.min(item.progress + 10, 90) } : item
          ));
        }, 100);

        const url = await uploadFile(file);
        
        clearInterval(progressInterval);
        
        setUploading(prev => prev.map((item, i) => 
          i === uploadingIndex ? { ...item, progress: 100, uploaded: true, url } : item
        ));

        return url;
      } catch (error) {
        const uploadingIndex = uploading.length + index;
        setUploading(prev => prev.map((item, i) => 
          i === uploadingIndex ? { ...item, error: error instanceof Error ? error.message : 'Erro no upload' } : item
        ));
        toast.error(`Erro ao enviar ${file.name}`);
        return null;
      }
    });

    const urls = await Promise.all(uploadPromises);
    const validUrls = urls.filter(url => url !== null) as string[];

    // Update form value
    if (multiple) {
      onChange([...currentFiles, ...validUrls]);
    } else if (validUrls.length > 0) {
      onChange(validUrls[0]);
    }

    // Clear uploading state after delay
    setTimeout(() => {
      setUploading(prev => prev.filter(item => !item.uploaded && !item.error));
    }, 2000);
  };

  const removeFile = (index: number, fieldValue: string[] | string, onChange: (value: any) => void) => {
    if (Array.isArray(fieldValue)) {
      const newFiles = fieldValue.filter((_, i) => i !== index);
      onChange(newFiles);
    } else {
      onChange('');
    }
  };

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'arquivo';
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">{placeholder}</p>
                <Input
                  type="file"
                  accept={accept}
                  multiple={multiple}
                  disabled={disabled}
                  className="hidden"
                  id={`${name}-upload`}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFiles(e.target.files, field.value, field.onChange);
                      e.target.value = ''; // Reset input
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => document.getElementById(`${name}-upload`)?.click()}
                >
                  Selecionar Arquivos
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Máximo {maxFiles} arquivo(s), até {maxSize}MB cada
                </p>
              </div>

              {/* Uploading Files */}
              {uploading.length > 0 && (
                <div className="space-y-2">
                  {uploading.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      {getFileIcon(item.file)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.file.name}</p>
                        {item.error ? (
                          <p className="text-xs text-destructive">{item.error}</p>
                        ) : (
                          <Progress value={item.progress} className="h-1" />
                        )}
                      </div>
                      {item.uploaded && (
                        <Badge variant="outline" className="text-green-600">
                          Enviado
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Files */}
              {field.value && (
                <div className="space-y-2">
                  {(Array.isArray(field.value) ? field.value : [field.value]).map((url: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                      <File className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{getFileName(url)}</p>
                        <a 
                          href={url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          Ver arquivo
                        </a>
                      </div>
                      {!disabled && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index, field.value, field.onChange)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FormControl>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};