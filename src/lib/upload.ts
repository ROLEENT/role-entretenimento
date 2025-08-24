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

  console.log('📤 STORAGE DEBUG: Iniciando upload para bucket blog-images:', {
    fileName: file.name,
    fileSize: file.size,
    city,
    slug,
    path
  });

  const { error: upErr } = await supabase.storage
    .from('blog-images')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    });

  if (upErr) {
    console.error('❌ STORAGE DEBUG: Erro no upload:', upErr);
    throw upErr;
  }

  console.log('✅ STORAGE DEBUG: Upload realizado com sucesso');

  const { data: pub } = supabase.storage
    .from('blog-images')
    .getPublicUrl(path);

  console.log('🔗 STORAGE DEBUG: URL pública gerada:', pub.publicUrl);

  return pub.publicUrl;
}

// Manter função legada para compatibilidade
export async function uploadHighlightImage(file: File, keyHint: string) {
  console.log('⚠️ DEPRECATED: Usando função legada uploadHighlightImage, migre para uploadCoverToStorage');
  
  const ext = file.name.split('.').pop();
  const path = `highlight-${keyHint}-${Date.now()}.${ext || 'jpg'}`;
  
  const { error: upErr } = await supabase.storage.from('highlights').upload(path, file, { upsert: true });
  
  if (upErr) {
    console.error('❌ STORAGE DEBUG: Erro no upload:', upErr);
    throw upErr;
  }
  
  const { data } = supabase.storage.from('highlights').getPublicUrl(path);
  
  return data.publicUrl;
}