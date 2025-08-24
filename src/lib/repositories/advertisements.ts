import { supabase } from '@/integrations/supabase/client';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  cta_text: string;
  cta_url?: string;
  badge_text?: string;
  gradient_from: string;
  gradient_to: string;
  type: string;
  position: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdvertisementFilters {
  search?: string;
  type?: string;
  active?: boolean | null;
}

export interface AdvertisementData {
  title: string;
  description?: string;
  image_url?: string;
  cta_text: string;
  cta_url?: string;
  badge_text?: string;
  gradient_from: string;
  gradient_to: string;
  type: string;
  position: number;
  active: boolean;
}

export const listAdvertisements = async (filters: AdvertisementFilters = {}) => {
  let query = supabase
    .from('advertisements')
    .select('*')
    .order('position', { ascending: true });

  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.active !== null && filters.active !== undefined) {
    query = query.eq('active', filters.active);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Erro ao buscar anúncios: ${error.message}`);
  }

  return data as Advertisement[];
};

export const getAdvertisement = async (id: string) => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Erro ao buscar anúncio: ${error.message}`);
  }

  return data as Advertisement;
};

export const upsertAdvertisement = async (id: string | null, data: AdvertisementData) => {
  if (id) {
    // Update existing
    const { data: updated, error } = await supabase
      .from('advertisements')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar anúncio: ${error.message}`);
    }

    return updated as Advertisement;
  } else {
    // Create new
    const { data: created, error } = await supabase
      .from('advertisements')
      .insert([data])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar anúncio: ${error.message}`);
    }

    return created as Advertisement;
  }
};

export const deleteAdvertisement = async (id: string) => {
  const { error } = await supabase
    .from('advertisements')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Erro ao deletar anúncio: ${error.message}`);
  }
};

export const toggleAdvertisementActive = async (id: string, active: boolean) => {
  const { data, error } = await supabase
    .from('advertisements')
    .update({ active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao alterar status do anúncio: ${error.message}`);
  }

  return data as Advertisement;
};