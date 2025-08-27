import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileImage, Loader2 } from 'lucide-react';
import { createAdminSupabaseClient, getAdminEmail } from '@/lib/supabaseAdmin';
import { validateFile, generateFileName, getPublicUrl, type FileValidationOptions } from '@/utils/fileValidation';
import { useAdminToast } from '@/hooks/useAdminToast';

interface AdminFileUploadProps {
  bucket: 'events' | 'venues' | 'organizers' | 'posts' | 'highlights' | 'artists';
  onUploadComplete?: (url: string, fileName: string) => void;
  currentUrl?: string;
  label?: string;
  className?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export function AdminFileUpload({
  bucket,
  onUploadComplete,
  currentUrl,
  label = 'Upload de Imagem',
  className,
  maxSize,
  allowedTypes,
}: AdminFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useAdminToast();

  const validationOptions: FileValidationOptions = {
    bucket,
    maxSize,
    allowedTypes,
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file, validationOptions);
    if (!validation.isValid) {
      showError(new Error(validation.error!));
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file - VERSÃO COM LOGS DETALHADOS
    setUploading(true);
    try {
      console.log('[ADMIN FILE UPLOAD] ====== INICIANDO UPLOAD ======');
      console.log('[ADMIN FILE UPLOAD] File:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      const fileName = generateFileName(file.name, bucket);
      console.log('[ADMIN FILE UPLOAD] Generated filename:', fileName);
      
      // Get admin email and create admin client
      const adminEmail = getAdminEmail();
      console.log('[ADMIN FILE UPLOAD] Admin email obtido:', adminEmail);
      
      if (!adminEmail) {
        console.error('[ADMIN FILE UPLOAD] Email do admin não encontrado');
        throw new Error('Email do admin não encontrado. Faça login novamente.');
      }
      
      // Verificar se admin é válido antes de tentar upload
      if (!adminEmail.includes('@')) {
        console.error('[ADMIN FILE UPLOAD] Email do admin inválido:', adminEmail);
        throw new Error('Email do admin inválido. Faça login novamente.');
      }
      
      console.log('[ADMIN FILE UPLOAD] Criando client admin...');
      const adminClient = createAdminSupabaseClient(adminEmail);
      
      console.log('[ADMIN FILE UPLOAD] ====== EXECUTANDO UPLOAD ======');
      console.log('[ADMIN FILE UPLOAD] Bucket:', bucket);
      console.log('[ADMIN FILE UPLOAD] Filename:', fileName);
      console.log('[ADMIN FILE UPLOAD] Admin email:', adminEmail);
      console.log('[ADMIN FILE UPLOAD] Expected path will be:', `/${bucket}/${fileName}`);
      
      // Debug específico para organizadores
      if (bucket === 'organizers') {
        console.log('[ORGANIZERS DEBUG] ✅ Bucket correto identificado: organizers');
        console.log('[ORGANIZERS DEBUG] ✅ Admin email válido:', adminEmail);
        console.log('[ORGANIZERS DEBUG] ✅ Filename sendo usado:', fileName);
      }
      
      const uploadOptions = {
        cacheControl: '3600',
        upsert: false,
        headers: {
          'x-admin-email': adminEmail
        }
      };
      
      console.log('[ADMIN FILE UPLOAD] Upload options:', uploadOptions);
      
      const { data, error } = await adminClient.storage
        .from(bucket)
        .upload(fileName, file, uploadOptions);

      if (error) {
        console.error('[ADMIN FILE UPLOAD] ====== UPLOAD ERROR ======');
        console.error('[ADMIN FILE UPLOAD] Error details:', error);
        console.error('[ADMIN FILE UPLOAD] Error message:', error.message);
        console.error('[ADMIN FILE UPLOAD] Bucket usado:', bucket);
        console.error('[ADMIN FILE UPLOAD] Admin client headers:', uploadOptions.headers);
        
        // Debug específico para erro RLS de organizadores
        if (bucket === 'organizers' && error.message?.includes('row-level security')) {
          console.error('[ORGANIZERS DEBUG] ❌ RLS ERROR DETECTED!');
          console.error('[ORGANIZERS DEBUG] ❌ Admin email being sent:', adminEmail);
          console.error('[ORGANIZERS DEBUG] ❌ Expected bucket path: /organizers/');
          console.error('[ORGANIZERS DEBUG] ❌ Actual upload path from error: Check network tab for actual path');
        }
        
        throw error;
      }

      console.log('[ADMIN FILE UPLOAD] ====== UPLOAD SUCCESS ======');
      console.log('[ADMIN FILE UPLOAD] Upload data:', data);
      console.log('[ADMIN FILE UPLOAD] File path:', data.path);
      
      const publicUrl = getPublicUrl(bucket, data.path);
      console.log('[ADMIN FILE UPLOAD] Public URL gerada:', publicUrl);
      
      onUploadComplete?.(publicUrl, data.path);
      showSuccess('Arquivo enviado com sucesso!');
      
    } catch (error: any) {
      console.error('[ADMIN FILE UPLOAD] ====== UPLOAD FAILED ======');
      console.error('[ADMIN FILE UPLOAD] Error objeto completo:', error);
      console.error('[ADMIN FILE UPLOAD] Error message:', error.message);
      console.error('[ADMIN FILE UPLOAD] Error stack:', error.stack);
      showError(error, 'Erro ao fazer upload do arquivo');
      setPreview(currentUrl || null);
    } finally {
      setUploading(false);
      console.log('[ADMIN FILE UPLOAD] ====== UPLOAD FINALIZADO ======');
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete?.('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <Label className="text-sm font-medium">{label}</Label>
      
      <Card className="mt-2">
        <CardContent className="p-4">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={triggerFileInput}
            >
              <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Clique para selecionar uma imagem
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP ou GIF até 50MB
              </p>
            </div>
          )}

          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {!preview && (
            <Button
              onClick={triggerFileInput}
              disabled={uploading}
              className="w-full mt-4"
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}