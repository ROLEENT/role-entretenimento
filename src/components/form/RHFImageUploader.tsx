"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { BaseFormFieldProps } from "@/lib/forms";
import { useStorageUpload } from "@/hooks/useStorageUpload";
import { useToast } from "@/hooks/use-toast";

interface ImageWithAlt {
  url: string;
  alt: string;
}

interface RHFImageUploaderProps extends BaseFormFieldProps {
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  preview?: boolean;
  requireAlt?: boolean; // Whether alt text is required
  maxAltLength?: number; // Character limit for alt text
}

export default function RHFImageUploader({
  name,
  label,
  description,
  disabled,
  required,
  className,
  accept = "image/*",
  maxSize = 5,
  multiple = false,
  preview = true,
  requireAlt = true,
  maxAltLength = 200,
}: RHFImageUploaderProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { uploadFile, uploading } = useStorageUpload();
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldError = errors[name];

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo ${maxSize}MB.`;
    }
    
    if (!file.type.startsWith('image/')) {
      return 'Apenas imagens são permitidas.';
    }
    
    return null;
  };

  const handleFileSelect = async (files: FileList | null, onChange: (value: any) => void, currentValue: any) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const validationError = validateFile(file);
    
    if (validationError) {
      toast({
        title: "Erro no upload",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    try {
      const url = await uploadFile(file);
      
      if (url) {
        const imageData: ImageWithAlt = {
          url,
          alt: requireAlt ? "" : `Image: ${file.name}`,
        };
        
        if (multiple) {
          const newValue = Array.isArray(currentValue) ? [...currentValue, imageData] : [imageData];
          onChange(newValue);
        } else {
          onChange(imageData);
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Erro no upload",
        description: "Falha ao enviar arquivo",
        variant: "destructive"
      });
    }
  };

  const removeItem = (index: number, onChange: (value: any) => void, currentValue: any) => {
    if (multiple && Array.isArray(currentValue)) {
      const newValue = currentValue.filter((_, i) => i !== index);
      onChange(newValue);
    } else {
      onChange({ url: "", alt: "" }); // Clear both fields as requested
    }
  };

  const updateAltText = (index: number, newAlt: string, onChange: (value: any) => void, currentValue: any) => {
    if (multiple && Array.isArray(currentValue)) {
      const newValue = [...currentValue];
      newValue[index] = { ...newValue[index], alt: newAlt };
      onChange(newValue);
    } else if (currentValue) {
      onChange({ ...currentValue, alt: newAlt });
    }
  };

  const renderPreview = (value: ImageWithAlt, index: number, onChange: (value: any) => void, currentValue: any) => {
    if (!value || !value.url) return null;

    const hasAltError = requireAlt && !value.alt?.trim();

    return (
      <div key={index} className="space-y-2 p-3 border rounded-lg">
        <div className="relative group">
          <img
            src={value.url}
            alt={value.alt || "Preview"}
            className="w-20 h-20 object-cover rounded border"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeItem(index, onChange, currentValue)}
            >
              <X size={12} />
            </Button>
          )}
        </div>
        
        {requireAlt && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className={hasAltError ? "text-destructive" : ""}>
                Texto alternativo *
              </Label>
              <span className="text-xs text-muted-foreground">
                {(value.alt || "").length}/{maxAltLength}
              </span>
            </div>
            <Input
              value={value.alt || ""}
              onChange={(e) => {
                if (e.target.value.length <= maxAltLength) {
                  updateAltText(index, e.target.value, onChange, currentValue);
                }
              }}
              placeholder="Descreva a imagem"
              disabled={disabled}
              className={hasAltError ? "border-destructive" : ""}
              maxLength={maxAltLength}
            />
            {hasAltError && (
              <p className="text-xs text-destructive">Texto alternativo é obrigatório</p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            {/* Upload area */}
            <Card
              className={`
                relative cursor-pointer transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-dashed'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50'}
                ${className}
              `}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!disabled) {
                  handleFileSelect(e.dataTransfer.files, field.onChange, field.value);
                }
              }}
              onClick={() => !disabled && fileInputRef.current?.click()}
            >
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    <span className="text-sm">Enviando...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar ou arraste arquivos aqui
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Máximo {maxSize}MB • {accept}
                    </p>
                  </>
                )}
              </CardContent>
              
              <Input
                ref={fileInputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                disabled={disabled || uploading}
                onChange={(e) => handleFileSelect(e.target.files, field.onChange, field.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-invalid={!!fieldError}
                aria-describedby={description ? `${name}-description` : undefined}
                aria-required={required}
              />
            </Card>
            
            {/* Preview area */}
            {preview && field.value && (
              <div className="space-y-3">
                {multiple && Array.isArray(field.value) ? (
                  field.value.map((item, index) => renderPreview(item, index, field.onChange, field.value))
                ) : (
                  renderPreview(field.value, 0, field.onChange, field.value)
                )}
              </div>
            )}
          </div>
        )}
      />
      
      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
      
      {fieldError && (
        <div className="flex items-center gap-1 text-sm text-destructive" role="alert">
          <AlertCircle size={14} />
          {fieldError.message as string}
        </div>
      )}
    </div>
  );
}