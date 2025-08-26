import { supabase } from "@/integrations/supabase/client";

// Função robusta para upload de imagens com retry e validação melhorada
export async function uploadImage(
  file: File, 
  folder: string = 'highlights',
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!file) throw new Error('Arquivo não fornecido');
  
  // Validação melhorada
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB
    throw new Error('Arquivo muito grande (máximo 10MB)');
  }
  
  // Nome único para o arquivo
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
  const path = `${folder}/${fileName}`;
  
  // Simular progresso durante o upload
  onProgress?.(20);
  
  // Upload com retry automático
  let uploadError: any = null;
  let retries = 3;
  
  while (retries > 0) {
    try {
      const { error } = await supabase.storage
        .from('highlights')
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: true, // Permite substituir se já existir
        });
      
      if (!error) {
        uploadError = null;
        break;
      }
      
      uploadError = error;
      retries--;
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    } catch (error) {
      uploadError = error;
      retries--;
    }
  }
  
  onProgress?.(80);
  
  if (uploadError) {
    throw new Error(`Falha no upload após tentativas: ${uploadError.message}`);
  }
  
  // Obter URL pública do bucket highlights
  const { data: urlData } = supabase.storage
    .from('highlights')
    .getPublicUrl(path);
  
  if (!urlData.publicUrl) {
    throw new Error('Erro ao gerar URL pública da imagem');
  }
  
  onProgress?.(100);
  return urlData.publicUrl;
}