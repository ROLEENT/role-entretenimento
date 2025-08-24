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
  const ext = file.name.split('.').pop();
  const path = `highlight-${keyHint}-${Date.now()}.${ext || 'jpg'}`;
  const { error: upErr } = await supabase.storage.from('highlights').upload(path, file, { upsert: true });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from('highlights').getPublicUrl(path);
  return data.publicUrl;
}