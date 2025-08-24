import { supabase } from "@/integrations/supabase/client";

export async function uploadPartnerLogo(file: File, partnerId?: string): Promise<string> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato de arquivo inválido. Use JPEG, JPG, PNG ou WebP.');
  }

  // Validate file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. O tamanho máximo é 5MB.');
  }

  // Generate file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${partnerId || Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `logos/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from('partner-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Erro no upload: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('partner-logos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export async function deletePartnerLogo(imageUrl: string) {
  try {
    // Extract path from URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.findIndex(part => part === 'partner-logos');
    
    if (bucketIndex === -1) return;
    
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    const { error } = await supabase.storage
      .from('partner-logos')
      .remove([filePath]);

    if (error) {
      console.error('Erro ao deletar imagem:', error);
    }
  } catch (error) {
    console.error('Erro ao processar URL da imagem:', error);
  }
}