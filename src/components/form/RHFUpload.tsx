"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RHFUploadProps {
  name: string;
  bucket: string;
  label?: string;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export default function RHFUpload({
  name,
  bucket,
  label,
  disabled,
  accept = "image/*",
  maxSizeMB = 5,
  className,
}: RHFUploadProps) {
  const [uploading, setUploading] = useState(false);
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const fieldError = errors[name];

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      
      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`);
        return null;
      }

      // Check admin email for debugging
      const adminEmail = localStorage.getItem('admin_email');
      if (!adminEmail) {
        console.warn('Admin email not found in localStorage');
        toast.error('Erro de autenticação: admin não identificado');
        return null;
      }

      console.log("Uploading file:", file.name, "to bucket:", bucket, "as admin:", adminEmail);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage with admin email header
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          headers: {
            'x-admin-email': adminEmail
          }
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message?.includes('denied')) {
          toast.error('Erro de permissão: verifique se você está logado como admin');
        } else {
          toast.error(`Erro no upload: ${uploadError.message}`);
        }
        return null;
      }

      // Get public URL
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log("Upload successful, public URL:", data.publicUrl);
      toast.success("Arquivo enviado com sucesso!");
      return data.publicUrl;

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error("Erro inesperado no upload");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (
    file: File | undefined,
    onChange: (url: string | null) => void
  ) => {
    if (!file) {
      onChange(null);
      return;
    }

    const url = await uploadFile(file);
    onChange(url);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={fieldError ? "text-destructive" : ""}>
          {label}
        </Label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            {/* Upload Input */}
            <div className={`border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 ${className}`}>
              <div className="text-center">
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <Input
                      id={name}
                      type="file"
                      accept={accept}
                      disabled={disabled || uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleFileChange(file, field.onChange);
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById(name)?.click()}
                      disabled={disabled || uploading}
                    >
                      Selecionar arquivo
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      Máximo {maxSizeMB}MB. {accept}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            {field.value && (
              <div className="relative">
                <div className="border rounded-lg p-3 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {accept.includes('image') && (
                        <img
                          src={field.value}
                          alt="Preview"
                          className="h-12 w-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium">Arquivo enviado</p>
                        <p className="text-xs text-muted-foreground">
                          {field.value.split('/').pop()}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => field.onChange(null)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      />
      
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.message as string}
        </p>
      )}
    </div>
  );
}