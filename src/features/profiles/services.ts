import { supabase } from "@/integrations/supabase/client";
import { uploadAvatar, uploadCover } from "@/lib/storage";

export interface CreateProfileData {
  type: 'artista' | 'local' | 'organizador';
  handle: string;
  name: string;
  city: string;
  state: string;
  country: string;
  bio_short: string;
  bio?: string;
  tags?: string[];
  links?: Array<{ type: string; url: string }>;
  contact_email?: string;
  contact_phone?: string;
  visibility: 'public' | 'draft' | 'private';
  avatar_file?: File;
  cover_file?: File;
  
  // Campos específicos por tipo
  [key: string]: any;
}

export async function createProfile(data: CreateProfileData): Promise<string> {
  const { avatar_file, cover_file, ...profileData } = data;

  // 1. Criar perfil base
  const { data: profile, error: profileError } = await supabase
    .from('entity_profiles')
    .insert({
      type: profileData.type,
      handle: profileData.handle.toLowerCase(),
      name: profileData.name,
      city: profileData.city,
      state: profileData.state,
      country: profileData.country,
      bio_short: profileData.bio_short,
      bio: profileData.bio || null,
      tags: profileData.tags || [],
      links: profileData.links || [],
      contact_email: profileData.contact_email || null,
      contact_phone: profileData.contact_phone || null,
      visibility: profileData.visibility
    })
    .select('id')
    .single();

  if (profileError) throw profileError;

  const profileId = profile.id;

  // 2. Upload de imagens
  let avatar_url, cover_url;
  try {
    if (avatar_file) {
      avatar_url = await uploadAvatar(profileId, avatar_file);
    }
    if (cover_file) {
      cover_url = await uploadCover(profileId, cover_file);
    }
    
    // Atualizar URLs das imagens
    if (avatar_url || cover_url) {
      await supabase
        .from('entity_profiles')
        .update({ 
          avatar_url: avatar_url || null, 
          cover_url: cover_url || null 
        })
        .eq('id', profileId);
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    // Continuar sem as imagens se houver erro
  }

  // 3. Inserir dados específicos do tipo
  if (profileData.type === 'artista') {
    await supabase.from('profile_artist').insert({
      profile_id: profileId,
      genres: profileData.genres || [],
      agency: profileData.agency || null,
      touring_city: profileData.touring_city || null,
      fee_band: profileData.fee_band || null,
      rider_url: profileData.rider_url || null,
      stageplot_url: profileData.stageplot_url || null,
      presskit_url: profileData.presskit_url || null,
      spotify_id: profileData.spotify_id || null,
      soundcloud_url: profileData.soundcloud_url || null,
      youtube_url: profileData.youtube_url || null,
      pronoun: profileData.pronoun || null
    });
  } else if (profileData.type === 'local') {
    await supabase.from('profile_venue').insert({
      profile_id: profileId,
      address: profileData.address || null,
      lat: profileData.lat || null,
      lon: profileData.lon || null,
      place_id: profileData.place_id || null,
      capacity: profileData.capacity,
      hours: profileData.hours || null,
      price_range: profileData.price_range || null,
      accessibility: profileData.accessibility || null,
      age_policy: profileData.age_policy,
      sound_gear: profileData.sound_gear || null,
      cnpj: profileData.cnpj || null
    });
  } else if (profileData.type === 'organizador') {
    await supabase.from('profile_org').insert({
      profile_id: profileId,
      brand_name: profileData.brand_name || null,
      cnpj: profileData.cnpj || null,
      manager_name: profileData.manager_name || null,
      manager_email: profileData.manager_email || null,
      manager_phone: profileData.manager_phone || null,
      cities: profileData.cities || null,
      about: profileData.about || null
    });
  }

  return profileId;
}

export async function followProfile(profileId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('followers')
    .insert({ profile_id: profileId, user_id: userId });
  
  if (error) throw error;
}

export async function unfollowProfile(profileId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('profile_id', profileId)
    .eq('user_id', userId);
  
  if (error) throw error;
}

export async function checkHandleAvailability(handle: string): Promise<boolean> {
  const { data } = await supabase
    .from('entity_profiles')
    .select('id')
    .eq('handle', handle.toLowerCase())
    .maybeSingle();
  
  return !data; // true se disponível
}

export async function getProfileByHandle(handle: string) {
  const { data: profile, error } = await supabase
    .from('entity_profiles')
    .select(`
      *,
      profile_artist(*),
      profile_venue(*),
      profile_org(*)
    `)
    .eq('handle', handle.toLowerCase())
    .single();

  if (error) throw error;
  return profile;
}