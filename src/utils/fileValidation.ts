// File validation utilities for admin uploads

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  bucket: 'events' | 'venues' | 'organizers' | 'posts' | 'highlights';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB
const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function validateFile(file: File, options: FileValidationOptions): ValidationResult {
  const { maxSize = DEFAULT_MAX_SIZE, allowedTypes = DEFAULT_ALLOWED_TYPES } = options;

  // Check file size
  if (file.size > maxSize) {
    const sizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      isValid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${sizeMB}MB`
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    const allowedExtensions = allowedTypes
      .map(type => type.split('/')[1])
      .join(', ');
    return {
      isValid: false,
      error: `Tipo de arquivo não permitido. Tipos aceitos: ${allowedExtensions}`
    };
  }

  // Check file name
  if (!file.name || file.name.length > 255) {
    return {
      isValid: false,
      error: 'Nome do arquivo inválido'
    };
  }

  return { isValid: true };
}

export function generateFileName(originalName: string, bucket: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  
  return `${bucket}/${timestamp}-${randomStr}.${extension}`;
}

export function getPublicUrl(filePath: string): string {
  const supabaseUrl = "https://nutlcbnruabjsxecqpnd.supabase.co";
  return `${supabaseUrl}/storage/v1/object/public/${filePath}`;
}