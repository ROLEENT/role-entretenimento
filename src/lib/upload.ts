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