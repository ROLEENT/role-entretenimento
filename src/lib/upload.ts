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

export async function uploadHighlightImage(file: File, keyHint: string) {
  console.log('📤 STORAGE DEBUG: Iniciando upload para bucket highlights:', {
    fileName: file.name,
    fileSize: file.size,
    keyHint
  });
  
  const ext = file.name.split('.').pop();
  const path = `highlight-${keyHint}-${Date.now()}.${ext || 'jpg'}`;
  
  console.log('📂 STORAGE DEBUG: Caminho do arquivo:', path);
  
  const { error: upErr } = await supabase.storage.from('highlights').upload(path, file, { upsert: true });
  
  if (upErr) {
    console.error('❌ STORAGE DEBUG: Erro no upload:', upErr);
    throw upErr;
  }
  
  console.log('✅ STORAGE DEBUG: Upload realizado com sucesso');
  
  const { data } = supabase.storage.from('highlights').getPublicUrl(path);
  
  console.log('🔗 STORAGE DEBUG: URL pública gerada:', data.publicUrl);
  
  return data.publicUrl;
}