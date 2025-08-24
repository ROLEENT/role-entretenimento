import { supabase } from "@/integrations/supabase/client";

export interface Partner {
  id: string;
  name: string;
  location: string;
  image_url?: string;
  rating?: number;
  capacity?: string;
  types?: string[];
  contact_email?: string;
  website?: string;
  instagram?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerFilters {
  name?: string;
  location?: string;
  featured?: boolean;
}

export interface PartnerFormData {
  name: string;
  location: string;
  image_url?: string;
  rating?: number;
  capacity?: string;
  types?: string[];
  contact_email?: string;
  website?: string;
  instagram?: string;
  featured: boolean;
}

export async function listPartners(filters?: PartnerFilters, page = 1, limit = 10) {
  let query = supabase
    .from('partners')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.name) {
    query = query.ilike('name', `%${filters.name}%`);
  }

  if (filters?.location) {
    query = query.ilike('location', `%${filters.location}%`);
  }

  if (filters?.featured !== undefined) {
    query = query.eq('featured', filters.featured);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  return {
    data: data as Partner[],
    count: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page
  };
}

export async function getPartner(id: string) {
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Partner;
}

export async function upsertPartner(partner: Partial<PartnerFormData> & { id?: string }) {
  // Ensure required fields are present
  const partnerData = {
    name: partner.name || '',
    location: partner.location || '',
    ...partner
  };

  const { data, error } = await supabase
    .from('partners')
    .upsert(partnerData)
    .select()
    .single();

  if (error) throw error;
  return data as Partner;
}

export async function deletePartner(id: string) {
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function togglePartnerFeatured(id: string, featured: boolean) {
  const { data, error } = await supabase
    .from('partners')
    .update({ featured })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Partner;
}