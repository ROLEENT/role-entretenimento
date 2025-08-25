// src/lib/upload.ts
import { supabase } from "@/integrations/supabase/client";

export async function uploadPartnerLogo(file: File, keyHint: string) {
  const ext = file.name.split('.').pop();
  const path = `partner-${keyHint}-${Date.now()}.${ext || 'png'}`;
  const { error: upErr } = await supabase.storage.from('partners-logos').upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('partners-logos').getPublicUrl(path);
  return data.publicUrl;
}

// Função para gerar slug seguro para arquivos
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .trim()
    .slice(0, 50); // Limita tamanho
}

export async function uploadCoverToStorage(file: File, city: string, slug: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `covers/${city}/${Date.now()}-${slug}.${ext}`;

  // Upload process started

  const { error: upErr } = await supabase.storage
    .from('blog-images')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (upErr) {
    throw upErr;
  }

  const { data: pub } = supabase.storage
    .from('blog-images')
    .getPublicUrl(path);

  return pub.publicUrl;
}

// Função robusta para upload de imagens de destaques
export async function uploadHighlightImage(file: File, keyHint: string): Promise<string> {
  try {
    // Validar arquivo
    if (!file) {
      throw new Error('Nenhum arquivo fornecido');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('Arquivo muito grande. Máximo 10MB.');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de arquivo não permitido. Use JPG, PNG ou WEBP.');
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const sanitizedKeyHint = keyHint.replace(/[^a-zA-Z0-9]/g, '');
    const path = `highlights/${sanitizedKeyHint}-${Date.now()}.${ext}`;
    
    // Starting highlight image upload

    // Primeiro, tentar remover arquivo existente se houver
    try {
      await supabase.storage.from('highlights').remove([path]);
    } catch (removeError) {
      // File didn't exist, continue
    }

    // Upload do arquivo
    const { error: upErr, data: uploadData } = await supabase.storage
      .from('highlights')
      .upload(path, file, { 
        cacheControl: '3600',
        contentType: file.type,
        upsert: true,
      });
    
    if (upErr) {
      throw new Error(`Erro no upload: ${upErr.message}`);
    }
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('highlights')
      .getPublicUrl(path);
    
    if (!urlData?.publicUrl) {
      throw new Error('Erro ao gerar URL pública da imagem');
    }
    
    return urlData.publicUrl;
    
  } catch (error) {
    throw error;
  }
}