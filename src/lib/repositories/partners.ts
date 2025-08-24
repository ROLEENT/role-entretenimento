// src/lib/repositories/partners.ts
import { supabase } from "@/integrations/supabase/client";

export async function listPartners({ q, city, active, page = 1, pageSize = 10 }: any) {
  let query = (supabase as any).from('partners').select('*', { count: 'exact' }).order('created_at', { ascending: false });
  if (q) query = query.ilike('name', `%${q}%`);
  if (city) query = query.eq('city', city);
  if (active !== undefined) query = query.eq('is_active', active);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return { data, count };
}

export async function getPartner(id: string) {
  const { data, error } = await (supabase as any).from('partners').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertPartner(payload: any) {
  const { data, error } = await (supabase as any).from('partners').upsert(payload).select().maybeSingle();
  if (error) throw error;
  return data;
}

export async function deletePartner(id: string) {
  const { error } = await (supabase as any).from('partners').delete().eq('id', id);
  if (error) throw error;
}

export async function togglePartnerActive(id: string, is_active: boolean) {
  const { data, error } = await (supabase as any).from('partners').update({ is_active }).eq('id', id).select().maybeSingle();
  if (error) throw error;
  return data;
}