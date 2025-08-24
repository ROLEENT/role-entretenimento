// src/lib/repositories/advertisements.ts
import { supabase } from "@/integrations/supabase/client";

export async function listAdvertisements({ q, status, partnerId, from, to, page = 1, pageSize = 10 }: any) {
  let query = (supabase as any).from('advertisements').select('*, partners(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false });
  if (q) query = query.ilike('title', `%${q}%`);
  if (status) query = query.eq('status', status);
  if (partnerId) query = query.eq('partner_id', partnerId);
  if (from) query = query.gte('start_date', from);
  if (to) query = query.lte('end_date', to);
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  const { data, error, count } = await query.range(start, end);
  if (error) throw error;
  return { data, count };
}

export async function getAdvertisement(id: string) {
  const { data, error } = await (supabase as any).from('advertisements').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertAdvertisement(payload: any) {
  const { data, error } = await (supabase as any).from('advertisements').upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteAdvertisement(id: string) {
  const { error } = await (supabase as any).from('advertisements').delete().eq('id', id);
  if (error) throw error;
}

export async function updateAdStatus(id: string, status: string) {
  const { data, error } = await (supabase as any).from('advertisements').update({ status }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
}