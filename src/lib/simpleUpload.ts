import { supabase } from "@/integrations/supabase/client";

// Função robusta para upload de imagens com callback de progresso
export async function uploadImage(
  file: File, 
  folder: string = 'highlights',
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!file) throw new Error('Arquivo não fornecido');
  
  // Validação básica
  if (!file.type.startsWith('image/')) {
    throw new Error('Arquivo deve ser uma imagem');
  }
  
  if (file.size > 5 * 1024 * 1024) { // 5MB
    throw new Error('Arquivo muito grande (máximo 5MB)');
  }
  
  // Nome único para o arquivo
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const path = `${folder}/${fileName}`;
  
  // Simular progresso durante o upload
  onProgress?.(20);
  
  // Upload para o bucket correto (highlights)
  const { error: uploadError } = await supabase.storage
    .from('highlights')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });
  
  onProgress?.(80);
  
  if (uploadError) {
    throw new Error(`Falha no upload: ${uploadError.message}`);
  }
  
  // Obter URL pública do bucket highlights
  const { data: urlData } = supabase.storage
    .from('highlights')
    .getPublicUrl(path);
  
  onProgress?.(100);
  return urlData.publicUrl;
}